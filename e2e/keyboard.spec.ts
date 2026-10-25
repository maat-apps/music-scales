import { expect, test, type Page } from "@playwright/test";

import { choose, closeSettings, goHome, openSettings } from "./utils";

function keyboard(page: Page) {
  return page.getByRole("region", { name: "Klawiatura" });
}

/** The keyboard's own scroller. */
function scroller(page: Page) {
  return keyboard(page).locator("> div").first();
}

/** The narrowest white key, in CSS pixels. */
function narrowestWhiteKey(page: Page) {
  return keyboard(page)
    .locator("button:not([data-black])")
    .evaluateAll((keys) =>
      Math.min(...keys.map((key) => key.getBoundingClientRect().width)),
    );
}

/** The keyboard spans the viewport, and the page itself doesn't scroll. */
async function expectEdgeToEdge(page: Page) {
  const box = (await scroller(page).boundingBox())!;
  expect(box.x).toBe(0);
  expect(box.width).toBe(page.viewportSize()!.width);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
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

test("keeps white keys 56px wide, edge to edge, in both orientations", async ({
  page,
}) => {
  await goHome(page);
  expect(await narrowestWhiteKey(page)).toBeGreaterThanOrEqual(56);
  await expectEdgeToEdge(page);

  const { width, height } = page.viewportSize()!;
  await page.setViewportSize({ width: height, height: width });

  await expect.poll(() => narrowestWhiteKey(page)).toBeGreaterThanOrEqual(56);
  await expectEdgeToEdge(page);
});
