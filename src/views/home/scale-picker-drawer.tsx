import { Button } from "@maat-apps/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@maat-apps/ui/drawer";
import { useAppSettings } from "../../hooks/use-app-settings";
import { useTranslation } from "../../i18n/use-translation";
import { setPracticePrefs } from "../../lib/app-settings";
import { midiOf, noteName, PITCH_CLASS_COUNT } from "../../lib/music/notes";
import { scaleById, SCALES, spellScale } from "../../lib/music/scales";
import { synth } from "../../lib/synth";

import { SCALE_LABELS } from "./scale-labels";
import { WheelPicker } from "./wheel-picker";

const ROOTS = Array.from({ length: PITCH_CLASS_COUNT }, (_, pc) => pc);

/**
 * The root and the scale, each on its own wheel, as an alarm clock sets
 * hours and minutes. A choice applies at once, the screen behind showing
 * it; a new root also sounds.
 */
export function ScalePickerDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const { practice, keyboard, notation } = useAppSettings();
  const scale = scaleById(practice.scale);
  // Each root named the way the chosen scale spells it: D♭ major, C♯ minor.
  const rootOptions = ROOTS.map((pc) => ({
    value: pc,
    label: noteName(spellScale(pc, scale)[0], notation),
  }));
  const scaleOptions = SCALES.map(({ id }) => ({
    value: id,
    label: t(SCALE_LABELS[id]),
  }));

  return (
    <Drawer open={open} onOpenChange={onOpenChange} showSwipeHandle>
      <DrawerContent>
        <DrawerHeader className="mx-auto w-full max-w-lg group-data-[swipe-axis=y]/drawer-popup:text-left">
          <DrawerTitle>{t("pickScale")}</DrawerTitle>
        </DrawerHeader>
        <div className="mx-auto grid w-full max-w-lg grid-cols-[6rem_minmax(0,1fr)] gap-3 px-4">
          <WheelPicker
            label={t("root")}
            options={rootOptions}
            value={practice.root}
            onChange={(root) => {
              setPracticePrefs({ root });
              synth.play([midiOf(root, keyboard.startOctave)]);
            }}
          />
          <WheelPicker
            label={t("scale")}
            options={scaleOptions}
            value={practice.scale}
            onChange={(id) => setPracticePrefs({ scale: id })}
          />
        </div>
        <DrawerFooter className="mx-auto w-full max-w-lg pb-[calc(16px+env(safe-area-inset-bottom))]">
          <Button
            className="h-14 rounded-2xl text-base"
            onClick={() => onOpenChange(false)}
          >
            {t("done")}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
