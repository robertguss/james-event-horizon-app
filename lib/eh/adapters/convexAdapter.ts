import type { EhData } from "../types";

/**
 * Morning adapter stub. Slice 1 overnight uses fixtureAdapter.
 * Wire to Convex API after Mac `VITE_EH_DATA=convex` flip.
 */
export const convexAdapter: EhData = {
  mode: "convex",
  auth: {
    async getSession() {
      throw new Error("convexAdapter: use VITE_EH_DATA=fixture overnight");
    },
    async selectKid() {
      throw new Error("convexAdapter: use VITE_EH_DATA=fixture overnight");
    },
  },
  kids: {
    async list() {
      throw new Error("convexAdapter: morning only");
    },
    async get() {
      throw new Error("convexAdapter: morning only");
    },
    async create() {
      throw new Error("convexAdapter: morning only");
    },
  },
  missions: {
    async list() {
      throw new Error("convexAdapter: morning only");
    },
    async get() {
      throw new Error("convexAdapter: morning only");
    },
  },
  attempts: {
    async getActive() {
      return null;
    },
  },
  parent: {
    async verifyPin() {
      throw new Error("convexAdapter: morning only");
    },
    async setPin() {
      throw new Error("convexAdapter: morning only");
    },
    async progress() {
      throw new Error("convexAdapter: morning only");
    },
  },
};
