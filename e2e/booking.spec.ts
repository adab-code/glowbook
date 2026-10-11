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
  }

  await fillBooking();
  await submitBooking();
  // The form only closes on success (header logout form remains): 2 forms
  // become 1. An error would keep the booking form open instead.
  await expect(page.locator("form")).toHaveCount(1, { timeout: 30000 });

  // Same resource, same slot: the friendly 409 names the clash (FR-021).
  await fillBooking();
  await submitBooking();
  await expect(page.getByText(/overlap/i).first()).toBeVisible({
    timeout: 30000,
  });
});
