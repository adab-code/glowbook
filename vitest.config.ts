import { defineConfig } from "vitest/config";

// Unit tests only cover pure modules (`src/lib/utils/*`, `src/lib/validations/*`):
// anything importing `src/lib/db.ts` throws at import time without DATABASE_URL
// (see the CI file), so database-backed helpers stay in throwaway HTTP scripts
// and Playwright specs, never in `vitest run`.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": import.meta.dirname + "/src",
    },
  },
});
