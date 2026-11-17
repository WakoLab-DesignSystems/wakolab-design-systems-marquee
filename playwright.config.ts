// Checks of the built package through the examples (run `npm run build` first). Original code.
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: /.*\.spec\.ts/,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:5191",
    launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
  },
  webServer: {
    command: "npx vite --config examples/vite.config.ts",
    url: "http://127.0.0.1:5191/demo/",
    reuseExistingServer: true,
  },
});
