import { expect, type Page } from "@playwright/test";

export const OWNER_EMAIL = "owner@glowbook.dev";
export const STAFF_EMAIL = "staff@glowbook.dev";
export const SEED_PASSWORD = process.env.SEED_PASSWORD ?? "GlowBook!2026";

/** Unique suffix so reruns never collide with rows a previous run left behind. */
export const uid = () => Date.now().toString(36);

export async function signIn(
  page: Page,
  email: string,
  password: string = SEED_PASSWORD,
) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/dashboard");
}

export async function signOut(page: Page) {
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL("**/login*");
}

export async function expectOnDashboard(page: Page) {
  // Reaching /dashboard at all proves the session: the auth gate bounces
  // logged-out visitors back to /login.
  await expect(page).toHaveURL(/\/dashboard/);
}
