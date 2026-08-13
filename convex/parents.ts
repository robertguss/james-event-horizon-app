import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireParent } from "./lib/parents";
import { verifyPin as verifyPinHash } from "./lib/pin";

export const verifyPin = mutation({
  args: {
    pin: v.string(),
  },
  returns: v.object({
    ok: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const parent = await requireParent(ctx);
    const ok = await verifyPinHash(args.pin, parent.pinHash);
    return { ok };
  },
});
