import { Button } from "@maat-apps/ui/button";
import { useTranslation } from "../../i18n/use-translation";
import {
  CHORD_SIZES,
  chordName,
  chordNoteNames,
  type ChordSize,
  chordVoicings,
  type DiatonicChord,
  diatonicChords,
} from "../../lib/music/chords";
import { chordMidis, type StartOctave } from "../../lib/music/keyboard";
import type { Notation } from "../../lib/music/notes";
import type { Scale } from "../../lib/music/scales";
import { synth } from "../../lib/synth";

import { ChordKeys } from "./chord-keys";

const SIZE_TEXTS = {
  3: { title: "triads", hint: "triadsHint" },
  4: { title: "sevenths", hint: "seventhsHint" },
} as const satisfies Record<ChordSize, { title: string; hint: string }>;

/** By inversion: root position, then the first to third inversions. */
const VOICING_LABELS = [
  "rootPosition",
  "inversion1",
  "inversion2",
  "inversion3",
] as const;

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
          <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-2 p-0">
            {chords.map((chord) => (
              <ChordCard
                key={chord.numeral}
                chord={chord}
                notation={notation}
                midisOf={(semitones) =>
                  chordMidis(rootPc, semitones, startOctave)
                }
              />
            ))}
          </ul>
        </section>
      ))}
    </section>
  );
}

/** One chord: its name and numeral, then a row per voicing — the keys to
 * press, pictured, and their names; tapping a row plays it. */
function ChordCard({
  chord,
  notation,
  midisOf,
}: {
  chord: DiatonicChord;
  notation: Notation;
  /** A voicing's MIDI notes, from its semitones above the scale's root. */
  midisOf: (semitones: number[]) => number[];
}) {
  const { t } = useTranslation();
  const name = chordName(chord, notation);
  return (
    <li className="bg-card grid gap-1 rounded-xl border p-2">
      <div className="flex items-baseline gap-2 px-2 pt-1">
        <h4 className="m-0 text-lg font-bold">{name}</h4>
        <span className="text-muted-foreground text-sm">{chord.numeral}</span>
      </div>
      {chordVoicings(chord).map((voicing) => {
        const voicingLabel = t(VOICING_LABELS[voicing.inversion]);
        const notes = chordNoteNames(voicing, notation);
        const midis = midisOf(voicing.semitones);
        return (
          <Button
            key={voicing.inversion}
            variant="ghost"
            aria-label={t("playVoicing", {
              chord: name,
              voicing: voicingLabel,
              notes,
            })}
            className="h-auto min-h-14 w-full justify-between gap-3 rounded-lg px-2 py-1.5 text-left"
            onClick={() => synth.play(midis)}
          >
            <span className="grid min-w-0">
              <span className="text-muted-foreground text-sm first-letter:uppercase">
                {voicingLabel}
              </span>
              <span className="text-base font-semibold">{notes}</span>
            </span>
            <ChordKeys midis={midis} />
          </Button>
        );
      })}
    </li>
  );
}
