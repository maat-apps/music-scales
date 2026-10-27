import { PITCH_CLASS_COUNT } from "../../lib/music/notes";

/** Two octaves from the C at or below the lowest note: room for any close
 * voicing, which spans less than an octave. */
const OCTAVES = 2;
const WHITE_WIDTH = 12;
const WHITE_HEIGHT = 40;
const BLACK_WIDTH = 8;
const BLACK_HEIGHT = 24;
/** Each pitch class's white-key index within its octave, or, for a black
 * key, that of the white key on its left. */
const WHITE_INDEX = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];
const BLACK_PITCH_CLASSES = new Set([1, 3, 6, 8, 10]);
const WHITES_PER_OCTAVE = 7;

type Key = { midi: number; x: number; black: boolean };

function keysFrom(lowestC: number): Key[] {
  return Array.from({ length: OCTAVES * PITCH_CLASS_COUNT }, (_, offset) => {
    const pc = offset % PITCH_CLASS_COUNT;
    const octave = Math.floor(offset / PITCH_CLASS_COUNT);
    const white = octave * WHITES_PER_OCTAVE + WHITE_INDEX[pc];
    const black = BLACK_PITCH_CLASSES.has(pc);
    return {
      midi: lowestC + offset,
      x: black
        ? (white + 1) * WHITE_WIDTH - BLACK_WIDTH / 2
        : white * WHITE_WIDTH,
      black,
    };
  });
}

/** The dot marking the bass: its radius, and its centre's height on a
 * white and a black key. */
const DOT_RADIUS = 3;
const WHITE_DOT_Y = WHITE_HEIGHT - 7;
const BLACK_DOT_Y = BLACK_HEIGHT - 6;

/**
 * A small keyboard picture of one voicing, coloured like the big keyboard:
 * its keys real white and black, the rest grey, and the lowest (the bass)
 * marked with the root's dot. Decorative; the notes are named beside it.
 */
export function ChordKeys({ midis }: { midis: number[] }) {
  const lowestC = midis[0] - (midis[0] % PITCH_CLASS_COUNT);
  const keys = keysFrom(lowestC);
  const width = OCTAVES * WHITES_PER_OCTAVE * WHITE_WIDTH;

  function fill(key: Key): string {
    if (midis.includes(key.midi)) {
      return key.black ? "var(--key-black)" : "var(--key-white)";
    }
    return key.black ? "var(--key-off-black)" : "var(--key-off-white)";
  }

  function dot(key: Key) {
    const width = key.black ? BLACK_WIDTH : WHITE_WIDTH;
    return (
      <circle
        key={`dot-${key.midi}`}
        cx={key.x + width / 2}
        cy={key.black ? BLACK_DOT_Y : WHITE_DOT_Y}
        r={DOT_RADIUS}
        fill="var(--key-root)"
      />
    );
  }

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${width} ${WHITE_HEIGHT}`}
      // Inline, so a Button's icon sizing (its svgs 16px) can't shrink it.
      style={{ width: width, height: WHITE_HEIGHT, flexShrink: 0 }}
    >
      {[false, true].map((black) =>
        keys
          .filter((key) => key.black === black)
          .map((key) => (
            <rect
              key={key.midi}
              x={key.x + 0.5}
              y={0.5}
              width={(black ? BLACK_WIDTH : WHITE_WIDTH) - 1}
              height={(black ? BLACK_HEIGHT : WHITE_HEIGHT) - 1}
              rx={1.5}
              fill={fill(key)}
              stroke="var(--key-edge)"
              strokeWidth={1}
            />
          )),
      )}
      {keys.filter((key) => key.midi === midis[0]).map(dot)}
    </svg>
  );
}
