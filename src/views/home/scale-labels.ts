import type { ScaleId } from "../../lib/music/scales";

/** Each scale's name in the catalogs. */
export const SCALE_LABELS = {
  major: "scaleMajor",
  naturalMinor: "scaleNaturalMinor",
  harmonicMinor: "scaleHarmonicMinor",
  melodicMinor: "scaleMelodicMinor",
  dorian: "scaleDorian",
  phrygian: "scalePhrygian",
  lydian: "scaleLydian",
  mixolydian: "scaleMixolydian",
  locrian: "scaleLocrian",
  majorPentatonic: "scaleMajorPentatonic",
  minorPentatonic: "scaleMinorPentatonic",
  blues: "scaleBlues",
} as const satisfies Record<ScaleId, string>;
