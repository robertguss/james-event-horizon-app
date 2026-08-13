/**
 * Server-owned hint context load + persistence.
 * Clients never supply prompts, choices, excerpts, or fallbacks.
 */

import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { requireOwnedKid } from "./lib/parents";
import { HINT_CAPS, clampString, clampStringList } from "./lib/hintCaps";
import {
  correctEvidenceTexts,
  getMissionById,
  getQuestion,
  passageExcerptFor,
} from "./lib/missionCatalog";
import { glowIdsForHint } from "../lib/eh/pure/grade";

const hintSourceValidator = v.union(v.literal("static"), v.literal("grok"));

export const loadHintContext = internalQuery({
  args: {
    attemptId: v.id("attempts"),
    questionKey: v.string(),
  },
  returns: v.object({
    step: v.number(),
    questionPrompt: v.string(),
    questionType: v.string(),
    passageExcerpt: v.string(),
    choiceTexts: v.array(v.string()),
    alreadyShownHintTexts: v.array(v.string()),
    staticFallbackText: v.string(),
    correctEvidenceTexts: v.array(v.string()),
    glowEvidenceIds: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const questionKey = clampString(args.questionKey, HINT_CAPS.questionKey);
    if (questionKey.length === 0) {
      throw new Error("questionKey required");
    }

    const attempt = await ctx.db.get("attempts", args.attemptId);
    if (!attempt) {
      throw new Error("Attempt not found");
    }
    if (attempt.status !== "active") {
      throw new Error("Attempt already completed");
    }

    await requireOwnedKid(ctx, attempt.kidId);

    const mission = getMissionById(attempt.missionId);
    if (!mission) {
      throw new Error("Mission not found");
    }
    const question = getQuestion(mission, questionKey);
    if (!question) {
      throw new Error("Question not found");
    }

    const prior = attempt.hintsByQuestionKey[questionKey] ?? 0;
    const step = Math.min(4, prior + 1);
    const staticFallbackText =
      question.hints[step - 1] ?? question.hints[3] ?? "";
    const alreadyShown = question.hints.slice(0, step - 1);

    return {
      step,
      questionPrompt: clampString(question.prompt, HINT_CAPS.questionPrompt),
      questionType: question.type,
      passageExcerpt: clampString(
        passageExcerptFor(mission),
        HINT_CAPS.passageExcerpt,
      ),
      choiceTexts: clampStringList(
        (question.choices ?? []).map((c) => c.text),
        HINT_CAPS.maxChoices,
        HINT_CAPS.choiceText,
      ),
      alreadyShownHintTexts: clampStringList(
        alreadyShown,
        HINT_CAPS.maxAlreadyShown,
        HINT_CAPS.alreadyShownHint,
      ),
      staticFallbackText: clampString(
        staticFallbackText,
        HINT_CAPS.staticFallback,
      ),
      correctEvidenceTexts: clampStringList(
        correctEvidenceTexts(mission, question),
        8,
        HINT_CAPS.evidenceSentence,
      ),
      glowEvidenceIds: glowIdsForHint(question, step),
    };
  },
});

export const recordHintEvent = internalMutation({
  args: {
    attemptId: v.id("attempts"),
    questionKey: v.string(),
    step: v.number(),
    source: hintSourceValidator,
    text: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const attempt = await ctx.db.get("attempts", args.attemptId);
    if (!attempt) {
      throw new Error("Attempt not found");
    }
    if (attempt.status !== "active") {
      throw new Error("Attempt already completed");
    }

    await requireOwnedKid(ctx, attempt.kidId);

    const questionKey = clampString(args.questionKey, HINT_CAPS.questionKey);
    const step = Math.min(4, Math.max(1, Math.floor(args.step)));

    await ctx.db.patch("attempts", args.attemptId, {
      hintsByQuestionKey: {
        ...attempt.hintsByQuestionKey,
        [questionKey]: step,
      },
    });

    await ctx.db.insert("hintEvents", {
      attemptId: args.attemptId,
      questionKey,
      step,
      source: args.source,
      text: clampString(args.text, HINT_CAPS.staticFallback),
      createdAt: Date.now(),
    });

    return null;
  },
});
