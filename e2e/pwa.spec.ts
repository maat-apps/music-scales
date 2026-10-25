import { expect, test } from "@playwright/test";

import { goHome } from "./utils";

// Installability wiring: the manifest under the app's base path, its icons,
// and a service worker that serves the app offline.
test("links a manifest an installable app needs", async ({ page, request }) => {
  await goHome(page);
  const href = await page.locator('link[rel="manifest"]').getAttribute("href");
  expect(href).toBe("/music-scales/manifest.json");

  const manifest = await (await request.get(href!)).json();
  expect(manifest).toMatchObject({
    short_name: "Skale",
    start_url: "/music-scales/",
    scope: "/music-scales/",
    display: "standalone",
  });
  const icons = manifest.icons as {
    src: string;
    sizes: string;
    purpose: string;
  }[];
  expect(icons).toContainEqual(
    expect.objectContaining({ sizes: "192x192", purpose: "any" }),
  );
  expect(icons).toContainEqual(
    expect.objectContaining({ sizes: "512x512", purpose: "maskable" }),
  );
  for (const icon of icons) {
    expect((await request.get(icon.src)).ok()).toBe(true);
  }
});

test("works offline once loaded", async ({ page, context }) => {
  await goHome(page);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  // The first load isn't controlled yet; the reload is.
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);

  await context.setOffline(true);
  await page.reload();

  await expect(
    page.getByRole("heading", { name: "Skale", exact: true }),
  ).toBeVisible();
});
