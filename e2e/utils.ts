// Reusable Playwright test helpers — plain functions specs call directly,
// not test.extend() fixtures (hence "utils.ts", not "fixtures.ts" — see
// maat-core/STRUCTURE.md's Testing section for why that naming matters).
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

/** The names of a chord group's buttons ("Trójdźwięki", "Akordy
 * septymowe"), in order — their labels without the notes after the colon. */
export async function chordNames(page: Page, group: string): Promise<string[]> {
  const labels = await page
    .getByRole("region", { name: group })
    .getByRole("button", { name: /^Zagraj akord / })
    .evaluateAll((buttons) =>
      buttons.map((button) => button.getAttribute("aria-label") ?? ""),
    );
  return labels.map((label) =>
    label.replace("Zagraj akord ", "").replace(/:.*/, ""),
  );
}

/**
 * Waits until the settings reach IndexedDB — they're written in the
 * background, so a reload right after a tap could beat the write. Store and
 * key names are duplicated by hand: this runs in the page, which can't
 * import from src/.
 */
export async function waitForStoredSettings(
  page: Page,
  expected: Record<string, unknown>,
) {
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          new Promise<unknown>((resolve) => {
            const request = indexedDB.open("music-scales");
            request.onerror = () => resolve(undefined);
            request.onsuccess = () => {
              const read = request.result
                .transaction("kv")
                .objectStore("kv")
                .get("music-scales-settings");
              read.onerror = () => resolve(undefined);
              read.onsuccess = () => resolve(read.result);
            };
          }),
      ),
    )
    .toMatchObject(expected);
}
