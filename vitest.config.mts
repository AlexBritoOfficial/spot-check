import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "vitest/config";

// Loads .env.test when present (local dev); in CI, DATABASE_URL etc. come
// from the workflow's own env instead and this is a no-op since the file
// doesn't exist there.
loadEnv({ path: ".env.test" });

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
