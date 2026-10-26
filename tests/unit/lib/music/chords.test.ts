import { describe, expect, it } from "vitest";

import {
  chordKind,
  chordName,
  chordNoteNames,
  chordVoicings,
  diatonicChords,
  type ChordSize,
} from "@/lib/music/chords";
import { type Notation } from "@/lib/music/notes";
import { scaleById, type Scale, type ScaleId } from "@/lib/music/scales";

function chords(
  rootPc: number,
  id: ScaleId,
  size: ChordSize,
  notation: Notation = "international",
) {
  return diatonicChords(rootPc, scaleById(id), size)!.map((chord) => [
    chordName(chord, notation),
    chord.numeral,
  ]);
}

describe("diatonicChords — triads", () => {
  it("builds C major's", () => {
    expect(chords(0, "major", 3)).toEqual([
      ["C", "I"],
      ["Dm", "ii"],
      ["Em", "iii"],
      ["F", "IV"],
      ["G", "V"],
      ["Am", "vi"],
      ["B°", "vii°"],
    ]);
  });

  it("builds A natural minor's", () => {
    expect(chords(9, "naturalMinor", 3)).toEqual([
      ["Am", "i"],
      ["B°", "ii°"],
      ["C", "III"],
      ["Dm", "iv"],
      ["Em", "v"],
      ["F", "VI"],
      ["G", "VII"],
    ]);
  });

  it("marks the augmented chord in harmonic minor", () => {
    expect(chords(9, "harmonicMinor", 3)).toEqual([
      ["Am", "i"],
      ["B°", "ii°"],
      ["C+", "III+"],
      ["Dm", "iv"],
      ["E", "V"],
      ["F", "VI"],
      ["G♯°", "vii°"],
    ]);
  });

  it("spells the chord roots like the scale", () => {
    expect(chords(5, "major", 3).map(([name]) => name)).toEqual([
      "F",
      "Gm",
      "Am",
      "B♭",
      "C",
      "Dm",
      "E°",
    ]);
  });
});

describe("diatonicChords — seventh chords", () => {
  it("builds C major's", () => {
    expect(chords(0, "major", 4)).toEqual([
      ["Cmaj7", "Imaj7"],
      ["Dm7", "ii7"],
      ["Em7", "iii7"],
      ["Fmaj7", "IVmaj7"],
      ["G7", "V7"],
      ["Am7", "vi7"],
      ["Bm7♭5", "viiø7"],
    ]);
  });

  it("builds A harmonic minor's", () => {
    expect(chords(9, "harmonicMinor", 4)).toEqual([
      ["Am(maj7)", "i(maj7)"],
      ["Bm7♭5", "iiø7"],
      ["Cmaj7♯5", "III+maj7"],
      ["Dm7", "iv7"],
      ["E7", "V7"],
      ["Fmaj7", "VImaj7"],
      ["G♯°7", "vii°7"],
    ]);
  });

  it("builds C melodic minor's", () => {
    expect(chords(0, "melodicMinor", 4)).toEqual([
      ["Cm(maj7)", "i(maj7)"],
      ["Dm7", "ii7"],
      ["E♭maj7♯5", "III+maj7"],
      ["F7", "IV7"],
      ["G7", "V7"],
      ["Am7♭5", "viø7"],
      ["Bm7♭5", "viiø7"],
    ]);
  });

  it("builds a mode's from its own root", () => {
    expect(chords(7, "mixolydian", 4)).toEqual([
      ["G7", "I7"],
      ["Am7", "ii7"],
      ["Bm7♭5", "iiiø7"],
      ["Cmaj7", "IVmaj7"],
      ["Dm7", "v7"],
      ["Em7", "vi7"],
      ["Fmaj7", "VIImaj7"],
    ]);
  });

  it("writes H in Polish notation", () => {
    expect(chords(0, "major", 4, "polish")[6]).toEqual(["Hm7♭5", "viiø7"]);
    expect(chords(5, "major", 4, "polish")[3]).toEqual(["Bmaj7", "IVmaj7"]);
  });

  it("lists each chord's notes, spelled like the scale", () => {
    const sevenths = diatonicChords(5, scaleById("major"), 4)!;
    expect(
      sevenths.map((chord) => chordNoteNames(chord, "international")),
    ).toEqual([
      "F A C E",
      "G B♭ D F",
      "A C E G",
      "B♭ D F A",
      "C E G B♭",
      "D F A C",
      "E G B♭ D",
    ]);
  });

  it("names a chord's notes in Polish notation", () => {
    const [, , , , dominant] = diatonicChords(0, scaleById("major"), 3)!;
    expect(chordNoteNames(dominant, "polish")).toBe("G H D");
  });

  it("stacks thirds past the octave", () => {
    const [, , , , dominant] = diatonicChords(0, scaleById("major"), 4)!;
    expect(dominant.semitones).toEqual([7, 11, 14, 17]);
  });
});

describe("diatonicChords — other scales", () => {
  it("has none for pentatonics and blues", () => {
    expect(diatonicChords(0, scaleById("majorPentatonic"), 3)).toBeNull();
    expect(diatonicChords(0, scaleById("blues"), 4)).toBeNull();
  });

  it("marks a chord it has no name for", () => {
    const clusters: Scale = {
      id: "major",
      degrees: [1, 2, 3, 4, 5, 6, 7].map((step) => ({
        step,
        alteration: 0,
      })),
    };
    // 1 2 𝄫3: the first chord is C D G, a sus2 this app has no name for.
    clusters.degrees[2] = { step: 3, alteration: -2 };
    const [first] = diatonicChords(0, clusters, 3)!;
    expect(first.symbol).toBe("?");
  });
});

describe("chordVoicings", () => {
  it("inverts a triad twice", () => {
    const [tonic] = diatonicChords(0, scaleById("major"), 3)!;
    const voicings = chordVoicings(tonic);
    expect(
      voicings.map((voicing) => chordNoteNames(voicing, "international")),
    ).toEqual(["C E G", "E G C", "G C E"]);
    expect(voicings.map((voicing) => voicing.semitones)).toEqual([
      [0, 4, 7],
      [4, 7, 12],
      [7, 12, 16],
    ]);
  });

  it("inverts a seventh chord three times, keeping the scale's spelling", () => {
    const [, , , , dominant] = diatonicChords(5, scaleById("major"), 4)!;
    const voicings = chordVoicings(dominant);
    expect(voicings.map((voicing) => voicing.inversion)).toEqual([0, 1, 2, 3]);
    expect(chordNoteNames(voicings[3], "international")).toBe("B♭ C E G");
    expect(voicings[3].semitones).toEqual([17, 19, 23, 26]);
  });
});

describe("chordKind", () => {
  it("knows the augmented seventh", () => {
    expect(chordKind([4, 8, 10])).toEqual({ symbol: "7♯5", numeral: "+7" });
  });

  it("knows nothing of other stacks", () => {
    expect(chordKind([2, 7])).toBeUndefined();
  });
});
