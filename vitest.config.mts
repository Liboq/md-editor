import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    globals: true,
    // 仅在需要 DOM 环境的测试中使用 jsdom
    environmentMatchGlobs: [
      ["**/*.dom.test.ts", "jsdom"],
      ["**/components/**/*.test.ts", "jsdom"],
      ["**/app/**/*.test.ts", "jsdom"],
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
