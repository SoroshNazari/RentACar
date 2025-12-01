import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should display homepage with hero section', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveTitle(/RentACar/i)
    await expect(page).toHaveURL('/')
    await page.getByRole('heading', { name: 'Premium Car Rental Made Simple' }).waitFor({ state: 'visible', timeout: 15000 })
    await page.getByRole('button', { name: 'Browse Vehicles' }).waitFor({ state: 'visible', timeout: 15000 })
  })

  test('should display search bar', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveTitle(/RentACar/i)
    await expect(page).toHaveURL('/')
    await page.getByLabel('Location').waitFor({ state: 'visible', timeout: 15000 })
    await page.getByRole('button', { name: 'Search' }).waitFor({ state: 'visible', timeout: 15000 })
  })

  test('should display featured vehicles section', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveTitle(/RentACar/i)
    await expect(page).toHaveURL('/')
    await page.getByRole('heading', { name: 'Our Featured Vehicles' }).waitFor({ state: 'visible', timeout: 15000 })
  })

  test('should navigate to vehicle detail on book now click', async ({ page }) => {
    await page.goto('/')

    const bookNowButton = page.locator('button:has-text("Book Now")').first()
    if (await bookNowButton.isVisible()) {
      await bookNowButton.click()
      await expect(page).toHaveURL(/\/vehicle\/\d+/)
    }
  })
})
