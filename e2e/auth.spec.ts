import { expect, test } from "@playwright/test";
import {
  OWNER_EMAIL,
  SEED_PASSWORD,
  expectOnDashboard,
  signIn,
  signOut,
  uid,
} from "./helpers";

test("signup creates a studio and lands on the dashboard", async ({ page }) => {
  await page.goto("/signup");
  await page.getByLabel("Studio name").fill(`E2E Studio ${uid()}`);
  await page.getByLabel("First name").fill("E2E");
  await page.getByLabel("Last name").fill("Owner");
  await page.getByLabel("Email").fill(`e2e-owner-${uid()}@example.com`);
  await page.getByLabel("Password").fill("password123");
  // Diagnostic: prove what the field holds before submit (see CI signup flake).
  await expect(page.getByLabel("Password")).toHaveValue("password123");
  await page.getByRole("button", { name: "Create studio" }).click();
  // TEMPORARY diagnostic: input VALUES (textContent cannot see them) plus any
  // visible error, so the CI log shows whether the action errored or the page
  // reloaded. Lengths only — never the secrets themselves.
  await page.waitForTimeout(4000);
  const lengths: Record<string, number | string> = {};
  for (const label of ["Studio name", "Email", "Password"]) {
    try {
      lengths[label] = (await page.getByLabel(label).inputValue()).length;
    } catch {
      lengths[label] = "<gone>";
    }
  }
  const alerts = await page
    .locator('[role="alert"]')
    .allTextContents()
    .catch(() => [] as string[]);
  console.log(
    "[e2e-debug] signup state:",
    page.url(),
    JSON.stringify(lengths),
    JSON.stringify(alerts.map((text) => text.slice(0, 200))),
  );
  await expectOnDashboard(page);
  await signOut(page);
});

test("seeded owner signs in, a wrong password is rejected", async ({
  page,
}) => {
  await signIn(page, OWNER_EMAIL, SEED_PASSWORD);
  await signOut(page);
  await page.getByLabel("Email").fill(OWNER_EMAIL);
  await page.getByLabel("Password").fill("wrong-password-1");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Invalid email or password.")).toBeVisible();
});
