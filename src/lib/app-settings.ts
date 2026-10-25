import {
  DEFAULT_RELOCK_AFTER_MS,
  type LockEnrolment,
  parseLockEnrolment,
} from "@maat-apps/core/lock";
import { createPersistedStore } from "@maat-apps/core/persisted";

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

// Everything this app remembers: the app lock's enrolment, browser/install
// state, and what was last practised. @maat-apps/core/persisted keeps them
// in memory, backed by IndexedDB.

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

/** Right away, after 30 seconds in the background, or only once closed. */
export const RELOCK_CHOICES = ["now", "30s", "close"] as const;
export type RelockAfter = (typeof RELOCK_CHOICES)[number];

const RELOCK_AFTER_MS: Record<RelockAfter, number | null> = {
  now: 0,
  "30s": DEFAULT_RELOCK_AFTER_MS,
  close: null,
};

export type AppSettings = {
  /** The app lock's enrolment (@maat-apps/core/lock), `null` when off. */
  lock: LockEnrolment | null;
  /** How soon the lock comes back once the app is left. */
  relockAfter: RelockAfter;
  installed: boolean;
  practice: PracticePrefs;
  keyboard: KeyboardPrefs;
  notation: Notation;
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

const settingsStore = createPersistedStore<AppSettings>({
  storage: keyValueStore,
  key: SETTINGS_KEY,
  defaults: {
    lock: null,
    relockAfter: "30s",
    installed: false,
    practice: DEFAULT_PRACTICE,
    keyboard: DEFAULT_KEYBOARD,
    notation: "international",
  },
  parse: (stored) => {
    const value = record(stored);
    return {
      lock: parseLockEnrolment(value.lock),
      relockAfter: pick(value.relockAfter, RELOCK_CHOICES, "30s"),
      installed: value.installed === true,
      practice: parsePractice(value.practice),
      keyboard: parseKeyboard(value.keyboard),
      notation: pick(value.notation, NOTATIONS, "international"),
    };
  },
});

/** Test-only: resolves once the initial background read has finished. */
export const whenLoaded = settingsStore.whenLoaded;
export const subscribeToSettings = settingsStore.subscribe;
export const getSettingsSnapshot = settingsStore.getSnapshot;
export const getServerSettingsSnapshot = settingsStore.getServerSnapshot;
// The lock gate must not treat "not loaded yet" as "no lock enrolled", or a
// locked device would flash its data on every cold start.
export const subscribeToSettingsReady = settingsStore.subscribeReady;
export const isSettingsReady = settingsStore.isReady;

export function isSettingsReadyOnServer(): boolean {
  return false;
}

export function setLockEnrolment(lock: LockEnrolment | null): void {
  settingsStore.set({ lock });
}

export function setRelockAfter(relockAfter: RelockAfter): void {
  settingsStore.set({ relockAfter });
}

/** The lock's `relockAfterMs`: read on every hide, so a change applies at once. */
export function relockAfterMs(): number | null {
  return RELOCK_AFTER_MS[getSettingsSnapshot().relockAfter];
}

/** Chrome stops offering the install prompt once installed, even to a plain
 * browser tab — this flag is the only record of it. */
export function markInstalled(): void {
  if (getSettingsSnapshot().installed) return;
  settingsStore.set({ installed: true });
}

export function setPracticePrefs(changes: Partial<PracticePrefs>): void {
  settingsStore.set({
    practice: { ...getSettingsSnapshot().practice, ...changes },
  });
}

export function setKeyboardPrefs(changes: Partial<KeyboardPrefs>): void {
  settingsStore.set({
    keyboard: { ...getSettingsSnapshot().keyboard, ...changes },
  });
}

export function setNotation(notation: Notation): void {
  settingsStore.set({ notation });
}
