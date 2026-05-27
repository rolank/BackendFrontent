import { defineConfig } from "@playwright/test";

const port = Number(process.env.SMOKE_TEST_PORT || 4173);

export default defineConfig({
  testDir: "./src/smoke",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: `http://127.0.0.1:${port}`,
  },
  webServer: {
    command: `SMOKE_TEST_PORT=${port} node src/test/smoke-server.js`,
    port,
    timeout: 60_000,
    reuseExistingServer: false,
  },
});
