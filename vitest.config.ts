import { defineConfig } from "vitest/config";
import path from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: [
      "server/**/*.test.{ts,tsx}",
      "packages/**/*.test.{ts,tsx}",
      "apps/**/*.test.{ts,tsx}",
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/e2e/**",
      "**/12-Step-Companion/**",
      "**/*.config.*",
      "**/types/**",
    ],
    environmentMatchGlobs: [
      ["server/**", "node"],
      ["packages/api/**", "node"],
      ["apps/web/**", "jsdom"],
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "**/*.config.*",
        "**/types/**",
        "**/*.test.*",
        "**/*.spec.*",
        "**/__tests__/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "./shared"),
      "@packages": path.resolve(__dirname, "./packages"),
    },
  },
});

