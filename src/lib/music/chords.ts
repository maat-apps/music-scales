import { noteName, type Notation, type SpelledNote } from "./notes";
import { isHeptatonic, scaleSemitones, spellScale, type Scale } from "./scales";

// Diatonic chords: stack every other note of a seven-note scale on each
// degree — three notes for triads, four for seventh chords.

export const CHORD_SIZES = [3, 4] as const;
export type ChordSize = (typeof CHORD_SIZES)[number];

/** How a chord is written: after its root ("m7♭5") and after its Roman
 * numeral ("ø7"); the numeral is upper case for a major third. */
type ChordKind = { symbol: string; numeral: string };

/** By the chord's intervals above its root, in semitones. */
const CHORD_KINDS: Record<string, ChordKind> = {
  "4 7": { symbol: "", numeral: "" },
  "3 7": { symbol: "m", numeral: "" },
  "3 6": { symbol: "°", numeral: "°" },
  "4 8": { symbol: "+", numeral: "+" },
  "4 7 11": { symbol: "maj7", numeral: "maj7" },
  "4 7 10": { symbol: "7", numeral: "7" },
  "3 7 10": { symbol: "m7", numeral: "7" },
  "3 6 10": { symbol: "m7♭5", numeral: "ø7" },
  "3 6 9": { symbol: "°7", numeral: "°7" },
  "3 7 11": { symbol: "m(maj7)", numeral: "(maj7)" },
  "4 8 11": { symbol: "maj7♯5", numeral: "+maj7" },
  "4 8 10": { symbol: "7♯5", numeral: "+7" },
};

const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII"];

export type DiatonicChord = {
  /** Its notes from the root up, spelled like the scale: C E G B. */
  notes: SpelledNote[];
  /** After the root name: "", "m", "°", "maj7", "m7♭5"… */
  symbol: string;
  /** "I", "ii", "vii°", "V7", "viiø7"… */
  numeral: string;
  /** Semitones above the scale's root, ascending (past 12 when it wraps). */
  semitones: number[];
};

/** The chord built of these intervals above its root, if it's one this app
 * names — every chord a scale here builds is. */
export function chordKind(intervals: number[]): ChordKind | undefined {
  return CHORD_KINDS[intervals.join(" ")];
}

function chordOn(
  degree: number,
  size: ChordSize,
  semitones: number[],
  notes: SpelledNote[],
): DiatonicChord {
  const indexes = Array.from({ length: size }, (_, i) => degree + 2 * i);
  const tones = indexes.map(
    (index) => semitones[index % 7] + 12 * Math.floor(index / 7),
  );
  const intervals = tones.slice(1).map((tone) => tone - tones[0]);
  const kind = chordKind(intervals) ?? { symbol: "?", numeral: "?" };
  const roman = ROMAN_NUMERALS[degree];
  return {
    notes: indexes.map((index) => notes[index % 7]),
    symbol: kind.symbol,
    numeral: (intervals[0] === 4 ? roman : roman.toLowerCase()) + kind.numeral,
    semitones: tones,
  };
}

/** One chord per degree, or `null` for a scale without seven notes
 * (pentatonics, blues), which has no such set. */
export function diatonicChords(
  rootPc: number,
  scale: Scale,
  size: ChordSize,
): DiatonicChord[] | null {
  if (!isHeptatonic(scale)) return null;
  const semitones = scaleSemitones(scale);
  const notes = spellScale(rootPc, scale);
  return notes.map((_, degree) => chordOn(degree, size, semitones, notes));
}

/** "Cmaj7", "F♯m7♭5", or in Polish notation "Hm7♭5". */
export function chordName(chord: DiatonicChord, notation: Notation): string {
  return noteName(chord.notes[0], notation) + chord.symbol;
}

/** "C E G B", or in Polish notation "C E G H". */
export function chordNoteNames(
  chord: DiatonicChord,
  notation: Notation,
): string {
  return chord.notes.map((note) => noteName(note, notation)).join(" ");
}
