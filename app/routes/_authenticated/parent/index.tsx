import {
  createFileRoute,
  Link,
  Navigate,
  useNavigate,
} from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isFixtureMode, useEh, type ParentStats } from "@/lib/eh/data";
import { clearParentSession, isParentUnlocked } from "@/lib/parent-session";

const ParentSignOutButton = lazy(async () => {
  const mod = await import("./-sign-out-button");
  return { default: mod.ParentSignOutButton };
});

export const Route = createFileRoute("/_authenticated/parent/")({
  component: ParentPage,
});

function ParentPage() {
  const { ready, kid, data, refresh } = useEh();
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [stats, setStats] = useState<ParentStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [namePending, setNamePending] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [reminderPending, setReminderPending] = useState(false);
  const fixture = isFixtureMode();

  useEffect(() => {
    setUnlocked(isParentUnlocked());
  }, []);

  useEffect(() => {
    if (!unlocked || !kid) return;
    let cancelled = false;
    setStatsError(null);
    void data.parent
      .getParentStats(kid.id)
      .then((next) => {
        if (cancelled) return;
        setStats(next);
        setNameDraft(next.displayName);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setStatsError(
          err instanceof Error ? err.message : "Could not load parent stats",
        );
      });
    return () => {
      cancelled = true;
    };
  }, [unlocked, kid, data]);

  if (!ready || unlocked === null) {
    return (
      <div className="grid min-h-svh place-items-center bg-eh-neutral text-eh-on-surface">
        <p className="font-extrabold">Loading…</p>
      </div>
    );
  }

  if (!kid) {
    return <Navigate to="/onboarding" />;
  }

  if (!unlocked) {
    return <Navigate to="/parent/gate" />;
  }

  const saveName = async () => {
    setNameError(null);
    setNamePending(true);
    try {
      const updated = await data.parent.updateKidName(kid.id, nameDraft);
      setNameDraft(updated.displayName);
      const next = await data.parent.getParentStats(kid.id);
      setStats(next);
      await refresh();
    } catch (err) {
      setNameError(
        err instanceof Error ? err.message : "Could not update name",
      );
    } finally {
      setNamePending(false);
    }
  };

  const toggleReminder = async (enabled: boolean) => {
    setReminderPending(true);
    try {
      await data.parent.setReminderEnabled(enabled);
      const next = await data.parent.getParentStats(kid.id);
      setStats(next);
    } finally {
      setReminderPending(false);
    }
  };

  return (
    <div className="min-h-svh bg-eh-neutral text-eh-on-surface">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,#2EC4B622,transparent_40%),linear-gradient(180deg,#1B1430,#241B3D)]"
        aria-hidden
      />
      <main className="relative mx-auto flex min-h-svh w-full max-w-lg flex-col gap-6 px-6 py-10">
        <header className="space-y-1">
          <p className="text-sm font-bold tracking-wide text-eh-on-surface-muted uppercase">
            Parent area
          </p>
          <h1 className="text-3xl font-extrabold">Explorer progress</h1>
        </header>

        {statsError ? (
          <p className="text-sm font-semibold text-[#FF6B8A]" role="alert">
            {statsError}
          </p>
        ) : null}

        <section className="space-y-4 rounded-[28px] bg-eh-surface-elevated/90 p-6 ring-1 ring-eh-border-glass">
          <div className="grid grid-cols-2 gap-4">
            <StatBlock
              label="Missions done"
              value={stats ? String(stats.missionsCompleted) : "—"}
            />
            <StatBlock
              label="Streak"
              value={
                stats
                  ? `${stats.streakDays} day${stats.streakDays === 1 ? "" : "s"}`
                  : "—"
              }
            />
          </div>
          <div>
            <p className="text-sm font-bold text-eh-on-surface-muted uppercase">
              Weak skills
            </p>
            {stats == null ? (
              <p className="mt-2 text-eh-on-surface-muted">Loading…</p>
            ) : stats.weakSkillTags.length === 0 ? (
              <p className="mt-2 text-eh-on-surface-muted">
                No weak tags yet — keep exploring.
              </p>
            ) : (
              <ul className="mt-3 flex flex-wrap gap-2">
                {stats.weakSkillTags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full bg-eh-surface px-3 py-1 text-sm font-semibold text-eh-secondary ring-1 ring-eh-border-glass"
                  >
                    {formatSkillTag(tag)}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {stats ? (
            <p className="text-sm text-eh-on-surface-muted">
              Level {stats.level} · {stats.xp} XP
            </p>
          ) : null}
        </section>

        <section className="space-y-4 rounded-[28px] bg-eh-surface-elevated/90 p-6 ring-1 ring-eh-border-glass">
          <div className="space-y-2">
            <Label htmlFor="explorerName">Explorer name</Label>
            <div className="flex gap-2">
              <Input
                id="explorerName"
                value={nameDraft}
                onChange={(event) => setNameDraft(event.target.value)}
                maxLength={40}
                className="h-12 rounded-full bg-eh-surface"
              />
              <Button
                type="button"
                disabled={namePending}
                className="h-12 shrink-0 rounded-full px-5 font-extrabold"
                onClick={() => void saveName()}
              >
                {namePending ? "Saving…" : "Save"}
              </Button>
            </div>
            {nameError ? (
              <p className="text-sm font-semibold text-[#FF6B8A]" role="alert">
                {nameError}
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-extrabold">Daily reminder</p>
              <p className="text-sm text-eh-on-surface-muted">
                Optional nudge to keep the streak going.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={reminderPending || stats == null}
              aria-pressed={stats?.reminderEnabled ?? false}
              className="h-12 rounded-full px-5 font-extrabold"
              onClick={() =>
                void toggleReminder(!(stats?.reminderEnabled ?? false))
              }
            >
              {stats?.reminderEnabled ? "On" : "Off"}
            </Button>
          </div>
        </section>

        <div className="mt-auto flex flex-col gap-3">
          <Link to="/hub">
            <Button className="h-14 w-full rounded-full font-extrabold">
              Back to kid hub
            </Button>
          </Link>
          {fixture ? (
            <Button
              variant="outline"
              className="h-14 w-full rounded-full font-extrabold"
              onClick={() => {
                clearParentSession();
                void navigate({ to: "/" });
              }}
            >
              Sign out (fixture)
            </Button>
          ) : (
            <Suspense fallback={null}>
              <ParentSignOutButton />
            </Suspense>
          )}
          <Button
            type="button"
            variant="ghost"
            className="h-12 w-full rounded-full"
            onClick={() => {
              clearParentSession();
              void navigate({ to: "/hub" });
            }}
          >
            Lock parent area
          </Button>
        </div>
      </main>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-bold text-eh-on-surface-muted uppercase">
        {label}
      </p>
      <p className="mt-2 text-3xl font-extrabold">{value}</p>
    </div>
  );
}

function formatSkillTag(tag: string): string {
  return tag.replaceAll("_", " ");
}
