import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@maat-apps/ui/select";
import { useTranslation } from "../../i18n/use-translation";
import type { PracticePrefs } from "../../lib/app-settings";
import {
  noteName,
  PITCH_CLASS_COUNT,
  type Notation,
} from "../../lib/music/notes";
import {
  SCALE_IDS,
  scaleById,
  SCALES,
  spellScale,
} from "../../lib/music/scales";

import { SCALE_LABELS } from "./scale-labels";

const ROOTS = Array.from({ length: PITCH_CLASS_COUNT }, (_, pc) => pc);

const TRIGGER_CLASS = "h-14 rounded-2xl px-3 text-base md:text-base";

/** The root and scale pickers in the home view's bottom bar. */
export function PracticeControls({
  prefs,
  notation,
  onChange,
}: {
  prefs: PracticePrefs;
  notation: Notation;
  onChange: (changes: Partial<PracticePrefs>) => void;
}) {
  const { t } = useTranslation();
  const scale = scaleById(prefs.scale);
  // Each root named the way the chosen scale spells it: D♭ major, C♯ minor.
  const rootName = (pc: number) => noteName(spellScale(pc, scale)[0], notation);

  return (
    <>
      <Select
        value={String(prefs.root)}
        onValueChange={(value) => onChange({ root: Number(value) })}
      >
        <SelectTrigger
          aria-label={t("root")}
          className={`${TRIGGER_CLASS} w-20 shrink-0`}
        >
          <SelectValue>
            {(value: string) => rootName(Number(value))}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {ROOTS.map((pc) => (
            <SelectItem key={pc} value={String(pc)}>
              {rootName(pc)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={prefs.scale}
        onValueChange={(value) => {
          const id = SCALE_IDS.find((option) => option === value);
          if (id) onChange({ scale: id });
        }}
      >
        <SelectTrigger
          aria-label={t("scale")}
          className={`${TRIGGER_CLASS} min-w-0 flex-1`}
        >
          <SelectValue className="truncate">
            {(value: (typeof SCALE_IDS)[number]) => t(SCALE_LABELS[value])}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SCALES.map(({ id }) => (
            <SelectItem key={id} value={id}>
              {t(SCALE_LABELS[id])}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
