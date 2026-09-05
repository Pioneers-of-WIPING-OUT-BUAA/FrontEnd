import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/browser',
  timeout: 30000,
  use: { baseURL: 'http://127.0.0.1:4175', headless: true },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4175 --strictPort',
    url: 'http://127.0.0.1:4175',
    env: {
      VITE_VUE_ROUTER_MODE: 'history',
      VITE_API_BASE_URL: 'http://127.0.0.1:8000/api',
      VITE_ROSBRIDGE_URL: 'ws://127.0.0.1:9090'
    },
    reuseExistingServer: false
  }
})
