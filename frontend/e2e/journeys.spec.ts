import { test, expect } from '@playwright/test'

test.describe('Critical Journeys', () => {
  test('Login, browse, book, confirm', async ({ page }) => {
    // Login as seeded customer
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')
    await page.getByRole('heading', { name: 'Welcome Back' }).waitFor({ state: 'visible', timeout: 15000 })
    await page.getByPlaceholder('Enter your username').fill('customer')
    await page.getByPlaceholder('Enter your password').fill('customer123')
    await page.getByRole('button', { name: 'Sign In' }).click()

    // Navigate to vehicles
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await page.getByRole('button', { name: 'Browse Vehicles' }).waitFor({ state: 'visible', timeout: 15000 })
    await page.getByRole('button', { name: 'Browse Vehicles' }).click()
    await expect(page).toHaveURL(/\/vehicles/)

    // Open first vehicle
    const firstViewBtn = page.locator('button:has-text("View Details")').first()
    await firstViewBtn.click()
    await expect(page).toHaveURL(/\/vehicle\//)

    // On vehicle detail: set dates and go to booking
    const pickup = page.locator('input[type="date"]').first()
    const dropoff = page.locator('input[type="date"]').nth(1)
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    await pickup.fill(`${yyyy}-${mm}-${dd}`)
    const nextDay = new Date(today.getTime() + 24 * 3600 * 1000)
    const dd2 = String(nextDay.getDate()).padStart(2, '0')
    await dropoff.fill(`${yyyy}-${mm}-${dd2}`)
    await page.getByRole('button', { name: 'Book Now' }).click()
    await expect(page).toHaveURL(/\/booking\//)

    // Booking flow: fill details and payment, confirm
    await page.getByRole('button', { name: 'Continue to Details' }).click()
    await page.getByPlaceholder('John Doe').fill('Max Mustermann')
    await page.getByPlaceholder('john@example.com').fill('max@example.com')
    await page.getByPlaceholder('+49 123 456789').fill('+49 111 222333')
    await page.getByPlaceholder('DL-123-456').fill('DL-987654')
    await page.getByRole('button', { name: 'Continue to Payment' }).click()

    await page.getByPlaceholder('0000 0000 0000 0000').fill('4111 1111 1111 1111')
    await page.getByPlaceholder('John Doe').fill('Max Mustermann')
    await page.getByPlaceholder('MM/YY').fill('12/30')
    await page.getByPlaceholder('...').fill('123')

    await page.getByRole('button', { name: 'Confirm & Pay' }).click()
    await expect(page).toHaveURL(/\/dashboard\?booking=success/)
  })
})
