"use node";

/**
 * Grok socratic hint action (server-side only).
 *
 * Convex env:
 * - `XAI_API_KEY` (required for Grok) — from xAI console
 * - `XAI_MODEL` (optional) — default `grok-3-mini` via DEFAULT_XAI_MODEL
 *
 * Overnight: leave `XAI_API_KEY` unset → static fallback only.
 */

import { v } from "convex/values";
import { action } from "./_generated/server";
import {
  DEFAULT_XAI_MODEL,
  resolveSocraticHint,
} from "./lib/xaiHint";

export const getSocraticHint = action({
  args: {
    step: v.number(),
    questionPrompt: v.string(),
    questionType: v.string(),
    passageExcerpt: v.string(),
    choiceTexts: v.array(v.string()),
    alreadyShownHintTexts: v.array(v.string()),
    staticFallbackText: v.string(),
  },
  returns: v.object({
    text: v.string(),
    source: v.union(v.literal("grok"), v.literal("static")),
  }),
  handler: async (_ctx, args) => {
    // Default model is grok-3-mini via XAI_MODEL env or DEFAULT_XAI_MODEL.
    const apiKey = process.env.XAI_API_KEY;
    const model = process.env.XAI_MODEL ?? DEFAULT_XAI_MODEL;

    return await resolveSocraticHint({
      request: {
        step: args.step,
        questionPrompt: args.questionPrompt,
        questionType: args.questionType,
        passageExcerpt: args.passageExcerpt,
        choiceTexts: args.choiceTexts,
        alreadyShownHintTexts: args.alreadyShownHintTexts,
      },
      staticFallbackText: args.staticFallbackText,
      apiKey,
      model,
    });
  },
});
