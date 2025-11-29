import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login')

    await expect(page.locator('text=Welcome Back')).toBeVisible()
    await expect(page.locator('input[type="text"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login')

    await page.click('text=Sign up')
    await expect(page).toHaveURL('/register')
  })

  test('should display register page', async ({ page }) => {
    await page.goto('/register')

    await expect(page.locator('text=Create Account')).toBeVisible()
    await expect(page.locator('input[name="firstName"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
  })
})

