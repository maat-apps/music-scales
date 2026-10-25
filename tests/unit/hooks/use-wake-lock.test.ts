import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useWakeLock } from "@/hooks/use-wake-lock";

describe("useWakeLock", () => {
  it("reports unsupported where the browser has no Wake Lock API", () => {
    // jsdom has none.
    const { result } = renderHook(() => useWakeLock());
    expect(result.current).toBe("unsupported");
  });
});
