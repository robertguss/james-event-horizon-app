/**
 * Pure injectable xAI / Grok socratic hint resolver.
 * No Convex imports — safe for unit tests and fixture mock wiring.
 */

import {
  buildGrokMessages,
  type GrokHintRequest,
  type GrokHintResponse,
} from "../grokPrompt";

export type { GrokHintRequest, GrokHintResponse };

export const XAI_CHAT_URL = "https://api.x.ai/v1/chat/completions";
export const DEFAULT_XAI_MODEL = "grok-3-mini";
export const DEFAULT_XAI_TIMEOUT_MS = 4000;

/** Parse OpenAI-style chat completion JSON for choices[0].message.content. */
export function extractChatContent(json: unknown): string | null {
  if (typeof json !== "object" || json === null) return null;
  const choices = (json as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return null;
  const first = choices[0];
  if (typeof first !== "object" || first === null) return null;
  const message = (first as { message?: unknown }).message;
  if (typeof message !== "object" || message === null) return null;
  const content = (message as { content?: unknown }).content;
  if (typeof content !== "string") return null;
  const trimmed = content.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function resolveSocraticHint(opts: {
  request: GrokHintRequest;
  staticFallbackText: string;
  apiKey: string | undefined;
  model?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}): Promise<GrokHintResponse> {
  const staticResult: GrokHintResponse = {
    text: opts.staticFallbackText,
    source: "static",
  };

  if (!opts.apiKey) {
    return staticResult;
  }

  const fetchImpl = opts.fetchImpl ?? fetch;
  const model = opts.model ?? DEFAULT_XAI_MODEL;
  const timeoutMs = opts.timeoutMs ?? DEFAULT_XAI_TIMEOUT_MS;
  const messages = buildGrokMessages(opts.request);

  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetchImpl(XAI_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${opts.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.4,
        max_tokens: 180,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return staticResult;
    }

    const json: unknown = await response.json();
    const text = extractChatContent(json);
    if (!text) {
      return staticResult;
    }

    return { text, source: "grok" };
  } catch {
    return staticResult;
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}
