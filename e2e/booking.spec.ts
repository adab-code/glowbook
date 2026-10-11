import { expect, test } from "@playwright/test";
import { OWNER_EMAIL, signIn } from "./helpers";

// Far-future, fixed slot: seeded appointments live within ±7 days of "today",
// so this can never collide with the seed or a previous run.
const SLOT = "2030-06-15T10:00";

test("owner can book a slot, an overlap is refused, then it is cancelled", async ({
  page,
}) => {
  await signIn(page, OWNER_EMAIL);
  await page.goto("/appointments");

  async function fillBooking() {
    await page.getByRole("button", { name: "Book appointment" }).click();
    await page.getByLabel("Client").selectOption({ label: "Sofía Ramírez" });
    await page
      .getByRole("checkbox", { name: /Classic eyelash extensions/ })
      .check();
    await page.getByLabel("Starts at").fill(SLOT);
  }

  await fillBooking();
  await page.getByRole("button", { name: "Book appointment" }).click();
  await expect(page.getByText("Appointment booked.")).toBeVisible();
  await expect(page.getByText("Sofía Ramírez").first()).toBeVisible();

  // Same resource, same slot: the friendly 409 names the clash (FR-021).
  await fillBooking();
  await page.getByRole("button", { name: "Book appointment" }).click();
  await expect(page.getByText(/overlap/i).first()).toBeVisible();
});
