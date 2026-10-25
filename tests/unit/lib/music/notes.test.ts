import { describe, expect, it } from "vitest";

import {
  letterAbove,
  midiOf,
  midiToFrequency,
  noteName,
  pitchClass,
  pitchClassOf,
  simpleSpellings,
  spellAs,
} from "@/lib/music/notes";

describe("pitchClass", () => {
  it("wraps any integer into 0–11", () => {
    expect([0, 11, 12, 25, -1, -13].map(pitchClass)).toEqual([
      0, 11, 0, 1, 11, 11,
    ]);
  });
});

describe("pitchClassOf", () => {
  it("adds the accidental to the natural note", () => {
    expect(pitchClassOf({ letter: "C", accidental: 1 })).toBe(1);
    expect(pitchClassOf({ letter: "C", accidental: -1 })).toBe(11);
    expect(pitchClassOf({ letter: "F", accidental: 2 })).toBe(7);
  });
});

describe("letterAbove", () => {
  it("counts letters, wrapping after B", () => {
    expect(letterAbove("C", 2)).toBe("E");
    expect(letterAbove("B", 1)).toBe("C");
    expect(letterAbove("A", 6)).toBe("G");
  });
});

describe("spellAs", () => {
  it("picks the accidental closest to the natural note", () => {
    expect(spellAs("B", 0)).toEqual({ letter: "B", accidental: 1 });
    expect(spellAs("C", 11)).toEqual({ letter: "C", accidental: -1 });
    expect(spellAs("F", 7)).toEqual({ letter: "F", accidental: 2 });
    expect(spellAs("E", 4)).toEqual({ letter: "E", accidental: 0 });
  });
});

describe("simpleSpellings", () => {
  it("has one name for a white key", () => {
    expect(simpleSpellings(4)).toEqual([{ letter: "E", accidental: 0 }]);
  });

  it("has a sharp, then a flat for a black key", () => {
    expect(simpleSpellings(10)).toEqual([
      { letter: "A", accidental: 1 },
      { letter: "B", accidental: -1 },
    ]);
  });
});

describe("noteName", () => {
  const b = { letter: "B", accidental: 0 } as const;
  const bFlat = { letter: "B", accidental: -1 } as const;

  it("writes accidentals as signs", () => {
    expect(noteName({ letter: "F", accidental: 1 }, "international")).toBe(
      "F♯",
    );
    expect(noteName({ letter: "E", accidental: -1 }, "international")).toBe(
      "E♭",
    );
    expect(noteName({ letter: "F", accidental: 2 }, "international")).toBe(
      "F𝄪",
    );
    expect(noteName({ letter: "D", accidental: -2 }, "international")).toBe(
      "D𝄫",
    );
  });

  it("keeps B and B♭ in international notation", () => {
    expect(noteName(b, "international")).toBe("B");
    expect(noteName(bFlat, "international")).toBe("B♭");
  });

  it("writes H for B and B for B♭ in Polish notation", () => {
    expect(noteName(b, "polish")).toBe("H");
    expect(noteName(bFlat, "polish")).toBe("B");
    expect(noteName({ letter: "B", accidental: 1 }, "polish")).toBe("H♯");
    expect(noteName({ letter: "B", accidental: -2 }, "polish")).toBe("H𝄫");
  });

  it("leaves the other letters alone in Polish notation", () => {
    expect(noteName({ letter: "E", accidental: -1 }, "polish")).toBe("E♭");
  });
});

describe("midiOf / midiToFrequency", () => {
  it("puts middle C at 60 and A4 at 440 Hz", () => {
    expect(midiOf(0, 4)).toBe(60);
    expect(midiOf(9, 4)).toBe(69);
    expect(midiToFrequency(69)).toBe(440);
    expect(midiToFrequency(81)).toBe(880);
    expect(midiToFrequency(60)).toBeCloseTo(261.63, 2);
  });
});
