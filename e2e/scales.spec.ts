import { expect, test } from "@playwright/test";

import {
  choose,
  chordNames,
  closeSettings,
  goHome,
  keysWithRole,
  openScalePicker,
  openSettings,
  waitForStoredSettings,
} from "./utils";

test("opens on C major with its keys and chords", async ({ page }) => {
  await goHome(page);

  await expect(
    page.getByRole("heading", { name: "C dur (jońska)" }),
  ).toBeVisible();
  await expect(page.getByText("Odstępy (w tonach): 1 – 1 – ½")).toBeVisible();
  // Two octaves from C4, plus the closing C: three roots.
  await expect(keysWithRole(page, "root")).toHaveCount(3);
  await expect(keysWithRole(page, "scale")).toHaveCount(12);
  expect(await chordNames(page, "Trójdźwięki")).toEqual([
    "C",
    "Dm",
    "Em",
    "F",
    "G",
    "Am",
    "B°",
  ]);
});

test("shows seventh chords on every degree", async ({ page }) => {
  await goHome(page);

  expect(await chordNames(page, "Akordy septymowe")).toEqual([
    "Cmaj7",
    "Dm7",
    "Em7",
    "Fmaj7",
    "G7",
    "Am7",
    "Bm7♭5",
  ]);
  await expect(page.getByText("viiø7")).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: "Akordy septymowe" })
      .getByText("B D F A", { exact: true }),
  ).toBeVisible();
  // Screen readers hear the notes too.
  await expect(
    page.getByRole("button", {
      name: "Zagraj akord Bm7♭5, postać zasadnicza: B D F A",
    }),
  ).toBeVisible();
});

test("follows the chosen root and scale", async ({ page }) => {
  await goHome(page);

  await choose(page, "Skala", "moll harmoniczny");
  await choose(page, "Dźwięk podstawowy", "A");

  await expect(
    page.getByRole("heading", { name: "A moll harmoniczny" }),
  ).toBeVisible();
  await expect(page.getByText("A  B  C  D  E  F  G♯")).toBeVisible();
  expect(await chordNames(page, "Trójdźwięki")).toContain("C+");
});

test("explains why pentatonics have no chord set", async ({ page }) => {
  await goHome(page);

  await choose(page, "Skala", "bluesowa");

  await expect(page.getByText(/nie mają klasycznego zestawu/)).toBeVisible();
  await expect(page.getByRole("button", { name: /^Zagraj akord/ })).toHaveCount(
    0,
  );
});

test("writes H instead of B in Polish notation", async ({ page }) => {
  await goHome(page);
  await choose(page, "Dźwięk podstawowy", "F");

  await openSettings(page);
  await page.getByRole("switch", { name: "Polskie H zamiast B" }).click();
  await closeSettings(page);

  await expect(page.getByText("F  G  A  B  C  D  E")).toBeVisible();
  await choose(page, "Dźwięk podstawowy", "G");
  expect(await chordNames(page, "Trójdźwięki")).toContain("Hm");
});

test("remembers the last settings across a relaunch", async ({ page }) => {
  await goHome(page);
  await choose(page, "Skala", "dorycka");
  await choose(page, "Dźwięk podstawowy", "D");
  await waitForStoredSettings(page, {
    practice: { root: 2, scale: "dorian" },
  });

  await page.reload();

  await expect(page.getByRole("heading", { name: "D dorycka" })).toBeVisible();
});

test("names the scale on the picker's button", async ({ page }) => {
  await goHome(page);
  await expect(
    page.getByRole("button", { name: "Zmień skalę: C dur (jońska)" }),
  ).toBeVisible();

  await choose(page, "Dźwięk podstawowy", "D♭");

  await expect(
    page.getByRole("button", { name: "Zmień skalę: D♭ dur (jońska)" }),
  ).toBeVisible();
});

test("turns the wheels with the arrow keys", async ({ page }) => {
  await goHome(page);
  await openScalePicker(page);

  const scales = page.getByRole("listbox", { name: "Skala" });
  await scales.focus();
  await page.keyboard.press("ArrowDown");

  await expect(
    scales.getByRole("option", { name: "moll naturalny (eolska)" }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("heading", { name: "C moll naturalny (eolska)" }),
  ).toBeVisible();
});

test("chooses the row a flick settles on", async ({ page }) => {
  await goHome(page);
  await openScalePicker(page);

  const roots = page.getByRole("listbox", { name: "Dźwięk podstawowy" });
  // Two rows down: C → D♭ → D.
  await roots.evaluate((list) => list.scrollTo({ top: 96 }));

  await expect(
    roots.getByRole("option", { name: "D", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("heading", { name: "D dur (jońska)" }),
  ).toBeVisible();
});

test("shows every inversion of a chord, its keys pictured", async ({
  page,
}) => {
  await goHome(page);
  const triads = page.getByRole("region", { name: "Trójdźwięki" });

  for (const name of [
    "Zagraj akord C, postać zasadnicza: C E G",
    "Zagraj akord C, 1. przewrót: E G C",
    "Zagraj akord C, 2. przewrót: G C E",
  ]) {
    await expect(triads.getByRole("button", { name })).toBeVisible();
  }
  await expect(
    page
      .getByRole("region", { name: "Akordy septymowe" })
      .getByRole("button", { name: "Zagraj akord G7, 3. przewrót: F G B D" }),
  ).toBeVisible();
  // One small keyboard per voicing: 7 × 3 triads, 7 × 4 seventh chords.
  await expect(page.locator("section svg")).toHaveCount(7 * 3 + 7 * 4);
});
