import { useSyncExternalStore } from "react";

import { screenWakeLock, type WakeLockState } from "../lib/wake-lock";

function unsupportedOnServer(): WakeLockState {
  return "unsupported";
}

/** Whether the screen is kept on — "unsupported" where the browser can't. */
export function useWakeLock(): WakeLockState {
  return useSyncExternalStore(
    screenWakeLock.subscribe,
    screenWakeLock.getState,
    unsupportedOnServer,
  );
}
