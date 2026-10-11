import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end suite. Every spec runs against a real Postgres (CI service, or a
 * local instance for `npm run test:e2e`), seeded with the demo studio — see
 * the `e2e` job in .github/workflows/ci.yml and README → "End-to-end tests".
 *
 * Sequential (`workers: 1`): specs share the seeded studio, so parallel runs
 * could book the same slot twice and flake.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000/login",
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
    env: {
      DATABASE_URL: process.env.DATABASE_URL ?? "",
      AUTH_SECRET: process.env.AUTH_SECRET ?? "e2e-local-secret",
      AUTH_TRUST_HOST: "true",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
