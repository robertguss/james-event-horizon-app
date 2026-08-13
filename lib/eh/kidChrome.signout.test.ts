import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

describe("kid chrome has no sign-out; parent keeps it", () => {
  it("hub view + hub route omit Sign out / SignOutButton", () => {
    const hubView = readFileSync(
      join(root, "components/event-horizon/hub-view.tsx"),
      "utf8",
    );
    const hubRoute = readFileSync(
      join(root, "app/routes/_authenticated/hub.tsx"),
      "utf8",
    );

    for (const source of [hubView, hubRoute]) {
      expect(source).not.toMatch(/Sign out/i);
      expect(source).not.toMatch(/SignOutButton/);
      expect(source).not.toMatch(/sign-out/i);
    }
  });

  it("parent index still offers Sign out", () => {
    const parentIndex = readFileSync(
      join(root, "app/routes/_authenticated/parent/index.tsx"),
      "utf8",
    );
    expect(parentIndex).toMatch(/Sign out/);
    expect(parentIndex).toMatch(/ParentSignOutButton|SignOutButton/);
  });
});
