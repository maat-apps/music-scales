import { expect, test, type Page } from "@playwright/test";

import { goHome } from "./utils";

/** A stand-in Wake Lock API, so the test doesn't hang on what the headless
 * browser grants; `window.wakeRequests` counts the requests. */
async function fakeWakeLock(page: Page) {
  await page.addInitScript(() => {
    const counter = window as unknown as { wakeRequests: number };
    counter.wakeRequests = 0;
    Object.defineProperty(navigator, "wakeLock", {
      configurable: true,
      value: {
        request: () => {
          counter.wakeRequests++;
          const sentinel = new EventTarget();
          return Promise.resolve(
            Object.assign(sentinel, {
              release: () => {
                sentinel.dispatchEvent(new Event("release"));
                return Promise.resolve();
              },
            }),
          );
        },
      },
    });
  });
}

test("keeps the screen on, and shows it", async ({ page }) => {
  await fakeWakeLock(page);
  await goHome(page);
  const button = page.getByRole("button", { name: "Nie wygaszaj ekranu" });

  await expect(button).toHaveAttribute("aria-pressed", "false");
  await button.click();
  await expect(button).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("status")).toHaveText("Ekran nie zgaśnie");
  expect(
    await page.evaluate(
      () => (window as unknown as { wakeRequests: number }).wakeRequests,
    ),
  ).toBe(1);

  await button.click();
  await expect(button).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("status")).toHaveText("Ekran może zgasnąć");
});

test("has no button where the browser can't keep the screen on", async ({
  page,
}) => {
  await page.addInitScript(() => {
    delete (Navigator.prototype as { wakeLock?: unknown }).wakeLock;
  });
  await goHome(page);

  await expect(
    page.getByRole("button", { name: "Nie wygaszaj ekranu" }),
  ).toHaveCount(0);
});
