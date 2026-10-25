import { describe, expect, it } from "vitest";

import { chordMidis, keyboardKeys } from "@/lib/music/keyboard";

describe("keyboardKeys", () => {
  it("spans whole octaves from a C, plus the closing C", () => {
    const keys = keyboardKeys(4, 1);
    expect(keys).toHaveLength(13);
    expect(keys[0]).toEqual({
      midi: 60,
      pitchClass: 0,
      octave: 4,
      black: false,
      whiteIndex: 0,
    });
    expect(keys.at(-1)).toEqual({
      midi: 72,
      pitchClass: 0,
      octave: 5,
      black: false,
      whiteIndex: 7,
    });
  });

  it("has 15 white keys over two octaves", () => {
    const keys = keyboardKeys(3, 2);
    expect(keys.filter((key) => !key.black)).toHaveLength(15);
    expect(keys.filter((key) => key.black)).toHaveLength(10);
  });

  it("places a black key after the white key to its left", () => {
    const [, cSharp, , dSharp, , , fSharp] = keyboardKeys(4, 1);
    expect([cSharp.black, cSharp.whiteIndex]).toEqual([true, 0]);
    expect(dSharp.whiteIndex).toBe(1);
    expect(fSharp.whiteIndex).toBe(3);
  });

  it("starts in the chosen octave", () => {
    const keys = keyboardKeys(1, 4);
    expect(keys[0].midi).toBe(24);
    expect(keys.at(-1)!.midi).toBe(72);
  });
});

describe("chordMidis", () => {
  it("plays the chord from the scale's root in the start octave", () => {
    expect(chordMidis(0, [7, 11, 14, 17], 4)).toEqual([67, 71, 74, 77]);
    expect(chordMidis(9, [0, 3, 7], 3)).toEqual([57, 60, 64]);
  });
});
