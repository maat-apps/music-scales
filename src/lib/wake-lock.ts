// Keeps the screen on while practising (the Screen Wake Lock API). The
// browser drops the lock whenever the page is hidden, so while it's wanted
// it's taken again each time the app comes back.

export type WakeLockState = "unsupported" | "off" | "on";

type Environment = {
  wakeLock: WakeLock | undefined;
  document: Document;
};

function defaultEnvironment(): Environment {
  return {
    wakeLock: "wakeLock" in navigator ? navigator.wakeLock : undefined,
    document,
  };
}

export function createScreenWakeLock(
  { wakeLock, document: doc }: Environment = defaultEnvironment(),
) {
  const listeners = new Set<() => void>();
  let wanted = false;
  let sentinel: WakeLockSentinel | null = null;
  let requesting = false;

  function notify() {
    for (const listener of listeners) listener();
  }

  async function acquire() {
    if (!wakeLock || !wanted || sentinel || requesting) return;
    if (doc.visibilityState !== "visible") return;
    requesting = true;
    try {
      const acquired = await wakeLock.request("screen");
      acquired.addEventListener("release", () => {
        if (sentinel === acquired) sentinel = null;
      });
      if (wanted) sentinel = acquired;
      else void acquired.release();
    } catch {
      // Refused (battery saver, a hidden page): show it as off.
      wanted = false;
      notify();
    } finally {
      requesting = false;
    }
  }

  doc.addEventListener("visibilitychange", () => void acquire());

  return {
    getState(): WakeLockState {
      if (!wakeLock) return "unsupported";
      return wanted ? "on" : "off";
    },
    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async enable(): Promise<void> {
      if (!wakeLock || wanted) return;
      wanted = true;
      notify();
      await acquire();
    },
    async disable(): Promise<void> {
      if (!wanted) return;
      wanted = false;
      notify();
      const held = sentinel;
      sentinel = null;
      await held?.release();
    },
  };
}

export type ScreenWakeLock = ReturnType<typeof createScreenWakeLock>;

export const screenWakeLock = createScreenWakeLock();
