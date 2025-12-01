import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveTitle(/RentACar/i)
    await expect(page).toHaveURL('/login')
    await page.getByText('RentACar').waitFor({ state: 'visible', timeout: 15000 })

    await page.getByRole('heading', { name: 'Welcome Back' }).waitFor({ state: 'visible', timeout: 15000 })
    await page.locator('input[type="text"]').waitFor({ state: 'visible', timeout: 15000 })
    await page.locator('input[type="password"]').waitFor({ state: 'visible', timeout: 15000 })
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveTitle(/RentACar/i)
    await expect(page).toHaveURL('/login')
    await page.getByText('RentACar').waitFor({ state: 'visible', timeout: 15000 })

    await page.getByText('Sign up').click()
    await expect(page).toHaveURL('/register')
  })

  test('should display register page', async ({ page }) => {
    await page.goto('/register')
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveTitle(/RentACar/i)
    await expect(page).toHaveURL('/register')
    await page.getByText('RentACar').waitFor({ state: 'visible', timeout: 15000 })

    await page.getByRole('heading', { name: 'Create Account' }).waitFor({ state: 'visible', timeout: 15000 })
    await page.locator('input[name="firstName"]').waitFor({ state: 'visible', timeout: 15000 })
    await page.locator('input[name="email"]').waitFor({ state: 'visible', timeout: 15000 })
  })
})
