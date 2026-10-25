import { expect, test } from "@playwright/test";

import { goHome, openSettings, waitForStoredSettings } from "./utils";

// Wiring only: the app's enrolment persists and its gate renders. The lock
// screen's own behavior is tested in @maat-apps/ui, the lock logic in
// @maat-apps/core.
test("enrolling turns the lock on and unlocking with the same authenticator works", async ({
  page,
}) => {
  // Playwright's native virtual WebAuthn authenticator, installed before
  // navigation so the app's real create()/get() calls succeed against it.
  await page.context().credentials.install();
  await goHome(page);
  await openSettings(page);

  const lockSwitch = page.getByRole("switch", { name: "Blokada aplikacji" });
  await expect(lockSwitch).toBeEnabled();
  await lockSwitch.click();
  await expect(lockSwitch).toBeChecked();

  // Enrolling counts as unlocked, but that's per-session memory — a reload
  // locks again, and the lock screen prompts by itself.
  await waitForStoredSettings(page, { lock: { userId: expect.any(String) } });
  await page.reload();
  await expect(page.getByRole("button", { name: "Odblokuj" })).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Skale", exact: true }),
  ).toBeVisible();
});
