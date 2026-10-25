import { midiOf, PITCH_CLASS_COUNT, pitchClass } from "./notes";

// The on-screen keyboard: whole octaves from a C, plus the closing C.

export const OCTAVE_COUNTS = [1, 2, 3, 4] as const;
export type OctaveCount = (typeof OCTAVE_COUNTS)[number];

/** Scientific octave numbers the keyboard can start on (C4 = middle C). */
export const START_OCTAVES = [1, 2, 3, 4, 5] as const;
export type StartOctave = (typeof START_OCTAVES)[number];

const BLACK_PITCH_CLASSES = new Set([1, 3, 6, 8, 10]);

export type PianoKey = {
  midi: number;
  pitchClass: number;
  octave: number;
  black: boolean;
  /** A white key's own position among the white keys; a black key's is the
   * white key to its left. */
  whiteIndex: number;
};

export function keyboardKeys(
  startOctave: StartOctave,
  octaves: OctaveCount,
): PianoKey[] {
  const first = midiOf(0, startOctave);
  const keys: PianoKey[] = [];
  let whiteIndex = -1;
  for (let midi = first; midi <= first + PITCH_CLASS_COUNT * octaves; midi++) {
    const pc = pitchClass(midi);
    const black = BLACK_PITCH_CLASSES.has(pc);
    if (!black) whiteIndex++;
    keys.push({
      midi,
      pitchClass: pc,
      octave: Math.floor(midi / PITCH_CLASS_COUNT) - 1,
      black,
      whiteIndex,
    });
  }
  return keys;
}

/** A chord's notes as MIDI numbers, its scale's root in `startOctave`. */
export function chordMidis(
  rootPc: number,
  semitones: number[],
  startOctave: StartOctave,
): number[] {
  const root = midiOf(rootPc, startOctave);
  return semitones.map((semitone) => root + semitone);
}
