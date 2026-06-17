import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: {
      // Mirror the tsconfig "@/*" -> "./src/*" path alias so tests can import
      // modules (and their transitive deps) that use the "@/" prefix.
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
})
