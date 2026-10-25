import { CoffeeIcon } from "@phosphor-icons/react";

import { Button } from "@maat-apps/ui/button";
import { useWakeLock } from "../../hooks/use-wake-lock";
import { useTranslation } from "../../i18n/use-translation";
import { screenWakeLock } from "../../lib/wake-lock";

import { HEADER_BUTTON_CLASS } from "./header-button";

/** Keeps the screen on while practising; absent where the browser can't. */
export function WakeLockButton() {
  const { t } = useTranslation();
  const state = useWakeLock();
  if (state === "unsupported") return null;
  const on = state === "on";

  return (
    <Button
      variant={on ? "default" : "ghost"}
      aria-pressed={on}
      aria-label={t("wakeLock")}
      title={on ? t("wakeLockOn") : t("wakeLock")}
      className={HEADER_BUTTON_CLASS}
      onClick={() =>
        void (on ? screenWakeLock.disable() : screenWakeLock.enable())
      }
    >
      {/* A cup of coffee keeps you awake: a sun read as a theme switch. */}
      <CoffeeIcon weight={on ? "fill" : "regular"} />
    </Button>
  );
}
