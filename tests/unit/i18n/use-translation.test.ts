import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import en from "@/i18n/en.json";
import pl from "@/i18n/pl.json";

// The locale store is a module-level singleton; a fresh module per test
// keeps one test's setLocale() from leaking into the next.
async function freshUseTranslation() {
  vi.resetModules();
  return import("@/i18n/use-translation");
}

describe("useTranslation", () => {
  it("follows the device language on first launch", async () => {
    const { useTranslation } = await freshUseTranslation();
    const { result } = renderHook(() => useTranslation());

    // jsdom reports en-US.
    expect(result.current.locale).toBe("en");
    expect(result.current.t("appName")).toBe("Scales");
  });

  it("translates from the Polish catalog once chosen", async () => {
    const { useTranslation } = await freshUseTranslation();
    const { result } = renderHook(() => useTranslation());

    act(() => result.current.setLocale("pl"));

    expect(result.current.t("appName")).toBe("Skale");
  });

  it("fills in placeholders", async () => {
    const { useTranslation } = await freshUseTranslation();
    const { result } = renderHook(() => useTranslation());

    act(() => result.current.setLocale("pl"));

    expect(
      result.current.t("scaleTitle", { root: "F♯", scale: "dorycka" }),
    ).toBe("F♯ dorycka");
  });
});

describe("catalogs", () => {
  it("have the same keys", () => {
    expect(Object.keys(pl).sort()).toEqual(Object.keys(en).sort());
  });
});
