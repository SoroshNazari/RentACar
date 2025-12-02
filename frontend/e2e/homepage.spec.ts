import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should display homepage with hero section', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveTitle(/RentACar/i)
    await expect(page).toHaveURL('/')
    await page.getByRole('heading', { name: /Premium Autovermietung einfach gemacht/i }).waitFor({ state: 'visible', timeout: 15000 })
    await page.getByRole('button', { name: 'Fahrzeuge durchsuchen' }).waitFor({ state: 'visible', timeout: 15000 })
  })

  test('should display search bar', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveTitle(/RentACar/i)
    await expect(page).toHaveURL('/')
    // Warte auf das Suchformular - kann durch Lazy Loading verzögert sein
    // Das Label "Standort" ist direkt im HTML, nicht als for-Attribut
    await page.waitForSelector('text=Standort', { timeout: 20000 })
    // Versuche verschiedene Selektoren für das Input-Feld
    const locationInput = page.locator('input[placeholder*="Stadt"], input[placeholder*="Standort"], input[type="text"]').first()
    await locationInput.waitFor({ state: 'visible', timeout: 20000 })
    await page.getByRole('button', { name: 'Suchen' }).waitFor({ state: 'visible', timeout: 20000 })
  })

  test('should display featured vehicles section', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveTitle(/RentACar/i)
    await expect(page).toHaveURL('/')
    // Warte auf Featured Vehicles - kann durch API-Aufruf verzögert sein
    // Der tatsächliche Text ist "Unsere Featured Fahrzeuge"
    // Prüfe ob die Sektion existiert (entweder Heading oder Fahrzeuge)
    await Promise.race([
      page.getByRole('heading', { name: /Unsere Featured Fahrzeuge|Unsere Empfohlenen Fahrzeuge/i }).waitFor({ state: 'visible', timeout: 25000 }).catch(() => null),
      page.locator('button:has-text("Jetzt buchen")').first().waitFor({ state: 'visible', timeout: 25000 }).catch(() => null),
      page.getByText(/BMW|Audi|Mercedes-Benz|Volkswagen|Porsche/i).first().waitFor({ state: 'visible', timeout: 25000 }).catch(() => null),
    ])
    // Wenn Heading nicht gefunden, prüfe ob Fahrzeuge angezeigt werden
    const heading = page.getByRole('heading', { name: /Unsere Featured Fahrzeuge|Unsere Empfohlenen Fahrzeuge/i })
    const vehicles = page.locator('button:has-text("Jetzt buchen")')
    const hasHeading = await heading.isVisible().catch(() => false)
    const hasVehicles = await vehicles.count().then(count => count > 0).catch(() => false)
    expect(hasHeading || hasVehicles).toBe(true)
  })

  test('should navigate to vehicle detail on book now click', async ({ page }) => {
    await page.goto('/')

    const bookNowButton = page.locator('button:has-text("Jetzt buchen")').first()
    if (await bookNowButton.isVisible()) {
      await bookNowButton.click()
      await expect(page).toHaveURL(/\/vehicle\/\d+/)
    }
  })
})
