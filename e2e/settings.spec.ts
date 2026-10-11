import { expect, test } from "@playwright/test";
import { OWNER_EMAIL, signIn, uid } from "./helpers";

test("owner edits settings and the sidebar updates without signing out", async ({
  page,
}) => {
  await signIn(page, OWNER_EMAIL);
  const name = `E2E Studio ${uid()}`;

  await page.goto("/settings");
  await page.getByLabel("Studio name").fill(name);
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByText(name).first()).toBeVisible();

  // Leave the studio as it was found.
  await page.getByLabel("Studio name").fill("Aurea Lashes");
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByText("Aurea Lashes").first()).toBeVisible();
});
