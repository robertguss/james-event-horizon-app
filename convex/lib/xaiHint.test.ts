import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_XAI_MODEL,
  XAI_CHAT_URL,
  extractChatContent,
  resolveSocraticHint,
} from "./xaiHint";
import type { GrokHintRequest } from "../grokPrompt";

const request: GrokHintRequest = {
  step: 1,
  questionPrompt: "Which sentence shows when the dust storm first appeared?",
  questionType: "locate",
  passageExcerpt: "Then a wall of dust rose in the distance.",
  choiceTexts: [],
  alreadyShownHintTexts: [],
};

const FALLBACK = "Look near the beginning — something in the sky changes.";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("extractChatContent", () => {
  it("reads OpenAI-style choices[0].message.content", () => {
    expect(
      extractChatContent({
        choices: [{ message: { content: "  Reread the start.  " } }],
      }),
    ).toBe("Reread the start.");
  });

  it("returns null for empty or malformed payloads", () => {
    expect(extractChatContent(null)).toBeNull();
    expect(extractChatContent({})).toBeNull();
    expect(
      extractChatContent({ choices: [{ message: { content: "   " } }] }),
    ).toBeNull();
  });
});

describe("resolveSocraticHint", () => {
  it("returns static when apiKey is unset", async () => {
    const fetchImpl = vi.fn();
    const result = await resolveSocraticHint({
      request,
      staticFallbackText: FALLBACK,
      apiKey: undefined,
      fetchImpl,
    });
    expect(result).toEqual({ text: FALLBACK, source: "static" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns grok source + body text on mock success", async () => {
    const fake = "Look for where the sky changes near the start.";
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: fake } }],
      }),
    });

    const result = await resolveSocraticHint({
      request,
      staticFallbackText: FALLBACK,
      apiKey: "test-key",
      fetchImpl,
    });

    expect(result).toEqual({ text: fake, source: "grok" });
    expect(fetchImpl).toHaveBeenCalledOnce();
    const [url, init] = fetchImpl.mock.calls[0] as [
      string,
      RequestInit & { body: string },
    ];
    expect(url).toBe(XAI_CHAT_URL);
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({
      Authorization: "Bearer test-key",
    });
    const body = JSON.parse(init.body) as {
      model: string;
      temperature: number;
      max_tokens: number;
    };
    expect(body.model).toBe(DEFAULT_XAI_MODEL);
    expect(body.temperature).toBe(0.4);
    expect(body.max_tokens).toBe(180);
  });

  it("falls back to static when fetch throws", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("network down"));
    const result = await resolveSocraticHint({
      request,
      staticFallbackText: FALLBACK,
      apiKey: "test-key",
      fetchImpl,
    });
    expect(result).toEqual({ text: FALLBACK, source: "static" });
  });

  it("falls back to static on timeout (never-resolving fetch)", async () => {
    const fetchImpl = vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        }),
    );

    const result = await resolveSocraticHint({
      request,
      staticFallbackText: FALLBACK,
      apiKey: "test-key",
      timeoutMs: 20,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(result).toEqual({ text: FALLBACK, source: "static" });
  });

  it("falls back to static on empty content", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "   " } }],
      }),
    });
    const result = await resolveSocraticHint({
      request,
      staticFallbackText: FALLBACK,
      apiKey: "test-key",
      fetchImpl,
    });
    expect(result).toEqual({ text: FALLBACK, source: "static" });
  });

  it("falls back to static on HTTP 500", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });
    const result = await resolveSocraticHint({
      request,
      staticFallbackText: FALLBACK,
      apiKey: "test-key",
      fetchImpl,
    });
    expect(result).toEqual({ text: FALLBACK, source: "static" });
  });
});
