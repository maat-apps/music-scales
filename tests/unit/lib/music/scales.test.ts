import { describe, expect, it } from "vitest";

import { noteName, type SpelledNote } from "@/lib/music/notes";
import {
  degreeLabel,
  isHeptatonic,
  SCALE_IDS,
  scaleById,
  scaleNotesByPitchClass,
  scaleSemitones,
  scaleSteps,
  spellScale,
  type ScaleId,
} from "@/lib/music/scales";

function names(notes: SpelledNote[]): string {
  return notes.map((note) => noteName(note, "international")).join(" ");
}

function spelled(rootPc: number, id: ScaleId): string {
  return names(spellScale(rootPc, scaleById(id)));
}

describe("scales", () => {
  it("has all twelve, in order", () => {
    expect(SCALE_IDS).toEqual([
      "major",
      "naturalMinor",
      "harmonicMinor",
      "melodicMinor",
      "dorian",
      "phrygian",
      "lydian",
      "mixolydian",
      "locrian",
      "majorPentatonic",
      "minorPentatonic",
      "blues",
    ]);
  });

  it.each<[ScaleId, number[]]>([
    ["major", [0, 2, 4, 5, 7, 9, 11]],
    ["naturalMinor", [0, 2, 3, 5, 7, 8, 10]],
    ["harmonicMinor", [0, 2, 3, 5, 7, 8, 11]],
    ["melodicMinor", [0, 2, 3, 5, 7, 9, 11]],
    ["dorian", [0, 2, 3, 5, 7, 9, 10]],
    ["phrygian", [0, 1, 3, 5, 7, 8, 10]],
    ["lydian", [0, 2, 4, 6, 7, 9, 11]],
    ["mixolydian", [0, 2, 4, 5, 7, 9, 10]],
    ["locrian", [0, 1, 3, 5, 6, 8, 10]],
    ["majorPentatonic", [0, 2, 4, 7, 9]],
    ["minorPentatonic", [0, 3, 5, 7, 10]],
    ["blues", [0, 3, 5, 6, 7, 10]],
  ])("%s has the semitones %j", (id, semitones) => {
    expect(scaleSemitones(scaleById(id))).toEqual(semitones);
  });

  it("knows which scales have seven notes", () => {
    expect(isHeptatonic(scaleById("dorian"))).toBe(true);
    expect(isHeptatonic(scaleById("blues"))).toBe(false);
  });
});

describe("scaleSteps", () => {
  it("measures each gap, the last one up to the octave", () => {
    expect(scaleSteps(scaleById("major"))).toEqual([2, 2, 1, 2, 2, 2, 1]);
    expect(scaleSteps(scaleById("harmonicMinor"))).toEqual([
      2, 1, 2, 2, 1, 3, 1,
    ]);
    expect(scaleSteps(scaleById("blues"))).toEqual([3, 2, 1, 1, 3, 2]);
  });
});

describe("degreeLabel", () => {
  it("writes the alteration before the number", () => {
    expect(scaleById("lydian").degrees.map(degreeLabel).join(" ")).toBe(
      "1 2 3 ♯4 5 6 7",
    );
    expect(scaleById("locrian").degrees.map(degreeLabel).join(" ")).toBe(
      "1 ♭2 ♭3 4 ♭5 ♭6 ♭7",
    );
  });
});

describe("spellScale", () => {
  it("uses every letter once in a seven-note scale", () => {
    expect(spelled(5, "major")).toBe("F G A B♭ C D E");
    expect(spelled(2, "major")).toBe("D E F♯ G A B C♯");
    expect(spelled(9, "harmonicMinor")).toBe("A B C D E F G♯");
  });

  it("names the root the way that needs fewer accidentals", () => {
    expect(spelled(1, "major")).toBe("D♭ E♭ F G♭ A♭ B♭ C");
    expect(spelled(1, "naturalMinor")).toBe("C♯ D♯ E F♯ G♯ A B");
    expect(spelled(3, "major")).toBe("E♭ F G A♭ B♭ C D");
    expect(spelled(10, "dorian")).toBe("B♭ C D♭ E♭ F G A♭");
  });

  it("keeps the sharp on a tie", () => {
    expect(spelled(6, "major")).toBe("F♯ G♯ A♯ B C♯ D♯ E♯");
  });

  it("spells a double sharp where the scale needs one", () => {
    expect(spelled(4, "harmonicMinor")).toBe("E F♯ G A B C D♯");
    expect(spelled(8, "harmonicMinor")).toBe("G♯ A♯ B C♯ D♯ E F𝄪");
    expect(spelled(11, "harmonicMinor")).toBe("B C♯ D E F♯ G A♯");
  });

  it("spells pentatonics and blues like their parent keys", () => {
    expect(spelled(0, "majorPentatonic")).toBe("C D E G A");
    expect(spelled(9, "minorPentatonic")).toBe("A C D E G");
    expect(spelled(0, "blues")).toBe("C E♭ F G♭ G B♭");
    expect(spelled(1, "blues")).toBe("C♯ E F♯ G G♯ B");
  });

  it("spells the modes from their own root", () => {
    expect(spelled(2, "dorian")).toBe("D E F G A B C");
    expect(spelled(4, "phrygian")).toBe("E F G A B C D");
    expect(spelled(5, "lydian")).toBe("F G A B C D E");
    expect(spelled(7, "mixolydian")).toBe("G A B C D E F");
    expect(spelled(11, "locrian")).toBe("B C D E F G A");
  });
});

describe("scaleNotesByPitchClass", () => {
  it("finds each note of the scale by its pitch class", () => {
    const notes = scaleNotesByPitchClass(5, scaleById("major"));
    expect(notes.size).toBe(7);
    expect(notes.get(10)).toEqual({ letter: "B", accidental: -1 });
    expect(notes.has(11)).toBe(false);
  });
});
