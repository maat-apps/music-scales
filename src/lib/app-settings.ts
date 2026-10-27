import { createAppSettings } from "@maat-apps/core/app-settings";

import { keyValueStore } from "./idb-store";
import {
  OCTAVE_COUNTS,
  type OctaveCount,
  START_OCTAVES,
  type StartOctave,
} from "./music/keyboard";
import { NOTATIONS, type Notation, PITCH_CLASS_COUNT } from "./music/notes";
import { SCALE_IDS, type ScaleId } from "./music/scales";
import { SETTINGS_KEY } from "./storage-keys";

// Everything this app remembers: @maat-apps/core/app-settings' lock
// enrolment, relock choice and installed flag, plus what was last practised
// and how it's shown.

/** What's on screen: restored on the next launch. */
export type PracticePrefs = {
  /** Pitch class of the scale's root, 0 (C) – 11 (B). */
  root: number;
  scale: ScaleId;
};

export type KeyboardPrefs = {
  octaves: OctaveCount;
  startOctave: StartOctave;
};

const DEFAULT_PRACTICE: PracticePrefs = {
  root: 0,
  scale: "major",
};

const DEFAULT_KEYBOARD: KeyboardPrefs = { octaves: 2, startOctave: 4 };

function pick<T extends string | number>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return allowed.find((option) => option === value) ?? fallback;
}

function record(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

const ROOTS = Array.from({ length: PITCH_CLASS_COUNT }, (_, pc) => pc);

function parsePractice(value: unknown): PracticePrefs {
  const stored = record(value);
  return {
    root: pick(stored.root, ROOTS, DEFAULT_PRACTICE.root),
    scale: pick(stored.scale, SCALE_IDS, DEFAULT_PRACTICE.scale),
  };
}

function parseKeyboard(value: unknown): KeyboardPrefs {
  const stored = record(value);
  return {
    octaves: pick(stored.octaves, OCTAVE_COUNTS, DEFAULT_KEYBOARD.octaves),
    startOctave: pick(
      stored.startOctave,
      START_OCTAVES,
      DEFAULT_KEYBOARD.startOctave,
    ),
  };
}

export const appSettings = createAppSettings({
  storage: keyValueStore,
  key: SETTINGS_KEY,
  extra: {
    defaults: {
      practice: DEFAULT_PRACTICE,
      keyboard: DEFAULT_KEYBOARD,
      notation: "international" as Notation,
    },
    parse: (stored) => ({
      practice: parsePractice(stored.practice),
      keyboard: parseKeyboard(stored.keyboard),
      notation: pick(stored.notation, NOTATIONS, "international"),
    }),
  },
});

export type AppSettings = ReturnType<typeof appSettings.getSnapshot>;

/** Test-only: resolves once the initial background read has finished. */
export const whenLoaded = appSettings.whenLoaded;
export const subscribeToSettings = appSettings.subscribe;
export const getSettingsSnapshot = appSettings.getSnapshot;
export const getServerSettingsSnapshot = appSettings.getServerSnapshot;
// The lock gate must not treat "not loaded yet" as "no lock enrolled", or a
// locked device would flash its data on every cold start.
export const subscribeToSettingsReady = appSettings.subscribeReady;
export const isSettingsReady = appSettings.isReady;
export const isSettingsReadyOnServer = appSettings.isReadyOnServer;
export const setLockEnrolment = appSettings.setLockEnrolment;
export const setRelockAfter = appSettings.setRelockAfter;
export const relockAfterMs = appSettings.relockAfterMs;
export const markInstalled = appSettings.markInstalled;

export function setPracticePrefs(changes: Partial<PracticePrefs>): void {
  appSettings.set({
    practice: { ...getSettingsSnapshot().practice, ...changes },
  });
}

export function setKeyboardPrefs(changes: Partial<KeyboardPrefs>): void {
  appSettings.set({
    keyboard: { ...getSettingsSnapshot().keyboard, ...changes },
  });
}

export function setNotation(notation: Notation): void {
  appSettings.set({ notation });
}
