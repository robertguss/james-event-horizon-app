import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { CheckButton } from "@/components/event-horizon/check-button";
import { ChoicePill } from "@/components/event-horizon/choice-pill";
import { HintButton } from "@/components/event-horizon/hint-button";
import { ReadingCard } from "@/components/event-horizon/reading-card";
import { TelescopeReticle } from "@/components/event-horizon/telescope-reticle";
import { XpBadge } from "@/components/event-horizon/xp-badge";
import { useEh } from "@/lib/eh/data";
import { evidenceMode } from "@/lib/eh/pure/grade";
import type {
  Attempt,
  CompleteResult,
  MissionDetail,
  MissionQuestion,
} from "@/lib/eh/types";
import { cn } from "@/lib/utils";

type Phase = "brief" | "read" | "question" | "complete";

type MissionReaderProps = {
  missionId: string;
};

function stripMdBold(text: string): string {
  return text.replace(/\*\*/g, "");
}

export function MissionReader({ missionId }: MissionReaderProps) {
  const { ready, kid, data, refresh } = useEh();
  const navigate = useNavigate();
  const [mission, setMission] = useState<MissionDetail | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [phase, setPhase] = useState<Phase>("brief");
  const [selectedEvidence, setSelectedEvidence] = useState<
    string | undefined
  >();
  const [selectedChoice, setSelectedChoice] = useState<string | undefined>();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [hintText, setHintText] = useState<string | null>(null);
  const [glowIds, setGlowIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!ready || !kid) return;
      const detail = await data.missions.get(missionId);
      if (cancelled) return;
      if (!detail) {
        setError("Mission not found");
        return;
      }
      setMission(detail);
      const active =
        (await data.attempts.getActive(kid.id, missionId)) ??
        (await data.attempts.start(kid.id, missionId));
      if (cancelled) return;
      setAttempt(active);
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, kid, data, missionId]);

  if (!ready || !kid) {
    return (
      <div className="grid min-h-svh place-items-center bg-eh-neutral text-eh-on-surface">
        <p className="font-extrabold">Loading mission…</p>
      </div>
    );
  }

  if (error || !mission || !attempt) {
    return (
      <div className="grid min-h-svh place-items-center bg-eh-neutral text-eh-on-surface">
        <p className="font-extrabold">{error ?? "Charting course…"}</p>
      </div>
    );
  }

  const question: MissionQuestion | undefined =
    mission.questions[attempt.currentQuestionIndex];

  const onCheck = async () => {
    if (!question || busy) return;
    setBusy(true);
    setFeedback(null);
    try {
      const mode = evidenceMode(question);
      const result = await data.attempts.submitAnswer({
        attemptId: attempt.id,
        questionKey: question.id,
        evidenceId: mode === "choice_only" ? undefined : selectedEvidence,
        choiceId: selectedChoice,
        // Forged claims must be ignored by grader
        claimedCorrect: true,
      });
      setAttempt(result.attempt);
      setFeedback(result.feedback);
      if (result.correct) {
        setHintText(null);
        setGlowIds([]);
        setSelectedChoice(undefined);
        setSelectedEvidence(undefined);
        if (result.nextQuestionIndex === null) {
          setPhase("complete");
          const done: CompleteResult = await data.attempts.complete({
            attemptId: attempt.id,
          });
          await refresh();
          if (typeof sessionStorage !== "undefined") {
            sessionStorage.setItem(
              "eh.lastComplete",
              JSON.stringify({
                missionId: mission.id,
                missionTitle: mission.title,
                breakdown: done.xpBreakdown,
                leveledUp: done.leveledUp,
                previousLevel: done.previousLevel,
                level: done.kid.level,
                xp: done.kid.xp,
                streakDays: done.kid.streakDays,
                newSectorStamps: done.newSectorStamps,
              }),
            );
          }
          if (done.leveledUp) {
            void navigate({ to: "/level-up" });
          } else {
            void navigate({ to: "/debrief" });
          }
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const onHint = async () => {
    if (!question || busy) return;
    setBusy(true);
    try {
      const result = await data.attempts.requestHint({
        attemptId: attempt.id,
        questionKey: question.id,
      });
      setAttempt(result.attempt);
      setHintText(result.text);
      setGlowIds(result.glowEvidenceIds);
    } finally {
      setBusy(false);
    }
  };

  const choices = question?.choices ?? [];
  const showEvidencePicker =
    question != null && evidenceMode(question) !== "choice_only";

  return (
    <div className="relative min-h-svh overflow-hidden bg-eh-neutral text-eh-on-surface">
      {/* Nebula atmosphere — CSS only, no WebGL canvas */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,#C77DFF66,transparent_42%),radial-gradient(circle_at_82%_28%,#E056A055,transparent_38%),radial-gradient(circle_at_50%_90%,#2EC4B622,transparent_40%),linear-gradient(180deg,#1B1430_0%,#241B3D_55%,#1B1430_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(1.5px_1.5px_at_20%_30%,#FFE8A3_50%,transparent_51%),radial-gradient(1px_1px_at_70%_20%,#fff_50%,transparent_51%),radial-gradient(1.5px_1.5px_at_40%_70%,#FFE8A3_50%,transparent_51%),radial-gradient(1px_1px_at_85%_60%,#fff_50%,transparent_51%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-3xl flex-col px-4 py-5 sm:px-6">
        <header className="mb-4 flex flex-col items-center gap-2 text-center">
          <h1 className="font-extrabold text-3xl tracking-tight text-eh-tertiary drop-shadow-[0_3px_0_#1B1430] sm:text-4xl">
            Event Horizon
          </h1>
          <div className="inline-flex items-center gap-2 rounded-full bg-eh-primary px-5 py-1.5 text-sm font-extrabold text-white shadow-[0_6px_16px_rgba(11,8,24,0.35)]">
            <span aria-hidden>★</span>
            Mission Reader
            <span aria-hidden>★</span>
          </div>
          <div className="absolute top-4 right-4">
            <XpBadge xpTotal={kid.xp} />
          </div>
        </header>

        {phase === "brief" ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6">
            <ReadingCard>
              <p className="text-sm font-bold tracking-wide text-eh-primary uppercase">
                {mission.planet}
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-eh-on-reading">
                {mission.title}
              </h2>
              <p className="mt-4 text-lg leading-relaxed font-semibold text-eh-on-reading">
                {mission.objective}
              </p>
            </ReadingCard>
            <button
              type="button"
              className="eh-button-check h-14 rounded-full px-8 text-lg font-extrabold text-white"
              onClick={() => setPhase("read")}
            >
              Open transmission
            </button>
          </div>
        ) : null}

        {phase === "read" ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6">
            <ReadingCard>
              <Passage
                sentences={mission.sentences}
                glowIds={[]}
                selectedId={undefined}
                interactive={false}
              />
            </ReadingCard>
            <button
              type="button"
              className="eh-button-check h-14 rounded-full px-8 text-lg font-extrabold text-white"
              onClick={() => setPhase("question")}
            >
              Ready for questions
            </button>
          </div>
        ) : null}

        {phase === "question" && question ? (
          <div className="flex flex-1 flex-col items-center gap-4 pb-28">
            <ReadingCard className="relative">
              <p className="mb-3 text-sm font-bold text-eh-primary">
                Question {attempt.currentQuestionIndex + 1} of{" "}
                {mission.questions.length}
              </p>
              <p className="mb-4 text-xl leading-relaxed font-bold text-eh-on-reading">
                {stripMdBold(question.prompt)}
              </p>
              <Passage
                sentences={mission.sentences}
                glowIds={glowIds}
                selectedId={selectedEvidence}
                interactive={showEvidencePicker}
                onSelect={(id) => {
                  setSelectedEvidence(id);
                  setFeedback(null);
                }}
              />
              <TelescopeReticle active={glowIds.length > 0} />
            </ReadingCard>

            {hintText ? (
              <p
                className="max-w-2xl rounded-2xl bg-eh-surface-elevated/90 px-4 py-3 text-center text-base font-semibold text-eh-tertiary-glow animate-[fadeSlide_280ms_ease-out]"
                role="status"
              >
                {stripMdBold(hintText)}
              </p>
            ) : null}

            {feedback ? (
              <p
                className={cn(
                  "max-w-2xl text-center text-base font-bold",
                  feedback.toLowerCase().includes("not") ||
                    feedback.toLowerCase().includes("try")
                    ? "text-[#FF6B8A]"
                    : "text-eh-primary",
                )}
                role="status"
              >
                {feedback}
              </p>
            ) : null}

            {/* Five-pill bottom bar: Check · 3 choices · Hint (gold) */}
            <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-eh-neutral/85 px-3 py-3 backdrop-blur-md">
              <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2 sm:gap-3">
                <CheckButton onClick={() => void onCheck()} disabled={busy} />
                {choices.length > 0
                  ? choices.map((choice, index) => (
                      <ChoicePill
                        key={choice.id}
                        accent={index % 2 === 0 ? "gold" : "teal"}
                        selected={selectedChoice === choice.id}
                        onClick={() => {
                          setSelectedChoice(choice.id);
                          setFeedback(null);
                        }}
                        title={choice.text}
                      >
                        {choice.id}
                      </ChoicePill>
                    ))
                  : // Locate rhythm: gold · teal · gold accent slots (tap sentences above)
                    (["gold", "teal", "gold"] as const).map((accent, i) => (
                      <span
                        key={`slot-${i}`}
                        aria-hidden
                        className={
                          accent === "gold"
                            ? "eh-button-hint inline-flex h-12 min-w-[4.5rem] items-center justify-center rounded-full px-4"
                            : "eh-button-check inline-flex h-12 min-w-[4.5rem] items-center justify-center rounded-full px-4"
                        }
                      />
                    ))}
                <HintButton onClick={() => void onHint()} disabled={busy} />
              </div>
              {selectedChoice && choices.length > 0 ? (
                <p className="mx-auto mt-2 max-w-2xl truncate text-center text-xs text-eh-on-surface-muted">
                  Selected: {choices.find((c) => c.id === selectedChoice)?.text}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {phase === "complete" ? (
          <div className="grid flex-1 place-items-center">
            <p className="font-extrabold text-eh-tertiary">
              Mission locked in…
            </p>
          </div>
        ) : null}
      </div>

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function Passage({
  sentences,
  glowIds,
  selectedId,
  interactive,
  onSelect,
}: {
  sentences: { id: string; text: string }[];
  glowIds: string[];
  selectedId?: string;
  interactive: boolean;
  onSelect?: (id: string) => void;
}) {
  return (
    <div className="space-y-3 text-[22px] leading-[1.65] font-semibold text-eh-on-reading">
      {sentences.map((sentence) => {
        const glowing = glowIds.includes(sentence.id);
        const selected = selectedId === sentence.id;
        const className = cn(
          "block w-full rounded-xl px-2 py-1 text-left transition-colors duration-200",
          interactive && "hover:bg-[#5EEAD433]",
          selected && "bg-[#5EEAD466] ring-2 ring-eh-primary",
          glowing && !selected && "bg-[#5EEAD433] shadow-[0_0_0_2px_#2EC4B6]",
        );
        if (interactive) {
          return (
            <button
              key={sentence.id}
              type="button"
              onClick={() => onSelect?.(sentence.id)}
              className={className}
            >
              {sentence.text}
            </button>
          );
        }
        return (
          <p key={sentence.id} className={className}>
            {sentence.text}
          </p>
        );
      })}
    </div>
  );
}
