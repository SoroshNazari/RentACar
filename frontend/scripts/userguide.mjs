import puppeteer from 'puppeteer'
import fs from 'fs'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const OUT_DIR = path.join(__dirname, '../screenshots')

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true })
}

async function capture(page, filePath) {
  try {
    await page.waitForNetworkIdle({ idleTime: 500, timeout: 15000 })
  } catch (e) {
    void e
  }
  await page.screenshot({ path: filePath, fullPage: true })
}

async function gotoAndWait(page, url, selector) {
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  if (selector) {
    await page.waitForSelector(selector, { timeout: 15000 })
  }
}

async function main() {
  await ensureDir(OUT_DIR)
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1366, height: 900 },
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1366, height: 900 })

  // Home
  await gotoAndWait(page, `${BASE_URL}/`, null)
  await capture(page, path.join(OUT_DIR, 'home.png'))

  // Login
  await gotoAndWait(page, `${BASE_URL}/login`, null)
  await capture(page, path.join(OUT_DIR, 'login.png'))

  // Register
  await gotoAndWait(page, `${BASE_URL}/register`, null)
  await capture(page, path.join(OUT_DIR, 'register.png'))

  // Vehicles
  await gotoAndWait(page, `${BASE_URL}/vehicles`, null)
  await capture(page, path.join(OUT_DIR, 'vehicles.png'))

  // Vehicle Detail (direct)
  await gotoAndWait(page, `${BASE_URL}/vehicle/1`, null)
  await capture(page, path.join(OUT_DIR, 'vehicle-detail.png'))

  // Booking Flow
  const pickup = '2025-01-01'
  const dropoff = '2025-01-03'
  await gotoAndWait(page, `${BASE_URL}/booking/1?pickupDate=${pickup}&dropoffDate=${dropoff}`, null)
  await capture(page, path.join(OUT_DIR, 'booking-flow.png'))

  // Dashboard (booking success)
  await page.addScriptTag({
    content: `
      localStorage.setItem('authToken', 'dXNlcjpwYXNz');
      localStorage.setItem('username', 'demo');
      localStorage.setItem('userRole', 'CUSTOMER');
    `,
  })
  await gotoAndWait(page, `${BASE_URL}/dashboard?booking=success`, null)
  await capture(page, path.join(OUT_DIR, 'booking-success.png'))

  await browser.close()
}

main().catch((err) => {
  process.stderr.write(`Userguide capture failed: ${String(err)}\n`)
  process.exit(1)
})
