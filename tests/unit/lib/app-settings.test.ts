import { beforeEach, describe, expect, it, vi } from "vitest";

import { resetIndexedDb } from "../reset-indexeddb";

// app-settings.ts caches state in a module-level singleton, so each test
// needs a fresh module instance to control what it reads/writes.
async function freshAppSettings() {
  vi.resetModules();
  return import("@/lib/app-settings");
}

/** Seeds stored settings, then loads a fresh module that reads them. */
async function loadStored(stored: Record<string, unknown>) {
  // resetModules before this seed write — idb-store.ts caches its DB
  // connection at module scope, and reusing a connection opened before this
  // test's beforeEach deleted the database throws InvalidStateError.
  vi.resetModules();
  const { kvSet } = await import("@/lib/idb-store");
  const { SETTINGS_KEY } = await import("@/lib/storage-keys");
  await kvSet(SETTINGS_KEY, stored);
  const appSettings = await freshAppSettings();
  await appSettings.whenLoaded();
  return appSettings;
}

beforeEach(async () => {
  await resetIndexedDb();
});

describe("defaults", () => {
  it("opens on C major triads, two octaves from middle C, B not H", async () => {
    const appSettings = await freshAppSettings();
    expect(appSettings.getSettingsSnapshot()).toMatchObject({
      installed: false,
      lock: null,
      practice: { root: 0, scale: "major", chordSize: 3 },
      keyboard: { octaves: 2, startOctave: 4 },
      notation: "international",
    });
    expect(appSettings.getServerSettingsSnapshot().installed).toBe(false);
    expect(appSettings.isSettingsReadyOnServer()).toBe(false);
  });
});

describe("loading", () => {
  it("restores what was last practised", async () => {
    const appSettings = await loadStored({
      practice: { root: 9, scale: "dorian", chordSize: 4 },
      keyboard: { octaves: 3, startOctave: 2 },
      notation: "polish",
      installed: true,
    });
    expect(appSettings.getSettingsSnapshot()).toMatchObject({
      practice: { root: 9, scale: "dorian", chordSize: 4 },
      keyboard: { octaves: 3, startOctave: 2 },
      notation: "polish",
      installed: true,
    });
  });

  it("falls back per field for values it doesn't know", async () => {
    const appSettings = await loadStored({
      practice: { root: 12, scale: "bebop", chordSize: 4 },
      keyboard: { octaves: 5, startOctave: "4" },
      notation: "german",
      installed: "yes",
    });
    expect(appSettings.getSettingsSnapshot()).toMatchObject({
      practice: { root: 0, scale: "major", chordSize: 4 },
      keyboard: { octaves: 2, startOctave: 4 },
      notation: "international",
      installed: false,
    });
  });

  it("survives groups that aren't objects", async () => {
    const appSettings = await loadStored({ practice: null, keyboard: 3 });
    expect(appSettings.getSettingsSnapshot().practice.scale).toBe("major");
    expect(appSettings.getSettingsSnapshot().keyboard.octaves).toBe(2);
  });

  it("reads a corrupt stored lock as no lock", async () => {
    const appSettings = await loadStored({ lock: { userId: "u1" } });
    expect(appSettings.getSettingsSnapshot().lock).toBeNull();
  });
});

describe("setters", () => {
  it("merges practice changes", async () => {
    const appSettings = await freshAppSettings();
    appSettings.setPracticePrefs({ root: 7 });
    appSettings.setPracticePrefs({ chordSize: 4 });
    expect(appSettings.getSettingsSnapshot().practice).toEqual({
      root: 7,
      scale: "major",
      chordSize: 4,
    });
  });

  it("merges keyboard changes", async () => {
    const appSettings = await freshAppSettings();
    appSettings.setKeyboardPrefs({ octaves: 4 });
    appSettings.setKeyboardPrefs({ startOctave: 1 });
    expect(appSettings.getSettingsSnapshot().keyboard).toEqual({
      octaves: 4,
      startOctave: 1,
    });
  });

  it("switches the notation", async () => {
    const appSettings = await freshAppSettings();
    appSettings.setNotation("polish");
    expect(appSettings.getSettingsSnapshot().notation).toBe("polish");
  });

  it("notifies subscribers until they unsubscribe", async () => {
    const appSettings = await freshAppSettings();
    const listener = vi.fn();
    const unsubscribe = appSettings.subscribeToSettings(listener);

    appSettings.setNotation("polish");
    unsubscribe();
    appSettings.setNotation("international");

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("marks the app installed once", async () => {
    const appSettings = await freshAppSettings();
    appSettings.markInstalled();
    const listener = vi.fn();
    appSettings.subscribeToSettings(listener);

    appSettings.markInstalled();

    expect(appSettings.getSettingsSnapshot().installed).toBe(true);
    expect(listener).not.toHaveBeenCalled();
  });

  it("stores and clears the lock", async () => {
    const appSettings = await freshAppSettings();
    const enrolment = {
      credentialId: "c1",
      userId: "u1",
      createdAt: "now",
      encryptionSupported: false,
    };
    appSettings.setLockEnrolment(enrolment);
    expect(appSettings.getSettingsSnapshot().lock).toEqual(enrolment);
    appSettings.setLockEnrolment(null);
    expect(appSettings.getSettingsSnapshot().lock).toBeNull();
  });
});

describe("relockAfterMs", () => {
  it("defaults to 30 seconds and follows the chosen setting", async () => {
    const appSettings = await freshAppSettings();
    expect(appSettings.relockAfterMs()).toBe(30_000);
    appSettings.setRelockAfter("now");
    expect(appSettings.relockAfterMs()).toBe(0);
    appSettings.setRelockAfter("close");
    expect(appSettings.relockAfterMs()).toBeNull();
  });

  it("falls back to 30 seconds for an unknown stored choice", async () => {
    const appSettings = await loadStored({ relockAfter: "never" });
    expect(appSettings.getSettingsSnapshot().relockAfter).toBe("30s");
  });
});
