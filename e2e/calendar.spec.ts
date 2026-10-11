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
  // Exact names: the links carry aria-labels ("Next"/"Prev") that override
  // their visible "Next →"/"← Prev" text in the accessibility tree.
  await page.getByRole("link", { name: "Next", exact: true }).click();
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
  // Own far-future day: booking.spec.ts owns 2030-06-15, so this flow uses
  // the 16th and can never collide with it (sequential workers, shared studio).
  const day = "2030-06-16";
  await signIn(page, OWNER_EMAIL);

  // Set up through the API: deterministic, and the range read below proves
  // the day filter returns exactly this row.
  const clients = (await (await page.request.get("/api/clients")).json()) as {
    data: { id: string; firstName: string }[];
  };
  const sofia = clients.data.find((client) => client.firstName === "Sofía")!;
  const services = (await (await page.request.get("/api/services")).json()) as {
    data: { id: string; name: string }[];
  };
  const classic = services.data.find(
    (service) => service.name === "Classic eyelash extensions",
  )!;
  const created = await page.request.post("/api/appointments", {
    data: {
      clientId: sofia.id,
      serviceIds: [classic.id],
      startsAt: `${day}T10:00`,
      staffUserId: "",
    },
  });
  // TEMPORARY diagnostic: the CI run 409s here on a slot nothing should
  // occupy — print the clash message to identify the conflicting row.
  if (created.status() !== 201) {
    console.log("[e2e-debug] booking clash:", await created.text());
  }
  expect(created.status()).toBe(201);

  const listed = (await (
    await page.request.get(
      `/api/appointments?from=${day}T00:00&to=2030-06-17T00:00`,
    )
  ).json()) as { data: { id: string }[] };
  expect(listed.data).toHaveLength(1);
  const appointmentId = listed.data[0].id;

  await page.goto(`/appointments?view=day&date=${day}`);
  const row = page.locator("li", { hasText: "Sofía Ramírez" });
  await expect(row).toBeVisible({ timeout: 30000 });
  await row.getByRole("button", { name: "Move" }).click();
  await page.getByLabel("New date and time").fill(`${day}T12:00`);
  await page.getByRole("button", { name: "Move appointment" }).click();
  // The dialog only closes on success; an overlap would keep it open instead.
  await expect(
    page.getByRole("button", { name: "Move appointment" }),
  ).toHaveCount(0, { timeout: 30000 });
  await expect(page.getByText("12:00 PM").first()).toBeVisible();

  // Leave the schedule as it was found.
  const removed = await page.request.delete(
    `/api/appointments/${appointmentId}`,
  );
  expect(removed.ok()).toBe(true);
});
