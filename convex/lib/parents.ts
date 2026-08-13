import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type Ctx = QueryCtx | MutationCtx;

export async function requireIdentitySubject(ctx: Ctx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity.subject;
}

export async function getParentByClerkUserId(
  ctx: Ctx,
  clerkUserId: string,
): Promise<Doc<"parents"> | null> {
  return await ctx.db
    .query("parents")
    .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
    .unique();
}

export async function requireParent(ctx: Ctx): Promise<Doc<"parents">> {
  const clerkUserId = await requireIdentitySubject(ctx);
  const parent = await getParentByClerkUserId(ctx, clerkUserId);
  if (!parent) {
    throw new Error("Parent profile not found");
  }
  return parent;
}

export async function getKidForParent(
  ctx: Ctx,
  parentId: Id<"parents">,
): Promise<Doc<"kids"> | null> {
  return await ctx.db
    .query("kids")
    .withIndex("by_parentId", (q) => q.eq("parentId", parentId))
    .unique();
}

export async function requireOwnedKid(
  ctx: Ctx,
  kidId: Id<"kids">,
): Promise<{ parent: Doc<"parents">; kid: Doc<"kids"> }> {
  const parent = await requireParent(ctx);
  const kid = await ctx.db.get("kids", kidId);
  if (!kid) {
    throw new Error("Kid not found");
  }
  if (kid.parentId !== parent._id) {
    throw new Error("Unauthorized");
  }
  return { parent, kid };
}
