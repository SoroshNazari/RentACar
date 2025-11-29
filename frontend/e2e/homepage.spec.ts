import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should display homepage with hero section', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('text=Premium Car Rental Made Simple')).toBeVisible()
    await expect(page.locator('text=Browse Vehicles')).toBeVisible()
  })

  test('should display search bar', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('input[placeholder*="City, Airport"]')).toBeVisible()
    await expect(page.locator('button:has-text("Search")')).toBeVisible()
  })

  test('should display featured vehicles section', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('text=Our Featured Vehicles')).toBeVisible()
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

