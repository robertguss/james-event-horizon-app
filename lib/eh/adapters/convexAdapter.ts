import type { EhData } from "../types";

/**
 * Morning adapter stub. Overnight uses fixtureAdapter.
 * Wire to Convex API after Mac `VITE_EH_DATA=convex` flip.
 */
function morningOnly(): never {
  throw new Error("convexAdapter: use VITE_EH_DATA=fixture overnight");
}

export const convexAdapter: EhData = {
  mode: "convex",
  auth: {
    async getSession() {
      return morningOnly();
    },
    async selectKid() {
      return morningOnly();
    },
  },
  kids: {
    async list() {
      return morningOnly();
    },
    async get() {
      return morningOnly();
    },
    async create() {
      return morningOnly();
    },
  },
  missions: {
    async list() {
      return morningOnly();
    },
    async get() {
      return morningOnly();
    },
  },
  attempts: {
    async getActive() {
      return morningOnly();
    },
    async start() {
      return morningOnly();
    },
    async submitAnswer() {
      return morningOnly();
    },
    async requestHint() {
      // Morning (not wired overnight): api.hintRequests.requestHint({ attemptId, questionKey }).
      // Server loads question; xAI is internalAction only. Fixture path stays static.
      return morningOnly();
    },
    async complete() {
      return morningOnly();
    },
  },
  parent: {
    async verifyPin() {
      return morningOnly();
    },
    async setPin() {
      return morningOnly();
    },
    async progress() {
      return morningOnly();
    },
  },
  setup: {
    async complete() {
      // Morning: map to api.setup.completeOnboarding
      throw new Error("convexAdapter: morning only");
    },
  },
};
