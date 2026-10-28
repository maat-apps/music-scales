// Reusable Playwright test helpers — plain functions specs call directly,
// not test.extend() fixtures (hence "utils.ts", not "fixtures.ts" — see
// maat-core/STRUCTURE.md's Testing section for why that naming matters).
import { readStored } from "@maat-apps/config/playwright";
import { expect, type Page } from "@playwright/test";

export async function goHome(page: Page) {
  await page.goto("");
  await expect(
    page.getByRole("heading", { name: "Skale", exact: true }),
  ).toBeVisible();
}

export async function openSettings(page: Page) {
  await page.getByRole("button", { name: "Ustawienia" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
}

/**
 * Closes the settings drawer and waits until no dialog is left — a click
 * right after Escape can land on a drawer that's still closing.
 */
export async function closeSettings(page: Page) {
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
}

/** Opens the scale picker from its floating button. */
export async function openScalePicker(page: Page) {
  await page.getByRole("button", { name: /^Zmień skalę/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
}

/** Picks `option` on the scale picker's wheel labelled `label`, then closes
 * the picker. */
export async function choose(page: Page, label: string, option: string) {
  await openScalePicker(page);
  const choice = page
    .getByRole("listbox", { name: label })
    .getByRole("option", { name: option, exact: true });
  await choice.click();
  await expect(choice).toHaveAttribute("aria-selected", "true");
  await page.getByRole("button", { name: "Gotowe" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
}

/** The keyboard's keys of a role, by their data-role attribute. */
export function keysWithRole(page: Page, role: "root" | "scale" | "none") {
  return page
    .getByRole("region", { name: "Klawiatura" })
    .locator(`button[data-role="${role}"]`);
}

/** The chord names in a group ("Trójdźwięki", "Akordy septymowe"), in
 * order: each chord card's heading. */
export async function chordNames(page: Page, group: string): Promise<string[]> {
  return page
    .getByRole("region", { name: group })
    .getByRole("heading", { level: 4 })
    .allTextContents();
}

/**
 * Waits until the settings reach IndexedDB — they're written in the
 * background, so a reload right after a tap could beat the write.
 */
export async function waitForStoredSettings(
  page: Page,
  expected: Record<string, unknown>,
) {
  await expect
    .poll(() => readStored(page, "music-scales", "music-scales-settings"))
    .toMatchObject(expected);
}
