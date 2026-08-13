/**
 * Authenticated public entry for socratic hints.
 *
 * Client may pass only attemptId + questionKey. Prompt / passage / choices /
 * static fallback are loaded server-side. xAI HTTP is an internalAction.
 *
 * Note: this is an action (not a mutation) so morning can await Grok HTTP
 * before returning. Auth is fail-closed via getUserIdentity.
 */

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import { HINT_CAPS, clampString } from "./lib/hintCaps";

export const requestHint = action({
  args: {
    attemptId: v.id("attempts"),
    questionKey: v.string(),
  },
  returns: v.object({
    step: v.number(),
    text: v.string(),
    source: v.union(v.literal("grok"), v.literal("static")),
    glowEvidenceIds: v.array(v.string()),
  }),
  handler: async (
    ctx,
    args,
  ): Promise<{
    step: number;
    text: string;
    source: "grok" | "static";
    glowEvidenceIds: string[];
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const questionKey = clampString(args.questionKey, HINT_CAPS.questionKey);
    if (questionKey.length === 0) {
      throw new Error("questionKey required");
    }

    const loaded: {
      step: number;
      questionPrompt: string;
      questionType: string;
      passageExcerpt: string;
      choiceTexts: string[];
      alreadyShownHintTexts: string[];
      staticFallbackText: string;
      correctEvidenceTexts: string[];
      glowEvidenceIds: string[];
    } = await ctx.runQuery(internal.hintContext.loadHintContext, {
      attemptId: args.attemptId,
      questionKey,
    });

    const hint: { text: string; source: "grok" | "static" } =
      await ctx.runAction(internal.hints.generateSocraticHint, {
        step: loaded.step,
        questionPrompt: loaded.questionPrompt,
        questionType: loaded.questionType,
        passageExcerpt: loaded.passageExcerpt,
        choiceTexts: loaded.choiceTexts,
        alreadyShownHintTexts: loaded.alreadyShownHintTexts,
        staticFallbackText: loaded.staticFallbackText,
        correctEvidenceTexts: loaded.correctEvidenceTexts,
      });

    await ctx.runMutation(internal.hintContext.recordHintEvent, {
      attemptId: args.attemptId,
      questionKey,
      step: loaded.step,
      source: hint.source,
      text: hint.text,
    });

    return {
      step: loaded.step,
      text: hint.text,
      source: hint.source,
      glowEvidenceIds: loaded.glowEvidenceIds,
    };
  },
});
