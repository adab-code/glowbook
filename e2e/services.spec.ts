import { expect, test } from "@playwright/test";
import { OWNER_EMAIL, signIn, uid } from "./helpers";

test("owner can create, edit and delete a service", async ({ page }) => {
  await signIn(page, OWNER_EMAIL);
  const name = `E2E Service ${uid()}`;

  await page.goto("/services");
  await page.getByRole("button", { name: "Add service" }).click();
  await page.getByLabel("Name").fill(name);
  await page.getByLabel(/Price/).fill("75");
  await page.getByLabel(/Duration/).fill("45");
  await page.getByRole("button", { name: "Add service" }).click();
  await expect(page.getByText(name)).toBeVisible();

  const row = page.locator("li", { hasText: name });
  await row.getByRole("button", { name: "Edit" }).click();
  await page.getByLabel("Name").fill(`${name} v2`);
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText(`${name} v2`)).toBeVisible();

  await page
    .locator("li", { hasText: `${name} v2` })
    .getByRole("button", { name: "Delete" })
    .click();
  await page.getByRole("button", { name: "Delete service" }).click();
  // Scoped to the list item: the confirmation banner also names the service.
  await expect(page.locator("li", { hasText: `${name} v2` })).toHaveCount(0);
});
