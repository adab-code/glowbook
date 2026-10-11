import { expect, test } from "@playwright/test";
import { OWNER_EMAIL, signIn, uid } from "./helpers";

test("owner invites, the invitee joins, then a second invite is revoked", async ({
  page,
}) => {
  await signIn(page, OWNER_EMAIL);
  const email = `e2e-invite-${uid()}@example.com`;

  await page.goto("/team");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Send invite" }).click();
  const rawLink = await page.locator("code").first().textContent();
  expect(rawLink).toContain("/invite?token=");
  if (!rawLink) throw new Error("invite link did not render");
  const acceptUrl = rawLink.trim();
  // Scoped to the list row: the confirmation banner also names the address.
  await expect(page.locator("li", { hasText: email })).toBeVisible();

  // Follow the link in a signed-out tab: the seeded owner session is gone.
  await page.context().clearCookies();
  await page.goto(acceptUrl);
  await expect(page.getByText(email)).toBeVisible();
  await page.getByLabel("First name").fill("E2E");
  await page.getByLabel("Last name").fill("Invitee");
  // Exact: "Confirm password" contains "Password" as a substring.
  await page.getByLabel("Password", { exact: true }).fill("password123");
  await page.getByLabel("Confirm password").fill("password123");
  await page.getByRole("button", { name: "Join the studio" }).click();
  await page.waitForURL("**/dashboard");

  // Revoke a fresh invite as the owner again.
  await page.context().clearCookies();
  await signIn(page, OWNER_EMAIL);
  const doomed = `e2e-doomed-${uid()}@example.com`;
  await page.goto("/team");
  await page.getByLabel("Email").fill(doomed);
  await page.getByRole("button", { name: "Send invite" }).click();
  await expect(page.getByText(doomed)).toBeVisible();
  await page
    .locator("li", { hasText: doomed })
    .getByRole("button", { name: "Revoke" })
    .click();
  await page.getByRole("button", { name: "Revoke invitation" }).click();
  // Scoped to the list item: the confirmation banner also names the address.
  await expect(page.locator("li", { hasText: doomed })).toHaveCount(0);
});
