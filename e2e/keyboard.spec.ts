import { expect, test, type Page } from "@playwright/test";

import { choose, closeSettings, goHome, openSettings } from "./utils";

function keyboard(page: Page) {
  return page.getByRole("region", { name: "Klawiatura" });
}

/** Whether the keyboard's own scroller has more than it shows. */
function scrollsSideways(page: Page) {
  return keyboard(page)
    .locator("> div")
    .first()
    .evaluate((scroller) => scroller.scrollWidth > scroller.clientWidth + 1);
}

test("sets the octaves and the start octave", async ({ page }) => {
  await goHome(page);

  await openSettings(page);
  await page.getByRole("combobox", { name: "Liczba oktaw" }).click();
  await page.getByRole("option", { name: "4", exact: true }).click();
  await page.getByRole("combobox", { name: "Oktawa startowa" }).click();
  await page.getByRole("option", { name: "C2", exact: true }).click();
  await closeSettings(page);

  // 4 octaves + the closing C: 49 keys, from C2 to C6.
  await expect(keyboard(page).getByRole("button")).toHaveCount(49);
  await expect(
    keyboard(page).getByRole("button", { name: "C2 — dźwięk podstawowy" }),
  ).toBeVisible();
  await expect(
    keyboard(page).getByRole("button", { name: "C6 — dźwięk podstawowy" }),
  ).toBeAttached();
});

test("labels the scale's notes on their keys", async ({ page }) => {
  await goHome(page);
  await choose(page, "Dźwięk podstawowy", "F");

  await expect(
    keyboard(page).getByRole("button", { name: "B♭4 — w skali" }),
  ).toHaveText("B♭");
});

test("scrolls sideways in portrait, fits two octaves in landscape", async ({
  page,
}) => {
  await goHome(page);
  expect(await scrollsSideways(page)).toBe(true);

  const { width, height } = page.viewportSize()!;
  await page.setViewportSize({ width: height, height: width });

  await expect.poll(() => scrollsSideways(page)).toBe(false);
  // Nor does the page itself.
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
