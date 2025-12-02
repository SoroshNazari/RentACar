import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    // Wait for network to be idle before considering page loaded
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Start both backend and frontend servers automatically
  webServer: [
    {
      // Backend server on port 8081
      // Start from project root where gradlew is located
      command: './gradlew bootRun',
      url: 'http://localhost:8081/api/vehicles',
      timeout: 120000, // 2 minutes for backend to start (Spring Boot needs time)
      reuseExistingServer: !process.env.CI, // Reuse if already running (for faster local dev)
      stdout: 'ignore', // Don't clutter test output
      stderr: 'pipe', // Show errors if backend fails to start
      cwd: '..', // Set working directory to project root (from frontend/)
    },
    {
      // Frontend server on port 3000
      command: 'npm run dev -- --host',
      url: 'http://localhost:3000',
      timeout: 60000, // 1 minute for frontend to start
      reuseExistingServer: !process.env.CI, // Reuse if already running
      cwd: '.', // Run from frontend directory
    },
  ],
})

      // Start from project root where gradlew is located
      command: './gradlew bootRun',
      url: 'http://localhost:8081/api/vehicles',
      timeout: 120000, // 2 minutes for backend to start (Spring Boot needs time)
      reuseExistingServer: !process.env.CI, // Reuse if already running (for faster local dev)
      stdout: 'ignore', // Don't clutter test output
      stderr: 'pipe', // Show errors if backend fails to start
      cwd: '..', // Set working directory to project root (from frontend/)
    },
    {
      // Frontend server on port 3000
      command: 'npm run dev -- --host',
      url: 'http://localhost:3000',
      timeout: 60000, // 1 minute for frontend to start
      reuseExistingServer: !process.env.CI, // Reuse if already running
      cwd: '.', // Run from frontend directory
    },
  ],
})
