import { GearIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import { BottomBar, BottomBarButton } from "@maat-apps/ui/bottom-bar";
import { PageTitle } from "@maat-apps/ui/page-header";
import { useAppSettings } from "../../hooks/use-app-settings";
import { useTranslation } from "../../i18n/use-translation";
import { setPracticePrefs } from "../../lib/app-settings";
import {
  scaleById,
  scaleNotesByPitchClass,
  spellScale,
} from "../../lib/music/scales";
import { SettingsDrawer } from "../settings/settings-drawer";

import { ChordList } from "./chord-list";
import { PianoKeyboard } from "./piano-keyboard";
import { PracticeControls } from "./practice-controls";
import { ScaleSummary } from "./scale-summary";
import { WakeLockButton } from "./wake-lock-button";

// One screen: the chosen scale, its keys and its chords. Root and scale sit
// in the bottom bar, within the thumb's reach, beside settings and the
// keep-the-screen-on switch. The keyboard spans the screen's whole width;
// in landscape the column widens, clear of the notch, and the scale and its
// keyboard fit above the bar.
export function HomeView() {
  const { t } = useTranslation();
  const { practice, keyboard, notation } = useAppSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const scale = scaleById(practice.scale);
  const notes = useMemo(
    () => spellScale(practice.root, scale),
    [practice.root, scale],
  );
  const scaleNotes = useMemo(
    () => scaleNotesByPitchClass(practice.root, scale),
    [practice.root, scale],
  );

  return (
    <div className="mx-auto flex min-h-dvh w-[min(100%,480px)] flex-col gap-6 pt-[calc(env(safe-area-inset-top)+24px)] pr-(--gutter-right) pl-(--gutter-left) landscape:w-full landscape:max-w-5xl landscape:gap-3 landscape:pt-[calc(env(safe-area-inset-top)+12px)]">
      {/* A landscape phone has little height: the keyboard goes first, the
          app's name stays for screen readers. */}
      <div className="landscape:sr-only">
        <PageTitle>{t("appName")}</PageTitle>
      </div>
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
      <p className="text-muted-foreground m-0 pb-4 text-sm">{t("tip")}</p>
      <BottomBar
        settings={
          <BottomBarButton
            label={t("settings")}
            onClick={() => setSettingsOpen(true)}
          >
            <GearIcon />
          </BottomBarButton>
        }
        action={<WakeLockButton />}
      >
        <PracticeControls
          prefs={practice}
          notation={notation}
          onChange={setPracticePrefs}
        />
      </BottomBar>
      <SettingsDrawer open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
