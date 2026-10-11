import { expect, test } from "@playwright/test";
import { OWNER_EMAIL, signIn } from "./helpers";

test("week and month views navigate and link back to the day", async ({
  page,
}) => {
  await signIn(page, OWNER_EMAIL);

  await page.goto("/appointments?view=week");
  await expect(page.getByRole("tab", { name: "Week" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.getByRole("link", { name: "Next →" }).click();
  await expect(page).toHaveURL(/view=week/);

  await page.goto("/appointments?view=month");
  await expect(page.getByRole("tab", { name: "Month" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  // A month grid always renders a whole number of 7-day rows.
  const cells = page.locator(
    'a[aria-label$="appointment"], a[aria-label$="appointments"]',
  );
  await expect(cells.first()).toBeVisible();
  const count = await cells.count();
  expect(count % 7).toBe(0);

  // A cell deep-links to its day view.
  await cells.first().click();
  await expect(page).toHaveURL(/view=day&date=\d{4}-\d{2}-\d{2}/);
});

test("owner moves a booking to another slot from the day view", async ({
  page,
}) => {
  await signIn(page, OWNER_EMAIL);
  await page.goto("/appointments?view=day&date=2030-06-15");

  await page.getByRole("button", { name: "Book appointment" }).click();
  await page.getByLabel("Client").selectOption({ label: "Sofía Ramírez" });
  await page
    .getByRole("checkbox", { name: /Classic eyelash extensions/ })
    .check();
  await page.getByLabel("Starts at").fill("2030-06-15T10:00");
  await page.getByRole("button", { name: "Book appointment" }).click();
  await expect(page.getByText("Appointment booked.")).toBeVisible();

  await page
    .locator("li", { hasText: "Sofía Ramírez" })
    .getByRole("button", { name: "Move" })
    .click();
  await page.getByLabel("New date and time").fill("2030-06-15T12:00");
  await page.getByRole("button", { name: "Move appointment" }).click();
  await expect(page.getByText("Appointment moved.")).toBeVisible();
  await expect(page.getByText("12:00 PM").first()).toBeVisible();

  // Leave the schedule as it was found.
  const list = await page.request.get(
    "/api/appointments?from=2030-06-15T00:00&to=2030-06-16T00:00",
  );
  const { data } = (await list.json()) as { data: { id: string }[] };
  for (const appointment of data) {
    await page.request.delete(`/api/appointments/${appointment.id}`);
  }
});
