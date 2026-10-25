import { Button } from "@maat-apps/ui/button";
import { useTranslation } from "../../i18n/use-translation";
import {
  CHORD_SIZES,
  chordName,
  chordNoteNames,
  type ChordSize,
  type DiatonicChord,
  diatonicChords,
} from "../../lib/music/chords";
import { chordMidis, type StartOctave } from "../../lib/music/keyboard";
import type { Notation } from "../../lib/music/notes";
import type { Scale } from "../../lib/music/scales";
import { synth } from "../../lib/synth";

const SIZE_TEXTS = {
  3: { title: "triads", hint: "triadsHint" },
  4: { title: "sevenths", hint: "seventhsHint" },
} as const satisfies Record<ChordSize, { title: string; hint: string }>;

/** Every diatonic chord of the scale: its triads, then its seventh chords. */
export function ChordList({
  rootPc,
  scale,
  notation,
  startOctave,
}: {
  rootPc: number;
  scale: Scale;
  notation: Notation;
  startOctave: StartOctave;
}) {
  const { t } = useTranslation();
  const groups = CHORD_SIZES.flatMap((size) => {
    const chords = diatonicChords(rootPc, scale, size);
    return chords ? [{ size, chords }] : [];
  });

  if (groups.length === 0) {
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
    <section className="grid gap-5" aria-labelledby="chords-title">
      <h2 id="chords-title" className="font-heading m-0 text-lg font-semibold">
        {t("chordsTitle")}
      </h2>
      {groups.map(({ size, chords }) => (
        <section
          key={size}
          className="grid gap-2"
          aria-labelledby={`chords-${size}-title`}
        >
          <h3
            id={`chords-${size}-title`}
            className="font-heading m-0 text-base font-semibold"
          >
            {t(SIZE_TEXTS[size].title)}
          </h3>
          <p className="text-muted-foreground m-0 text-sm">
            {t(SIZE_TEXTS[size].hint)}
          </p>
          <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-2 p-0">
            {chords.map((chord) => (
              <li key={chord.numeral}>
                <ChordButton
                  chord={chord}
                  notation={notation}
                  onPlay={() =>
                    synth.play(chordMidis(rootPc, chord.semitones, startOctave))
                  }
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </section>
  );
}

function ChordButton({
  chord,
  notation,
  onPlay,
}: {
  chord: DiatonicChord;
  notation: Notation;
  onPlay: () => void;
}) {
  const { t } = useTranslation();
  const name = chordName(chord, notation);
  return (
    <Button
      variant="outline"
      aria-label={t("playChord", { chord: name })}
      className="grid h-auto min-h-16 w-full gap-0.5 rounded-xl py-2"
      onClick={onPlay}
    >
      <span className="text-lg font-bold">{name}</span>
      <span className="text-sm">{chordNoteNames(chord, notation)}</span>
      <span className="text-muted-foreground text-sm">{chord.numeral}</span>
    </Button>
  );
}
