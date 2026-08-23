import { afterEach, describe, expect, it } from "vitest";
import { getFixtureDebugState, resetFixture } from "./adapters/fixtureAdapter";
import { FIXTURE_KID_ID } from "./auth/fixtureAuth";
import { getEhData } from "./data";

describe("fixture mission reflections", () => {
  afterEach(() => resetFixture());

  it("validates the map and exposes optional audio to the parent inbox", async () => {
    const data = getEhData();
    const missionId = "mission_w1_d1_light_collector";
    const attempt = await data.attempts.start(FIXTURE_KID_ID, missionId);

    await expect(
      data.reflections.save({
        attemptId: attempt.id,
        missionId,
        mapCardIds: ["pull"],
      }),
    ).rejects.toThrow(/not complete/);

    const mapCardIds = ["source", "gather", "focus", "image"];
    await data.reflections.save({
      attemptId: attempt.id,
      missionId,
      mapCardIds,
    });
    await expect(data.parent.listRecordings(FIXTURE_KID_ID)).resolves.toEqual(
      [],
    );

    await data.reflections.save({
      attemptId: attempt.id,
      missionId,
      mapCardIds,
      recording: {
        blob: new Blob(["test audio"], { type: "audio/webm" }),
        durationSeconds: 32,
        mimeType: "audio/webm",
      },
    });

    const recordings = await data.parent.listRecordings(FIXTURE_KID_ID);
    expect(recordings).toHaveLength(1);
    expect(recordings[0]).toMatchObject({
      kidId: FIXTURE_KID_ID,
      missionId,
      missionTitle: "The Telescope’s Light Collector",
      durationSeconds: 32,
    });
    expect(getFixtureDebugState().recordings).toHaveLength(1);

    await data.parent.deleteRecording(recordings[0]!.id);
    await expect(data.parent.listRecordings(FIXTURE_KID_ID)).resolves.toEqual(
      [],
    );
  });
});
