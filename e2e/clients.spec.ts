import { expect, test } from "@playwright/test";
import { OWNER_EMAIL, signIn, uid } from "./helpers";

test("owner can add and edit a client", async ({ page }) => {
  await signIn(page, OWNER_EMAIL);
  const firstName = `E2E${uid()}`;

  await page.goto("/clients");
  await page.getByRole("button", { name: "Add client" }).click();
  await page.getByLabel("First name").fill(firstName);
  await page.getByLabel("Last name").fill("Client");
  await page.getByLabel("Email").fill(`e2e-client-${uid()}@example.com`);
  await page.getByLabel("Phone").fill("555-0100");
  await page.getByLabel("Notes").fill("E2E note: prefers mornings.");
  await page.getByRole("button", { name: "Add client" }).click();
  await expect(page.getByText(`${firstName} Client`)).toBeVisible();

  await page
    .locator("li", { hasText: `${firstName} Client` })
    .getByRole("button", { name: "Edit" })
    .click();
  await page.getByLabel("Notes").fill("E2E note: prefers afternoons.");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("prefers afternoons.")).toBeVisible();
});
