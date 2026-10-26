import { DeviceMobileIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@maat-apps/ui/button";
import { useWakeLock } from "../../hooks/use-wake-lock";
import { useTranslation } from "../../i18n/use-translation";
import { screenWakeLock } from "../../lib/wake-lock";

import { HEADER_BUTTON_CLASS } from "./header-button";

/** How long the note saying what a tap did stays up. */
const NOTE_MS = 2500;

/**
 * Keeps the screen on while practising; absent where the browser can't. A
 * phone that stays lit, filled while on; each tap says in words what it did,
 * since an icon alone didn't.
 */
export function WakeLockButton() {
  const { t } = useTranslation();
  const state = useWakeLock();
  const [note, setNote] = useState("");
  const noteTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(noteTimer.current), []);

  if (state === "unsupported") return null;
  const on = state === "on";

  function toggle() {
    void (on ? screenWakeLock.disable() : screenWakeLock.enable());
    setNote(t(on ? "wakeLockOff" : "wakeLockOn"));
    window.clearTimeout(noteTimer.current);
    noteTimer.current = window.setTimeout(() => setNote(""), NOTE_MS);
  }

  return (
    <>
      <Button
        variant={on ? "default" : "ghost"}
        aria-pressed={on}
        aria-label={t("wakeLock")}
        className={HEADER_BUTTON_CLASS}
        onClick={toggle}
      >
        <DeviceMobileIcon weight={on ? "fill" : "regular"} />
      </Button>
      {/* Always mounted: a live region must exist before its text changes
          for screen readers to announce it. */}
      <div
        role="status"
        className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+76px)] z-30 flex justify-center px-5"
      >
        {note && (
          <span className="bg-foreground text-background rounded-full px-4 py-2 text-sm font-medium shadow-lg">
            {note}
          </span>
        )}
      </div>
    </>
  );
}
