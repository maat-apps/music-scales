import { useTranslation } from "../../i18n/use-translation";
import {
  noteName,
  type Notation,
  type SpelledNote,
} from "../../lib/music/notes";
import { degreeLabel, scaleSteps, type Scale } from "../../lib/music/scales";

import { SCALE_LABELS } from "./scale-labels";

/** Whole tones: a semitone is ½, a minor third (blues) 1½. */
const STEP_LABELS: Record<number, string> = { 1: "½", 2: "1", 3: "1½" };

export function ScaleSummary({
  scale,
  notes,
  notation,
}: {
  scale: Scale;
  notes: SpelledNote[];
  notation: Notation;
}) {
  const { t } = useTranslation();
  const names = notes.map((note) => noteName(note, notation));

  return (
    <section aria-live="polite" className="grid gap-1">
      <h2 className="font-heading m-0 text-2xl leading-tight font-bold">
        {t("scaleTitle", { root: names[0], scale: t(SCALE_LABELS[scale.id]) })}
      </h2>
      <p className="m-0 text-xl font-semibold tracking-wide">
        {names.join("  ")}
      </p>
      <p className="text-muted-foreground m-0 text-sm">
        {t("scaleDegrees", {
          degrees: scale.degrees.map(degreeLabel).join(" "),
        })}
      </p>
      <p className="text-muted-foreground m-0 text-sm">
        {t("scaleSteps", {
          steps: scaleSteps(scale)
            .map((step) => STEP_LABELS[step])
            .join(" – "),
        })}
      </p>
    </section>
  );
}
