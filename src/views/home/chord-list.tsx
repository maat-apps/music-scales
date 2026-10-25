import { Button } from "@maat-apps/ui/button";
import { useTranslation } from "../../i18n/use-translation";
import {
  CHORD_SIZES,
  chordName,
  type ChordSize,
  diatonicChords,
} from "../../lib/music/chords";
import { chordMidis, type StartOctave } from "../../lib/music/keyboard";
import type { Notation } from "../../lib/music/notes";
import type { Scale } from "../../lib/music/scales";
import { synth } from "../../lib/synth";

const SIZE_LABELS = { 3: "triads", 4: "sevenths" } as const satisfies Record<
  ChordSize,
  string
>;

export function ChordList({
  rootPc,
  scale,
  size,
  notation,
  startOctave,
  onSizeChange,
}: {
  rootPc: number;
  scale: Scale;
  size: ChordSize;
  notation: Notation;
  startOctave: StartOctave;
  onSizeChange: (size: ChordSize) => void;
}) {
  const { t } = useTranslation();
  const chords = diatonicChords(rootPc, scale, size);

  if (!chords) {
    return (
      <section className="grid gap-1">
        <h2 className="font-heading m-0 text-lg font-semibold">
          {t("noChordsTitle")}
        </h2>
        <p className="text-muted-foreground m-0 text-sm">
          {t("noChordsDescription")}
        </p>
      </section>
    );
  }

  return (
    <section className="grid gap-3" aria-labelledby="chords-title">
      <h2 id="chords-title" className="font-heading m-0 text-lg font-semibold">
        {t("chordsTitle")}
      </h2>
      <div
        role="group"
        aria-label={t("chordSize")}
        className="bg-card grid grid-cols-2 gap-1 rounded-xl p-1"
      >
        {CHORD_SIZES.map((option) => (
          <Button
            key={option}
            variant={option === size ? "default" : "ghost"}
            aria-pressed={option === size}
            className="h-11 rounded-lg text-base"
            onClick={() => onSizeChange(option)}
          >
            {t(SIZE_LABELS[option])}
          </Button>
        ))}
      </div>
      <p className="text-muted-foreground m-0 text-sm">
        {t(size === 3 ? "triadsHint" : "seventhsHint")}
      </p>
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-2 p-0">
        {chords.map((chord) => {
          const name = chordName(chord, notation);
          return (
            <li key={chord.numeral}>
              <Button
                variant="outline"
                aria-label={t("playChord", { chord: name })}
                className="grid h-auto min-h-16 w-full gap-0.5 rounded-xl py-2"
                onClick={() =>
                  synth.play(chordMidis(rootPc, chord.semitones, startOctave))
                }
              >
                <span className="text-lg font-bold">{name}</span>
                <span className="text-muted-foreground text-sm">
                  {chord.numeral}
                </span>
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
