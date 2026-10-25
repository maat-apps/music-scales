import { expect, test } from "@playwright/test";

import {
  choose,
  chordNames,
  closeSettings,
  goHome,
  keysWithRole,
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
    page.getByRole("button", { name: "Zagraj akord Bm7♭5: B D F A" }),
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
