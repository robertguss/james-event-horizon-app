import { Mic, RotateCcw, Square, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { MissionDetail } from "@/lib/eh/types";
import { cn } from "@/lib/utils";

type RecordedAudio = {
  blob: Blob;
  durationSeconds: number;
  mimeType: string;
  previewUrl: string;
};

type MissionReflectionProps = {
  mission: MissionDetail;
  onComplete: (
    mapCardIds: string[],
    recording?: Omit<RecordedAudio, "previewUrl">,
  ) => Promise<void>;
};

export function MissionReflection({
  mission,
  onComplete,
}: MissionReflectionProps) {
  const reflection = mission.reflection;
  const [stage, setStage] = useState<"map" | "log">("map");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [mapFeedback, setMapFeedback] = useState<string | null>(null);
  const [recording, setRecording] = useState<RecordedAudio | null>(null);
  const [recordingActive, setRecordingActive] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayCards = useMemo(
    () => [...(reflection?.cards ?? [])].reverse(),
    [reflection],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoStopRef.current) clearTimeout(autoStopRef.current);
      if (recorderRef.current?.state === "recording") {
        recorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (recording) URL.revokeObjectURL(recording.previewUrl);
    };
  }, [recording]);

  if (!reflection) return null;

  const selectedCards = selectedIds
    .map((id) => reflection.cards.find((card) => card.id === id))
    .filter((card) => card !== undefined);
  const availableCards = displayCards.filter(
    (card) => !selectedIds.includes(card.id),
  );

  const selectCard = (cardId: string) => {
    if (selectedIds.length >= reflection.correctOrder.length) return;
    setSelectedIds((current) => [...current, cardId]);
    setMapFeedback(null);
  };

  const removeCard = (cardId: string) => {
    setSelectedIds((current) => current.filter((id) => id !== cardId));
    setMapFeedback(null);
  };

  const checkMap = () => {
    const correct =
      selectedIds.length === reflection.correctOrder.length &&
      reflection.correctOrder.every(
        (cardId, index) => selectedIds[index] === cardId,
      );
    if (!correct) {
      setMapFeedback(
        "That connection is not quite right yet. Tap a piece to remove it, then rebuild the path.",
      );
      return;
    }
    setMapFeedback("Connection locked in.");
    setStage("log");
  };

  const stopRecorderTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoStopRef.current) clearTimeout(autoStopRef.current);
    timerRef.current = null;
    autoStopRef.current = null;
  };

  const stopRecording = () => {
    stopRecorderTimers();
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  };

  const startRecording = async () => {
    setMicError(null);
    setSaveError(null);
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setMicError(
        "Recording is not available in this browser. You can still finish the mission without it.",
      );
      return;
    }

    try {
      if (recording) {
        URL.revokeObjectURL(recording.previewUrl);
        setRecording(null);
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const preferredMimeTypes = [
        "audio/mp4",
        "audio/webm;codecs=opus",
        "audio/webm",
      ];
      const mimeType = preferredMimeTypes.find((type) =>
        MediaRecorder.isTypeSupported(type),
      );
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      startedAtRef.current = Date.now();
      setRecordingSeconds(0);

      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      });
      recorder.addEventListener("stop", () => {
        const finalMimeType = recorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: finalMimeType });
        const durationSeconds = Math.max(
          1,
          Math.round((Date.now() - startedAtRef.current) / 1000),
        );
        setRecording({
          blob,
          durationSeconds,
          mimeType: finalMimeType,
          previewUrl: URL.createObjectURL(blob),
        });
        setRecordingActive(false);
        setRecordingSeconds(durationSeconds);
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      });
      recorder.start(250);
      setRecordingActive(true);
      timerRef.current = setInterval(() => {
        setRecordingSeconds(
          Math.min(60, Math.floor((Date.now() - startedAtRef.current) / 1000)),
        );
      }, 250);
      autoStopRef.current = setTimeout(stopRecording, 60_000);
    } catch (error) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setRecordingActive(false);
      setMicError(
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "Microphone access was not allowed. You can enable it in iPad settings or finish without recording."
          : "The microphone could not start. You can try again or finish without recording.",
      );
    }
  };

  const finish = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await onComplete(
        selectedIds,
        recording
          ? {
              blob: recording.blob,
              durationSeconds: recording.durationSeconds,
              mimeType: recording.mimeType,
            }
          : undefined,
      );
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Could not save the Captain’s Log.",
      );
      setSaving(false);
    }
  };

  const scripture = mission.presentation === "scripture";

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-2 sm:py-4">
      <section
        className={cn(
          "w-full max-w-2xl rounded-[24px] border-4 p-4 shadow-2xl sm:rounded-[32px] sm:p-7",
          scripture
            ? "border-[#9A7A45] bg-[#FBF3DF] text-[#2D2419]"
            : "border-eh-primary bg-eh-surface-elevated/95 text-eh-on-surface",
        )}
      >
        <p
          className={cn(
            "text-sm font-extrabold tracking-widest uppercase",
            scripture ? "text-[#72562D]" : "text-eh-tertiary",
          )}
        >
          {scripture ? "Scripture response" : "Observatory repair"}
        </p>
        <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
          {stage === "map" ? "Connection Map" : "Captain’s Log"}
        </h2>

        {stage === "map" ? (
          <div className="mt-5 space-y-5">
            <p className="text-lg leading-relaxed font-bold">
              {reflection.mapPrompt}
            </p>

            <ol className="grid gap-2">
              {Array.from({ length: reflection.correctOrder.length }).map(
                (_, index) => {
                  const card = selectedCards[index];
                  return (
                    <li
                      key={`slot-${index}`}
                      className={cn(
                        "flex min-h-16 items-start gap-3 rounded-2xl border-2 border-dashed px-3 py-2 sm:items-center",
                        scripture
                          ? "border-[#B99A67] bg-white/50"
                          : "border-eh-border-glass bg-eh-surface",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-8 shrink-0 place-items-center font-extrabold text-white",
                          scripture
                            ? "rounded-md bg-[#72562D]"
                            : "rounded-full bg-eh-primary",
                        )}
                      >
                        {index + 1}
                      </span>
                      {card ? (
                        <button
                          type="button"
                          className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left font-bold"
                          onClick={() => removeCard(card.id)}
                          aria-label={`Remove ${card.text}`}
                        >
                          <span className="min-w-0 flex-1 break-words">
                            {card.text}
                          </span>
                          <X className="size-5 shrink-0" aria-hidden />
                        </button>
                      ) : (
                        <span className="font-semibold opacity-60">
                          Choose a piece below
                        </span>
                      )}
                    </li>
                  );
                },
              )}
            </ol>

            <div className="grid gap-2 sm:grid-cols-2">
              {availableCards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  className={cn(
                    "min-h-16 rounded-2xl border-2 px-4 py-3 text-left font-bold transition-transform active:scale-[0.98]",
                    scripture
                      ? "border-[#B99A67] bg-white hover:bg-[#FFF9EA]"
                      : "border-eh-border-glass bg-eh-surface hover:border-eh-primary",
                  )}
                  onClick={() => selectCard(card.id)}
                >
                  {card.text}
                </button>
              ))}
            </div>

            {mapFeedback ? (
              <p
                className={cn(
                  "text-center font-bold",
                  mapFeedback.startsWith("Connection")
                    ? scripture
                      ? "text-[#72562D]"
                      : "text-eh-primary"
                    : scripture
                      ? "text-[#8B3131]"
                      : "text-[#FF8AA2]",
                )}
                role="status"
              >
                {mapFeedback}
              </p>
            ) : null}

            <Button
              type="button"
              className={cn(
                "h-14 w-full text-lg font-extrabold text-white",
                scripture
                  ? "rounded-lg bg-[#72562D]"
                  : "rounded-full bg-eh-primary",
              )}
              disabled={selectedIds.length !== reflection.correctOrder.length}
              onClick={checkMap}
            >
              Check connection
            </Button>
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            <p className="text-lg leading-relaxed font-bold">
              {reflection.captainLogPrompt}
            </p>
            <div
              className={cn(
                "rounded-2xl p-4",
                scripture ? "bg-[#EDE0C3]" : "bg-eh-surface",
              )}
            >
              <p className="text-sm font-extrabold tracking-wide uppercase opacity-70">
                You can begin with
              </p>
              <ul className="mt-2 space-y-1 font-semibold">
                {reflection.sentenceStarters.map((starter) => (
                  <li key={starter}>• {starter}</li>
                ))}
              </ul>
            </div>

            <div className="text-center">
              <p className="text-4xl font-extrabold tabular-nums">
                0:{String(recordingSeconds).padStart(2, "0")}
              </p>
              <p className="mt-1 text-sm font-semibold opacity-70">
                Aim for 30–60 seconds. Recording is optional.
              </p>
            </div>

            {recording ? (
              <audio
                className="w-full"
                controls
                preload="metadata"
                src={recording.previewUrl}
              >
                <track kind="captions" />
              </audio>
            ) : null}

            {micError ? (
              <p className="text-center font-bold text-[#C84762]" role="alert">
                {micError}
              </p>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              {recordingActive ? (
                <Button
                  type="button"
                  className={cn(
                    "h-14 bg-[#C84762] text-lg font-extrabold text-white",
                    scripture ? "rounded-lg" : "rounded-full",
                  )}
                  onClick={stopRecording}
                >
                  <Square className="size-5 fill-current" aria-hidden />
                  Stop recording
                </Button>
              ) : (
                <Button
                  type="button"
                  className={cn(
                    "h-14 text-lg font-extrabold text-white",
                    scripture
                      ? "rounded-lg bg-[#72562D]"
                      : "rounded-full bg-eh-primary",
                  )}
                  onClick={() => void startRecording()}
                >
                  {recording ? (
                    <RotateCcw className="size-5" aria-hidden />
                  ) : (
                    <Mic className="size-5" aria-hidden />
                  )}
                  {recording ? "Record again" : "Start recording"}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "h-14 text-lg font-extrabold",
                  scripture
                    ? "rounded-lg border-[#9A7A45] bg-white text-[#2D2419]"
                    : "rounded-full",
                )}
                disabled={recordingActive || saving}
                onClick={() => void finish()}
              >
                {saving
                  ? "Saving…"
                  : recording
                    ? "Save log & finish"
                    : "Finish without recording"}
              </Button>
            </div>

            {saveError ? (
              <p className="text-center font-bold text-[#C84762]" role="alert">
                {saveError}
              </p>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
