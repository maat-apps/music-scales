import {
  letterAbove,
  pitchClass,
  pitchClassOf,
  simpleSpellings,
  spellAs,
  type SpelledNote,
} from "./notes";

// A scale is a list of degrees ("1 2 ♭3 4 5 ♭6 ♭7"), not just semitones:
// the degree number names each note's letter, so spelling it from any root
// comes out right — and pentatonics and blues spell like their parent keys.

export type Degree = { step: number; alteration: number };

/** Semitones above the root of each unaltered degree, 1–7 (the major scale). */
const MAJOR_DEGREE_SEMITONES = [0, 2, 4, 5, 7, 9, 11];

const SCALE_DEGREES = {
  major: "1 2 3 4 5 6 7",
  naturalMinor: "1 2 ♭3 4 5 ♭6 ♭7",
  harmonicMinor: "1 2 ♭3 4 5 ♭6 7",
  melodicMinor: "1 2 ♭3 4 5 6 7",
  dorian: "1 2 ♭3 4 5 6 ♭7",
  phrygian: "1 ♭2 ♭3 4 5 ♭6 ♭7",
  lydian: "1 2 3 ♯4 5 6 7",
  mixolydian: "1 2 3 4 5 6 ♭7",
  locrian: "1 ♭2 ♭3 4 ♭5 ♭6 ♭7",
  majorPentatonic: "1 2 3 5 6",
  minorPentatonic: "1 ♭3 4 5 ♭7",
  blues: "1 ♭3 4 ♭5 5 ♭7",
} as const;

export type ScaleId = keyof typeof SCALE_DEGREES;

export type Scale = { id: ScaleId; degrees: Degree[] };

const ALTERATIONS: Record<string, number> = { "♭": -1, "♯": 1 };

function parseDegree(text: string): Degree {
  const alteration = ALTERATIONS[text[0]] ?? 0;
  return { step: Number(text.slice(alteration === 0 ? 0 : 1)), alteration };
}

export const SCALES: Scale[] = Object.entries(SCALE_DEGREES).map(
  ([id, degrees]) => ({
    id: id as ScaleId,
    degrees: degrees.split(" ").map(parseDegree),
  }),
);

export const SCALE_IDS = SCALES.map((scale) => scale.id);

export function scaleById(id: ScaleId): Scale {
  return SCALES.find((scale) => scale.id === id)!;
}

/** Seven degrees: the scales diatonic chords are built on. */
export function isHeptatonic(scale: Scale): boolean {
  return scale.degrees.length === 7;
}

/** Semitones above the root, ascending: major → 0 2 4 5 7 9 11. */
export function scaleSemitones(scale: Scale): number[] {
  return scale.degrees.map(
    ({ step, alteration }) => MAJOR_DEGREE_SEMITONES[step - 1] + alteration,
  );
}

/** The gap to each next note, the last one back up to the octave. */
export function scaleSteps(scale: Scale): number[] {
  const semitones = scaleSemitones(scale);
  return semitones.map((value, i) => (semitones[i + 1] ?? 12) - value);
}

/** "♭3", "♯4", "5" — how the degree reads in a formula. */
export function degreeLabel({ step, alteration }: Degree): string {
  const sign = alteration < 0 ? "♭" : alteration > 0 ? "♯" : "";
  return `${sign}${step}`;
}

function spellFrom(root: SpelledNote, scale: Scale): SpelledNote[] {
  const rootPc = pitchClassOf(root);
  const semitones = scaleSemitones(scale);
  return scale.degrees.map(({ step }, i) =>
    spellAs(
      letterAbove(root.letter, step - 1),
      pitchClass(rootPc + semitones[i]),
    ),
  );
}

/** How many accidentals a spelling needs; a double one counts twice. */
function accidentalCount(notes: SpelledNote[]): number {
  return notes.reduce((sum, note) => sum + Math.abs(note.accidental), 0);
}

/**
 * The scale on `rootPc`, spelled from whichever name of the root needs
 * fewer accidentals — D♭ major rather than C♯ major, but C♯ minor rather
 * than D♭ minor; a tie keeps the sharp (F♯ major).
 */
export function spellScale(rootPc: number, scale: Scale): SpelledNote[] {
  const [first, ...others] = simpleSpellings(rootPc).map((root) =>
    spellFrom(root, scale),
  );
  return others.reduce(
    (best, candidate) =>
      accidentalCount(candidate) < accidentalCount(best) ? candidate : best,
    first,
  );
}

/** The scale's notes by pitch class, as the keyboard marks them. */
export function scaleNotesByPitchClass(
  rootPc: number,
  scale: Scale,
): Map<number, SpelledNote> {
  return new Map(
    spellScale(rootPc, scale).map((note) => [pitchClassOf(note), note]),
  );
}
