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
  // TEMPORARY diagnostic: log every request around the submit so the CI log
  // shows whether the action dispatched (POST) or nothing left the browser.
  const traffic: string[] = [];
  page.on("request", (request) =>
    traffic.push(`${request.method()} ${new URL(request.url()).pathname}`),
  );
  page.on("response", (response) =>
    traffic.push(`-> ${response.status()} ${new URL(response.url()).pathname}`),
  );
  await page.getByRole("button", { name: "Create studio" }).click();
  await page.waitForTimeout(5000);
  console.log("[e2e-debug] signup traffic:", JSON.stringify(traffic));
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
