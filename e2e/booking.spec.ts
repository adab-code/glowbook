import { expect, test } from "@playwright/test";
import { OWNER_EMAIL, signIn } from "./helpers";

// Far-future, fixed slot: seeded appointments live within ±7 days of "today",
// so this can never collide with the seed or a previous run.
const SLOT = "2030-06-15T10:00";

test("owner can book a slot and an overlap is refused", async ({ page }) => {
  await signIn(page, OWNER_EMAIL);
  await page.goto("/appointments");

  async function fillBooking() {
    // Two "Book appointment" buttons coexist (the trigger and the empty-state
    // action), so the opener takes the first and the submit stays form-scoped.
    await page
      .getByRole("button", { name: "Book appointment" })
      .first()
      .click();
    await page.getByLabel("Client").selectOption({ label: "Sofía Ramírez" });
    await page
      .getByRole("checkbox", { name: /Classic eyelash extensions/ })
      .check();
    await page.getByLabel("Starts at").fill(SLOT);
  }

  async function submitBooking() {
    await page
      .locator("form")
      .getByRole("button", { name: "Book appointment" })
      .click();
    // Surface the real outcome in the failure output: the success banner or
    // whatever the form alert actually says.
    const outcome = page.locator('p[role="status"], div[role="alert"]').first();
    await expect(outcome).toBeVisible({ timeout: 30000 });
    return (await outcome.textContent()) ?? "";
  }

  await fillBooking();
  expect(await submitBooking()).toContain("Appointment booked.");
  await expect(page.getByText("Sofía Ramírez").first()).toBeVisible();

  // Same resource, same slot: the friendly 409 names the clash (FR-021).
  await fillBooking();
  expect(await submitBooking()).toMatch(/overlap/i);
});
