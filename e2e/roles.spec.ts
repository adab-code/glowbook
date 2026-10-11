import { expect, test } from "@playwright/test";
import { OWNER_EMAIL, STAFF_EMAIL, signIn } from "./helpers";

test("staff sees a read-only studio and cannot delete through the API", async ({
  page,
}) => {
  await signIn(page, STAFF_EMAIL);

  // Settings: readable, not editable.
  await page.goto("/settings");
  await expect(page.getByText("Studio name").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Save settings" })).toHaveCount(
    0,
  );

  // Services: no destructive controls rendered.
  await page.goto("/services");
  await expect(page.getByRole("button", { name: "Delete" })).toHaveCount(0);

  // And the handler enforces it too: a direct DELETE is a 403.
  const list = await page.request.get("/api/services");
  expect(list.ok()).toBe(true);
  const { data } = (await list.json()) as { data: { id: string }[] };
  expect(data.length).toBeGreaterThan(0);
  const attempt = await page.request.delete(`/api/services/${data[0].id}`);
  expect(attempt.status()).toBe(403);
});

test("owner still has the delete controls", async ({ page }) => {
  await signIn(page, OWNER_EMAIL);
  await page.goto("/services");
  await expect(
    page.getByRole("button", { name: "Delete" }).first(),
  ).toBeVisible();
});
