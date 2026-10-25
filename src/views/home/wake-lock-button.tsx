import { SunIcon } from "@phosphor-icons/react";

import { Button } from "@maat-apps/ui/button";
import { useWakeLock } from "../../hooks/use-wake-lock";
import { useTranslation } from "../../i18n/use-translation";
import { screenWakeLock } from "../../lib/wake-lock";

/** Keeps the screen on while practising; absent where the browser can't. */
export function WakeLockButton() {
  const { t } = useTranslation();
  const state = useWakeLock();
  if (state === "unsupported") return null;
  const on = state === "on";

  return (
    <Button
      variant={on ? "default" : "outline"}
      aria-pressed={on}
      aria-label={t("wakeLock")}
      title={on ? t("wakeLockOn") : t("wakeLock")}
      className="size-14 shrink-0 rounded-2xl [&_svg:not([class*='size-'])]:size-7"
      onClick={() =>
        void (on ? screenWakeLock.disable() : screenWakeLock.enable())
      }
    >
      <SunIcon weight={on ? "fill" : "regular"} />
    </Button>
  );
}
