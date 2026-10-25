import { describe, expect, it, vi } from "vitest";

import { createScreenWakeLock } from "@/lib/wake-lock";

class FakeSentinel extends EventTarget {
  released = false;
  async release() {
    this.released = true;
    this.dispatchEvent(new Event("release"));
  }
}

function setup({ refuse = false } = {}) {
  const sentinels: FakeSentinel[] = [];
  const request = vi.fn(async () => {
    if (refuse) throw new DOMException("No", "NotAllowedError");
    const sentinel = new FakeSentinel();
    sentinels.push(sentinel);
    return sentinel;
  });
  const doc = Object.assign(new EventTarget(), {
    visibilityState: "visible" as DocumentVisibilityState,
  });
  const lock = createScreenWakeLock({
    wakeLock: { request } as unknown as WakeLock,
    document: doc as unknown as Document,
  });
  function setVisibility(state: DocumentVisibilityState) {
    doc.visibilityState = state;
    doc.dispatchEvent(new Event("visibilitychange"));
  }
  return { lock, request, sentinels, setVisibility };
}

/** Lets the async listeners settle. */
function settle() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe("createScreenWakeLock", () => {
  it("is unsupported without the API", () => {
    const lock = createScreenWakeLock({
      wakeLock: undefined,
      document: new EventTarget() as unknown as Document,
    });
    expect(lock.getState()).toBe("unsupported");
  });

  it("starts off, then takes the screen lock when enabled", async () => {
    const { lock, request } = setup();
    expect(lock.getState()).toBe("off");

    await lock.enable();

    expect(lock.getState()).toBe("on");
    expect(request).toHaveBeenCalledWith("screen");
  });

  it("releases it when disabled", async () => {
    const { lock, sentinels } = setup();
    await lock.enable();

    await lock.disable();

    expect(lock.getState()).toBe("off");
    expect(sentinels[0].released).toBe(true);
  });

  it("notifies subscribers until they unsubscribe", async () => {
    const { lock } = setup();
    const listener = vi.fn();
    const unsubscribe = lock.subscribe(listener);

    await lock.enable();
    expect(listener).toHaveBeenCalled();

    listener.mockClear();
    unsubscribe();
    await lock.disable();
    expect(listener).not.toHaveBeenCalled();
  });

  it("takes the lock again on returning to the app", async () => {
    const { lock, request, sentinels, setVisibility } = setup();
    await lock.enable();

    // The browser drops the lock when the page is hidden.
    setVisibility("hidden");
    await sentinels[0].release();
    await settle();
    expect(request).toHaveBeenCalledTimes(1);

    setVisibility("visible");
    await settle();

    expect(request).toHaveBeenCalledTimes(2);
    expect(lock.getState()).toBe("on");
  });

  it("doesn't take it on return when off", async () => {
    const { lock, request, setVisibility } = setup();
    await lock.enable();
    await lock.disable();

    setVisibility("visible");
    await settle();

    expect(request).toHaveBeenCalledTimes(1);
  });

  it("waits for the page to be visible", async () => {
    const { lock, request, setVisibility } = setup();
    setVisibility("hidden");

    await lock.enable();
    expect(request).not.toHaveBeenCalled();

    setVisibility("visible");
    await settle();
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("shows off when the browser refuses", async () => {
    const { lock } = setup({ refuse: true });
    const listener = vi.fn();
    lock.subscribe(listener);

    await lock.enable();

    expect(lock.getState()).toBe("off");
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("lets go of a lock granted after being turned off", async () => {
    const { lock, sentinels } = setup();
    const enabling = lock.enable();
    await lock.disable();
    await enabling;

    expect(sentinels[0].released).toBe(true);
    expect(lock.getState()).toBe("off");
  });

  it("ignores repeated enables and disables", async () => {
    const { lock, request } = setup();
    await lock.disable();
    await lock.enable();
    await lock.enable();
    expect(request).toHaveBeenCalledTimes(1);
  });
});
