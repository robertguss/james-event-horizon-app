import type { Doc } from "../_generated/dataModel";
import type { Attempt, EhKid } from "../../lib/eh/types";
import { mapPublicKid } from "../../lib/eh/mapPublicKid";
import { toPublicKid } from "./kidPublic";

/** Strip system `_creationTime` for return validators. */
export function toPublicAttempt(doc: Doc<"attempts">) {
  return {
    _id: doc._id,
    kidId: doc.kidId,
    missionId: doc.missionId,
    status: doc.status,
    startedAt: doc.startedAt,
    completedAt: doc.completedAt,
    currentQuestionIndex: doc.currentQuestionIndex,
    questionResults: doc.questionResults,
    currentHintsUsed: doc.currentHintsUsed,
    hintsByQuestionKey: doc.hintsByQuestionKey,
    xpEarned: doc.xpEarned,
    firstDailyBonus: doc.firstDailyBonus,
    completionSnapshot: doc.completionSnapshot,
  };
}

export function toAttempt(doc: Doc<"attempts">): Attempt {
  const pub = toPublicAttempt(doc);
  return {
    id: pub._id,
    kidId: pub.kidId,
    missionId: pub.missionId,
    status: pub.status,
    startedAt: pub.startedAt,
    completedAt: pub.completedAt,
    currentQuestionIndex: pub.currentQuestionIndex,
    questionResults: pub.questionResults,
    currentHintsUsed: pub.currentHintsUsed,
    hintsByQuestionKey: pub.hintsByQuestionKey,
    xpEarned: pub.xpEarned,
    firstDailyBonus: pub.firstDailyBonus,
    completionSnapshot: pub.completionSnapshot,
  };
}

export function toPublicLedgerEntry(doc: Doc<"xpLedger">) {
  return {
    _id: doc._id,
    kidId: doc.kidId,
    attemptId: doc.attemptId,
    reason: doc.reason,
    delta: doc.delta,
    balanceAfter: doc.balanceAfter,
    createdAt: doc.createdAt,
  };
}

export function kidDocToEhKid(kid: Doc<"kids">): EhKid {
  return mapPublicKid(toPublicKid(kid));
}
