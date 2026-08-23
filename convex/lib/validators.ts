import { v } from "convex/values";
import { gradeBandValidator } from "./gradeBand";

export const kidPublicValidator = v.object({
  _id: v.id("kids"),
  displayName: v.string(),
  gradeBand: gradeBandValidator,
  xpTotal: v.number(),
  level: v.number(),
  streakDays: v.number(),
  lastMissionDate: v.optional(v.string()),
  unlockedCosmeticIds: v.array(v.string()),
  equippedShipPaintId: v.optional(v.string()),
  equippedTelescopeId: v.optional(v.string()),
  blackHoleUnlockedAt: v.optional(v.number()),
  missionsCompleted: v.number(),
});

export const setupStateValidator = v.union(
  v.object({
    onboarded: v.literal(false),
  }),
  v.object({
    onboarded: v.literal(true),
    parentId: v.id("parents"),
    kid: kidPublicValidator,
  }),
  v.null(),
);

export const questionResultValidator = v.object({
  questionKey: v.string(),
  correct: v.boolean(),
  hintsUsed: v.number(),
  evidenceId: v.optional(v.string()),
  choiceId: v.optional(v.string()),
  xpAwarded: v.number(),
});

export const completionSnapshotValidator = v.object({
  xpBreakdown: v.object({
    questions: v.number(),
    exitTicket: v.number(),
    missionComplete: v.number(),
    firstDaily: v.number(),
    total: v.number(),
  }),
  leveledUp: v.boolean(),
  previousLevel: v.number(),
});

export const attemptPublicValidator = v.object({
  _id: v.id("attempts"),
  kidId: v.id("kids"),
  missionId: v.string(),
  status: v.union(v.literal("active"), v.literal("completed")),
  startedAt: v.number(),
  completedAt: v.optional(v.number()),
  currentQuestionIndex: v.number(),
  questionResults: v.array(questionResultValidator),
  currentHintsUsed: v.number(),
  hintsByQuestionKey: v.record(v.string(), v.number()),
  xpEarned: v.number(),
  firstDailyBonus: v.boolean(),
  completionSnapshot: v.optional(completionSnapshotValidator),
});

export const missionSummaryValidator = v.object({
  id: v.string(),
  title: v.string(),
  planet: v.string(),
  planetId: v.string(),
  gradeBand: gradeBandValidator,
  estimatedMinutes: v.number(),
  objective: v.string(),
  kind: v.union(
    v.literal("standard"),
    v.literal("stub"),
    v.literal("blackHole"),
  ),
  locked: v.boolean(),
  lockReason: v.optional(
    v.union(
      v.literal("coming_soon"),
      v.literal("black_hole_gate"),
      v.literal("black_hole_weekly_cap"),
    ),
  ),
  lockMessage: v.optional(v.string()),
});

export const parentStatsValidator = v.object({
  kidId: v.id("kids"),
  displayName: v.string(),
  xp: v.number(),
  level: v.number(),
  streakDays: v.number(),
  missionsCompleted: v.number(),
  weakSkillTags: v.array(v.string()),
  reminderEnabled: v.boolean(),
});

export const xpLedgerEntryValidator = v.object({
  _id: v.id("xpLedger"),
  kidId: v.id("kids"),
  attemptId: v.optional(v.id("attempts")),
  reason: v.union(
    v.literal("question"),
    v.literal("exit_ticket"),
    v.literal("mission_complete"),
    v.literal("first_daily"),
  ),
  delta: v.number(),
  balanceAfter: v.number(),
  createdAt: v.number(),
});

export const sessionValidator = v.object({
  parentId: v.union(v.id("parents"), v.null()),
  activeKidId: v.union(v.id("kids"), v.null()),
});

const questionTypeValidator = v.union(
  v.literal("locate"),
  v.literal("main_idea_mc"),
  v.literal("vocab_in_context_mc"),
  v.literal("infer_mc"),
  v.literal("exit_main_idea_mc"),
);

export const missionQuestionValidator = v.object({
  id: v.string(),
  order: v.number(),
  type: questionTypeValidator,
  xpKind: v.union(v.literal("question"), v.literal("exit")),
  prompt: v.string(),
  choices: v.optional(
    v.array(
      v.object({
        id: v.string(),
        text: v.string(),
      }),
    ),
  ),
  correctChoiceId: v.optional(v.string()),
  correctEvidenceIds: v.array(v.string()),
  evidenceRule: v.union(v.literal("exact"), v.literal("anyOf")),
  stemSentenceId: v.optional(v.string()),
  requiresChoiceAndEvidence: v.optional(v.boolean()),
  hints: v.array(v.string()),
  distractorTraps: v.optional(v.array(v.string())),
});

export const missionReflectionValidator = v.object({
  mapPrompt: v.string(),
  cards: v.array(
    v.object({
      id: v.string(),
      text: v.string(),
    }),
  ),
  correctOrder: v.array(v.string()),
  captainLogPrompt: v.string(),
  sentenceStarters: v.array(v.string()),
  parentGuide: v.string(),
  rewardTitle: v.string(),
  rewardDescription: v.string(),
});

export const missionDetailValidator = v.object({
  id: v.string(),
  title: v.string(),
  planet: v.string(),
  planetId: v.string(),
  gradeBand: gradeBandValidator,
  estimatedMinutes: v.number(),
  objective: v.string(),
  kind: v.union(
    v.literal("standard"),
    v.literal("stub"),
    v.literal("blackHole"),
  ),
  presentation: v.optional(
    v.union(v.literal("adventure"), v.literal("scripture")),
  ),
  sourceNote: v.optional(v.string()),
  skillTags: v.array(v.string()),
  status: v.union(
    v.literal("draft"),
    v.literal("published"),
    v.literal("stub"),
  ),
  sentences: v.array(
    v.object({
      id: v.string(),
      text: v.string(),
    }),
  ),
  questions: v.array(missionQuestionValidator),
  reflection: v.optional(missionReflectionValidator),
  scoring: v.object({
    // Hint-count keys are "0".."3". v.object field names cannot start with a digit.
    questionXp: v.record(v.string(), v.number()),
    exitTicketXp: v.number(),
    missionCompleteXp: v.number(),
    firstDailyXp: v.number(),
  }),
});

export const parentRecordingValidator = v.object({
  id: v.id("missionReflections"),
  kidId: v.id("kids"),
  missionId: v.string(),
  missionTitle: v.string(),
  createdAt: v.number(),
  durationSeconds: v.number(),
  mimeType: v.string(),
  audioUrl: v.string(),
  parentGuide: v.string(),
});
