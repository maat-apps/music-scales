import { GearIcon, MusicNotesIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import { Button } from "@maat-apps/ui/button";
import { FabButton } from "@maat-apps/ui/fab-button";
import { PageTitle } from "@maat-apps/ui/page-header";
import { useAppSettings } from "../../hooks/use-app-settings";
import { useTranslation } from "../../i18n/use-translation";
import { noteName } from "../../lib/music/notes";
import {
  scaleById,
  scaleNotesByPitchClass,
  spellScale,
} from "../../lib/music/scales";
import { SettingsDrawer } from "../settings/settings-drawer";

import { ChordList } from "./chord-list";
import { HEADER_BUTTON_CLASS } from "./header-button";
import { PianoKeyboard } from "./piano-keyboard";
import { SCALE_LABELS } from "./scale-labels";
import { ScalePickerDrawer } from "./scale-picker-drawer";
import { ScaleSummary } from "./scale-summary";
import { WakeLockButton } from "./wake-lock-button";

// One screen: the chosen scale, its keys and its chords. The header holds
// keep-the-screen-on and settings; a floating button, within the thumb's
// reach and naming the current scale, opens the root and scale wheels. The
// keyboard spans the screen's whole width; in landscape the column widens,
// clear of the notch.
export function HomeView() {
  const { t } = useTranslation();
  const { practice, keyboard, notation } = useAppSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const scale = scaleById(practice.scale);
  const notes = useMemo(
    () => spellScale(practice.root, scale),
    [practice.root, scale],
  );
  const scaleNotes = useMemo(
    () => scaleNotesByPitchClass(practice.root, scale),
    [practice.root, scale],
  );
  const scaleTitle = t("scaleTitle", {
    root: noteName(notes[0], notation),
    scale: t(SCALE_LABELS[scale.id]),
  });

  return (
    <div className="mx-auto flex min-h-dvh w-[min(100%,480px)] flex-col gap-6 pt-[calc(env(safe-area-inset-top)+16px)] pr-(--gutter-right) pl-(--gutter-left) landscape:w-full landscape:gap-3 landscape:pt-[calc(env(safe-area-inset-top)+8px)]">
      <header className="flex items-center justify-between gap-2">
        <PageTitle>{t("appName")}</PageTitle>
        <div className="-mr-2 flex items-center gap-1">
          <WakeLockButton />
          <Button
            variant="ghost"
            aria-label={t("settings")}
            className={HEADER_BUTTON_CLASS}
            onClick={() => setSettingsOpen(true)}
          >
            <GearIcon />
          </Button>
        </div>
      </header>
      <ScaleSummary scale={scale} notes={notes} notation={notation} />
      <PianoKeyboard
        prefs={keyboard}
        rootPc={practice.root}
        scaleNotes={scaleNotes}
        notation={notation}
      />
      <ChordList
        rootPc={practice.root}
        scale={scale}
        notation={notation}
        startOctave={keyboard.startOctave}
      />
      {/* Bottom padding: the floating button mustn't cover the tip. */}
      <p className="text-muted-foreground m-0 pb-28 text-sm">{t("tip")}</p>
      <div className="fixed right-(--gutter-right) bottom-[calc(20px+env(safe-area-inset-bottom))] z-20">
        <FabButton
          ariaLabel={t("changeScale", { scale: scaleTitle })}
          className="h-16 w-auto max-w-[calc(100vw-40px)] gap-3 rounded-2xl px-5 text-lg [&_svg:not([class*='size-'])]:size-7"
          onClick={() => setPickerOpen(true)}
        >
          <MusicNotesIcon />
          <span className="truncate">{scaleTitle}</span>
        </FabButton>
      </div>
      <ScalePickerDrawer open={pickerOpen} onOpenChange={setPickerOpen} />
      <SettingsDrawer open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
