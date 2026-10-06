import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  workers: 2,
  timeout: 30000,
  use: {
    timezoneId: "Asia/Seoul",
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    },
  },
  projects: [
    {
      name: "local",
      testMatch: ["local.spec.ts", "weather.spec.ts"],
      use: { baseURL: "http://127.0.0.1:8445" },
    },
    {
      name: "cloud",
      testMatch: "cloud.spec.ts",
      use: { baseURL: "http://127.0.0.1:8446" },
    },
  ],
  webServer: [
    {
      command: "npm run dev -- --host 127.0.0.1 --port 8445",
      url: "http://127.0.0.1:8445",
      env: { VITE_SUPABASE_URL: "", VITE_SUPABASE_ANON_KEY: "" },
    },
    {
      command: "npm run dev -- --host 127.0.0.1 --port 8446",
      url: "http://127.0.0.1:8446",
      env: {
        VITE_SUPABASE_URL: "https://test.supabase.co",
        VITE_SUPABASE_ANON_KEY: "public-test-key-not-a-credential",
      },
    },
  ],
})
