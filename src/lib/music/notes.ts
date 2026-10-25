// Note names and pitch arithmetic. A note is spelled — a letter plus an
// accidental — not just a pitch class, so F major reads B♭ and not A♯.

export const LETTERS = ["C", "D", "E", "F", "G", "A", "B"] as const;
export type Letter = (typeof LETTERS)[number];

/** Semitones above C of each natural note. */
const NATURAL_PITCH: Record<Letter, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

export const PITCH_CLASS_COUNT = 12;

/** `accidental` in semitones: −2 double flat … +2 double sharp. */
export type SpelledNote = { letter: Letter; accidental: number };

/** International (B, B♭) or Polish (H, B) note names. */
export const NOTATIONS = ["international", "polish"] as const;
export type Notation = (typeof NOTATIONS)[number];

const ACCIDENTAL_SIGNS: Record<number, string> = {
  [-2]: "𝄫",
  [-1]: "♭",
  0: "",
  1: "♯",
  2: "𝄪",
};

/** 0–11, for any integer (negative too). */
export function pitchClass(semitones: number): number {
  return (
    ((semitones % PITCH_CLASS_COUNT) + PITCH_CLASS_COUNT) % PITCH_CLASS_COUNT
  );
}

export function pitchClassOf(note: SpelledNote): number {
  return pitchClass(NATURAL_PITCH[note.letter] + note.accidental);
}

/** The letter `steps` letters above `letter` (C + 2 → E, B + 1 → C). */
export function letterAbove(letter: Letter, steps: number): Letter {
  return LETTERS[(LETTERS.indexOf(letter) + steps) % LETTERS.length];
}

/** `letter` spelled with whatever accidental reaches `targetPitchClass`. */
export function spellAs(letter: Letter, targetPitchClass: number): SpelledNote {
  // Into −6…5, so B up to C reads as a sharp, not eleven flats.
  const offset = pitchClass(targetPitchClass - NATURAL_PITCH[letter] + 6) - 6;
  return { letter, accidental: offset };
}

/** The ways to spell a pitch class with at most one accidental: one for a
 * white key (D), two for a black key — sharp first (C♯, D♭). */
export function simpleSpellings(pc: number): SpelledNote[] {
  const natural = LETTERS.find((letter) => NATURAL_PITCH[letter] === pc);
  if (natural) return [{ letter: natural, accidental: 0 }];
  const below = LETTERS.find((letter) => NATURAL_PITCH[letter] === pc - 1);
  const above = LETTERS.find((letter) => NATURAL_PITCH[letter] === pc + 1);
  return [
    { letter: below!, accidental: 1 },
    { letter: above!, accidental: -1 },
  ];
}

/** "F♯", "B♭" — or in Polish notation "H" for B and "B" for B♭. */
export function noteName(note: SpelledNote, notation: Notation): string {
  const sign = ACCIDENTAL_SIGNS[note.accidental];
  if (notation === "polish" && note.letter === "B") {
    return note.accidental === -1 ? "B" : `H${sign}`;
  }
  return `${note.letter}${sign}`;
}

/** MIDI number of `pc` in scientific octave `octave` (C4 = 60). */
export function midiOf(pc: number, octave: number): number {
  return PITCH_CLASS_COUNT * (octave + 1) + pc;
}

/** Equal temperament, A4 = 440 Hz. */
export function midiToFrequency(midi: number): number {
  return 440 * 2 ** ((midi - 69) / PITCH_CLASS_COUNT);
}
