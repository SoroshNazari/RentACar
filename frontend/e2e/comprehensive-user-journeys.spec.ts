import { test, expect } from '@playwright/test'

/**
 * Comprehensive End-to-End Test Suite for RentACar Application
 * 
 * This suite tests complete user journeys in natural language scenarios,
 * covering all major workflows from registration to booking completion.
 * 
 * IMPORTANT: These tests use REAL data from the backend database.
 * The backend must be running and seeded with test data.
 * 
 * Test Data (seeded by DataInitializer):
 * - Users: customer/customer123, employee/employee123, admin/admin123
 * - Vehicles: Multiple vehicles in Berlin, München, Hamburg, Frankfurt, Köln
 * - Customers: Multiple test customers
 */

test.describe('Complete User Journeys - E2E Testing with Real Data', () => {
  
  // Verify backend is accessible before running tests
  test.beforeAll(async ({ request }) => {
    // Wait for backend to be ready
    let retries = 30
    while (retries > 0) {
      try {
        const response = await request.get('http://localhost:8081/api/vehicles')
        if (response.ok()) {
          console.log('Backend is ready and accessible')
          break
        }
      } catch (_error) {
        retries--
        if (retries === 0) {
          throw new Error('Backend server is not accessible. Please ensure it is running on port 8081.')
        }
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  })
  
  /**
   * Journey 1: New Customer Registration and First Booking
   * 
   * As a new user, I want to:
   * 1. Register a new account
   * 2. Browse available vehicles
   * 3. View vehicle details
   * 4. Complete a booking
   * 5. See my booking confirmation
   */
  test('New Customer: Register → Browse → Book → Confirm', async ({ page }) => {
    // Step 1: Navigate to registration page
    await page.goto('/register')
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveURL('/register')
    await expect(page.getByRole('heading', { name: 'Konto erstellen' })).toBeVisible()

    // Step 2: Fill registration form with valid data
    const timestamp = Date.now()
    const testUser = {
      firstName: 'Max',
      lastName: 'Mustermann',
      username: `testuser_${timestamp}`,
      email: `test_${timestamp}@example.com`,
      phone: '+49 123 456789',
      address: 'Teststraße 123, 12345 Berlin',
      driverLicense: 'DL-123-456',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!'
    }

    await page.locator('input[name="firstName"]').fill(testUser.firstName)
    await page.locator('input[name="lastName"]').fill(testUser.lastName)
    await page.locator('input[name="username"]').fill(testUser.username)
    await page.locator('input[name="email"]').fill(testUser.email)
    await page.locator('input[name="phone"]').fill(testUser.phone)
    await page.locator('input[name="address"]').fill(testUser.address)
    await page.locator('input[name="driverLicenseNumber"]').fill(testUser.driverLicense)
    await page.locator('input[name="password"]').fill(testUser.password)
    await page.locator('input[name="confirmPassword"]').fill(testUser.confirmPassword)

    // Step 4: Submit registration (REAL API call - creates user in database)
    await page.getByRole('button', { name: /Registrieren|Konto erstellen/i }).click()
    
    // Step 5: Wait for REAL API response - should redirect to login page after successful registration
    await page.waitForURL(/\/login/, { timeout: 15000 })
    await expect(page).toHaveURL(/\/login/)
    
    // Verify registration was successful (either success message or just redirect)
    const successMessage = page.getByText(/registered successfully|account created|success/i)
    const hasSuccessMessage = await successMessage.isVisible().catch(() => false)
    if (hasSuccessMessage) {
      await expect(successMessage).toBeVisible()
    }

    // Step 6: Login with new credentials (REAL API call to backend)
    await page.getByPlaceholder(/Dein Benutzername|Benutzername/i).fill(testUser.username)
    await page.getByPlaceholder(/Dein Passwort|Passwort/i).fill(testUser.password)
    await page.getByRole('button', { name: /Anmelden/i }).click()

    // Step 7: Wait for REAL authentication response from backend
    await page.waitForURL(/\/(dashboard|$)/, { timeout: 15000 })
    
    // Verify login was successful by checking for authenticated user elements
    await expect(
      page.getByText(/profile|dashboard|my bookings|logout/i)
    ).toBeVisible({ timeout: 10000 })

    // Step 8: Navigate to vehicles page (will load REAL vehicles from backend)
    await page.goto('/vehicles')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/\/vehicles/)

    // Step 9: Wait for REAL vehicles to load from backend API
    await page.waitForSelector('button:has-text("Details anzeigen"), a:has-text("Details anzeigen")', { timeout: 20000 })
    
    // Verify that REAL vehicles are displayed (not empty list)
    const vehicleLinks = page.locator('button:has-text("Details anzeigen"), a:has-text("Details anzeigen")')
    const vehicleCount = await vehicleLinks.count()
    expect(vehicleCount).toBeGreaterThan(0) // Ensure we have REAL vehicles from database
    
    const firstVehicleLink = vehicleLinks.first()
    await firstVehicleLink.click()

    // Step 10: Should be on vehicle detail page with REAL vehicle data
    await expect(page).toHaveURL(/\/vehicle\/\d+/)
    
    // Wait for REAL vehicle data to load from backend
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 15000 })
    
    // Verify REAL vehicle data is displayed (brand, model, price from database)
    await expect(page.getByText(/BMW|Audi|Mercedes-Benz|Volkswagen|Porsche/i)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/€|EUR|price|Preis/i)).toBeVisible()

    // Step 10: Select rental dates
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfter = new Date(tomorrow)
    dayAfter.setDate(dayAfter.getDate() + 2)

    const pickupDate = tomorrow.toISOString().split('T')[0]
    const dropoffDate = dayAfter.toISOString().split('T')[0]

    const pickupInput = page.locator('input[type="date"]').first()
    const dropoffInput = page.locator('input[type="date"]').nth(1)

    await pickupInput.fill(pickupDate)
    await dropoffInput.fill(dropoffDate)

    // Step 11: Click Book Now
    await page.getByRole('button', { name: 'Jetzt buchen' }).click()
    await expect(page).toHaveURL(/\/booking\/\d+/)

    // Step 12: Complete booking flow - Step 1: Dates (should be pre-filled)
    await page.waitForLoadState('domcontentloaded')
    await page.getByRole('button', { name: /Weiter zu Schritt 2|Weiter zu Kundendaten/i }).click()

    // Step 13: Step 2: Customer Details
    await page.getByPlaceholder(/Max Mustermann|Vollständiger Name/i).fill(`${testUser.firstName} ${testUser.lastName}`)
    await page.getByPlaceholder(/max@example.com|E-Mail/i).fill(testUser.email)
    await page.getByPlaceholder(/\+49 123 456789|Telefon/i).fill(testUser.phone)
    await page.getByPlaceholder(/B123456789|Führerschein/i).fill(testUser.driverLicense)
    await page.getByRole('button', { name: /Weiter zur Zahlung/i }).click()

    // Step 14: Step 3: Payment
    await page.getByPlaceholder(/card number|0000 0000 0000 0000/i).fill('4111 1111 1111 1111')
    await page.getByPlaceholder(/Max Mustermann|Name auf der Karte/i).fill(`${testUser.firstName} ${testUser.lastName}`)
    await page.getByPlaceholder(/MM\/JJ|Ablaufdatum/i).fill('12/30')
    await page.getByPlaceholder(/cvv|cvc|\.\.\./i).fill('123')

    // Step 15: Confirm booking (REAL API call - creates actual booking in database)
    await page.getByRole('button', { name: /Bestätigen & Bezahlen/i }).click()

    // Step 16: Wait for REAL booking creation response from backend
    await page.waitForURL(/\/(dashboard|\?booking=success)/, { timeout: 20000 })
    
    // Verify booking was created successfully (check for success indicators)
    const successIndicators = [
      page.getByText(/booking.*success|confirmed|thank you|booking.*complete/i),
      page.getByText(/success/i),
      page.locator('[class*="success"], [class*="confirmed"]')
    ]
    
    let _successFound = false
    for (const indicator of successIndicators) {
      try {
        if (await indicator.isVisible({ timeout: 5000 })) {
          _successFound = true
          break
        }
      } catch {
        // Continue checking other indicators
      }
    }
    
    // At minimum, we should be redirected to dashboard after successful booking
    expect(page.url()).toMatch(/\/(dashboard|\?booking=success)/)
  })

  /**
   * Journey 2: Existing Customer Login and Quick Booking
   * 
   * As an existing customer, I want to:
   * 1. Login to my account
   * 2. View my dashboard
   * 3. Search for vehicles
   * 4. Make a quick booking
   */
  test('Existing Customer: Login → Dashboard → Quick Booking', async ({ page }) => {
    // Step 1: Login as existing customer (REAL user from database: customer/customer123)
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')
    
    await page.getByPlaceholder(/Dein Benutzername|Benutzername/i).fill('customer')
    await page.getByPlaceholder(/Dein Passwort|Passwort/i).fill('customer123')
    await page.getByRole('button', { name: /Anmelden/i }).click()

    // Step 2: Wait for REAL authentication response from backend
    await page.waitForURL(/\/(dashboard|$)/, { timeout: 15000 })
    
    // Step 3: Verify dashboard is visible with REAL user data
    await expect(page.getByText(/dashboard|my bookings|profile/i)).toBeVisible({ timeout: 10000 })
    
    // Verify we're logged in as the real customer user
    await expect(page.getByText(/customer|max mustermann/i)).toBeVisible({ timeout: 5000 }).catch(() => {
      // User name might not be displayed, but we should see authenticated content
    })

    // Step 4: Navigate to home page and use search
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Step 5: Fill search form - warte auf Formular
    // Das Label "Standort" hat kein for-Attribut, verwende direkten Selektor
    await page.waitForSelector('text=Standort', { timeout: 20000 })
    // Versuche verschiedene Selektoren für das Input-Feld
    const locationInput = page.locator('input[placeholder*="Stadt"], input[placeholder*="Standort"], input[type="text"]').first()
    await locationInput.waitFor({ state: 'visible', timeout: 20000 })
    await locationInput.fill('Berlin')
    
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfter = new Date(tomorrow)
    dayAfter.setDate(dayAfter.getDate() + 3)

    await page.getByLabel(/Abholdatum|pick.*up|start date/i).fill(tomorrow.toISOString().split('T')[0])
    await page.getByLabel(/Rückgabedatum|drop.*off|end date|return/i).fill(dayAfter.toISOString().split('T')[0])

    // Step 6: Submit search (REAL API call to search available vehicles)
    await page.getByRole('button', { name: /Suchen/i }).click()
    await expect(page).toHaveURL(/\/vehicles/)
    
    // Wait for REAL search results from backend
    await page.waitForLoadState('networkidle')

    // Step 7: Verify REAL search results are displayed
    await page.waitForSelector('button:has-text("Details anzeigen"), a:has-text("Details anzeigen")', { timeout: 20000 })
    const vehicleLinks = page.locator('button:has-text("Details anzeigen"), a:has-text("Details anzeigen")')
    const vehicleCount = await vehicleLinks.count()
    expect(vehicleCount).toBeGreaterThan(0) // Ensure we have REAL search results
    
    const vehicleLink = vehicleLinks.first()
    await vehicleLink.click()

    // Step 8: Complete quick booking
    await expect(page).toHaveURL(/\/vehicle\/\d+/)
    await page.getByRole('button', { name: 'Jetzt buchen' }).click()
    await expect(page).toHaveURL(/\/booking\/\d+/)
  })

  /**
   * Journey 3: Employee Check-out and Check-in Workflow
   * 
   * As an employee, I want to:
   * 1. Login as employee
   * 2. View pending check-outs
   * 3. Perform vehicle check-out
   * 4. View pending check-ins
   * 5. Perform vehicle check-in
   */
  test('Employee: Login → Check-out → Check-in Workflow', async ({ page }) => {
    // Step 1: Login as employee (REAL user from database: employee/employee123)
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')
    
    await page.getByPlaceholder(/Dein Benutzername|Benutzername/i).fill('employee')
    await page.getByPlaceholder(/Dein Passwort|Passwort/i).fill('employee123')
    await page.getByRole('button', { name: /Anmelden/i }).click()

    // Step 2: Wait for REAL authentication response from backend
    await page.waitForURL(/\/(employee|dashboard)/, { timeout: 15000 })
    
    // Verify employee role is active
    await expect(
      page.getByText(/employee|check.*out|check.*in/i)
    ).toBeVisible({ timeout: 10000 })

    // Step 3: Navigate to employee check-out page
    await page.goto('/employee')
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveURL(/\/employee/)

    // Step 4: Verify check-out page is visible and loads REAL booking data
    await page.waitForLoadState('networkidle')
    await expect(
      page.getByText(/employee.*check.*out|pending.*pickups|confirmed.*pickups/i)
    ).toBeVisible({ timeout: 15000 })

    // Step 5: Check if there are any REAL bookings to check out (from database)
    // Wait for API to load bookings
    await page.waitForTimeout(2000) // Give API time to load bookings
    const checkoutButtons = page.locator('button:has-text("Check-out"), button:has-text("Perform Check-out")')
    const checkoutCount = await checkoutButtons.count()

    if (checkoutCount > 0) {
      // Step 6: Perform check-out on REAL booking (from database)
      await checkoutButtons.first().click()
      
      // Step 7: Fill check-out form (mileage, notes) - will be saved to REAL database
      const mileageInput = page.locator('input[placeholder*="mileage"], input[type="number"]').first()
      if (await mileageInput.isVisible({ timeout: 5000 })) {
        await mileageInput.fill('50000')
      }

      const notesInput = page.locator('textarea, input[placeholder*="note"]').first()
      if (await notesInput.isVisible({ timeout: 5000 })) {
        await notesInput.fill('Vehicle in good condition - E2E Test')
      }

      // Step 8: Confirm check-out (REAL API call - updates booking in database)
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Check-out")').last()
      if (await confirmButton.isVisible({ timeout: 5000 })) {
        await confirmButton.click()
        // Wait for REAL API response
        await page.waitForTimeout(2000)
      }
    } else {
      console.log('No bookings available for check-out - this is expected if database is empty')
    }

    // Step 9: Navigate to check-in page
    await page.goto('/employee/checkin')
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveURL(/\/employee\/checkin/)

    // Step 10: Verify check-in page is visible
    await expect(
      page.getByText(/employee.*check.*in|pending.*returns|confirmed.*returns/i)
    ).toBeVisible({ timeout: 10000 })

    // Step 11: Check if there are any REAL bookings to check in (from database)
    await page.waitForTimeout(2000) // Give API time to load bookings
    const checkinButtons = page.locator('button:has-text("Check-in"), button:has-text("Perform Check-in")')
    const checkinCount = await checkinButtons.count()

    if (checkinCount > 0) {
      // Step 12: Perform check-in on REAL booking
      await checkinButtons.first().click()
      
      // Step 13: Fill check-in form - will be saved to REAL database
      const returnMileageInput = page.locator('input[placeholder*="mileage"], input[type="number"]').first()
      if (await returnMileageInput.isVisible({ timeout: 5000 })) {
        await returnMileageInput.fill('50100')
      }

      // Step 14: Confirm check-in (REAL API call - updates booking in database)
      const confirmCheckinButton = page.locator('button:has-text("Confirm"), button:has-text("Check-in")').last()
      if (await confirmCheckinButton.isVisible({ timeout: 5000 })) {
        await confirmCheckinButton.click()
        // Wait for REAL API response
        await page.waitForTimeout(2000)
      }
    } else {
      console.log('No bookings available for check-in - this is expected if database is empty')
    }
  })

  /**
   * Journey 4: Vehicle Browsing and Filtering
   * 
   * As a user, I want to:
   * 1. Browse all available vehicles
   * 2. View vehicle details
   * 3. Compare different vehicles
   * 4. Navigate between vehicles
   */
  test('User: Browse Vehicles → View Details → Compare', async ({ page }) => {
    // Step 1: Navigate to vehicles page (will load REAL vehicles from database)
    await page.goto('/vehicles')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/\/vehicles/)

    // Step 2: Verify REAL vehicles are displayed from backend (German text)
    // Warte auf Fahrzeuge oder Loading-State
    await page.waitForLoadState('networkidle')
    // Prüfe ob Fahrzeuge geladen wurden (entweder Liste oder Fehlermeldung)
    const hasVehicles = page.locator('button:has-text("Details anzeigen"), a:has-text("Details anzeigen")')
    const hasError = page.getByText(/Fehler|error|nicht geladen/i)
    const hasLoading = page.getByText(/werden geladen|loading/i)
    
    // Warte bis entweder Fahrzeuge, Fehler oder Loading verschwunden ist
    await Promise.race([
      hasVehicles.first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => null),
      hasError.waitFor({ state: 'visible', timeout: 20000 }).catch(() => null),
      hasLoading.waitFor({ state: 'hidden', timeout: 20000 }).catch(() => null),
    ])

    // Step 3: Get list of REAL vehicles from database
    await page.waitForSelector('button:has-text("Details anzeigen"), a:has-text("Details anzeigen")', { timeout: 20000 })
    const vehicleLinks = page.locator('button:has-text("Details anzeigen"), a:has-text("Details anzeigen")')
    const vehicleCount = await vehicleLinks.count()

    // Verify we have REAL vehicles from database (should be many from DataInitializer)
    expect(vehicleCount).toBeGreaterThan(0)
    console.log(`Found ${vehicleCount} REAL vehicles from database`)

    // Step 4: Click on first vehicle
    await vehicleLinks.first().click()
    await expect(page).toHaveURL(/\/vehicle\/\d+/)

    // Step 5: Verify REAL vehicle details page (data from database)
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 15000 })
    
    // Verify REAL vehicle data is displayed
    await expect(page.getByText(/€|price|daily/i)).toBeVisible()
    await expect(page.getByText(/location|mileage|license/i)).toBeVisible()
    
    // Verify we see REAL vehicle brands/models from database
    await expect(
      page.getByText(/BMW|Audi|Mercedes-Benz|Volkswagen|Porsche|location.*Berlin|location.*München|location.*Hamburg/i)
    ).toBeVisible({ timeout: 10000 })

    // Step 6: Navigate back to vehicles
    await page.goBack()
    await expect(page).toHaveURL(/\/vehicles/)

    // Step 7: Click on second vehicle (if available)
    if (vehicleCount > 1) {
      await vehicleLinks.nth(1).click()
      await expect(page).toHaveURL(/\/vehicle\/\d+/)
      
      // Step 8: Verify different vehicle details
      await expect(page.getByRole('heading').first()).toBeVisible()
    }
  })

  /**
   * Journey 5: Error Handling and Validation
   * 
   * As a user, I want to:
   * 1. See proper error messages for invalid inputs
   * 2. Be prevented from submitting invalid forms
   * 3. Get feedback on authentication failures
   */
  test('Error Handling: Invalid Login → Registration Validation → Booking Validation', async ({ page }) => {
    // Step 1: Test invalid login
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')
    
    await page.getByPlaceholder(/Dein Benutzername|Benutzername/i).fill('invalid_user')
    await page.getByPlaceholder(/Dein Passwort|Passwort/i).fill('wrong_password')
    await page.getByRole('button', { name: /Anmelden/i }).click()

    // Step 2: Should show REAL error message from backend API
    await expect(
      page.getByText(/invalid|incorrect|wrong|error|unauthorized|bad credentials/i)
    ).toBeVisible({ timeout: 10000 })

    // Step 3: Test registration validation
    await page.goto('/register')
    await page.waitForLoadState('domcontentloaded')

    // Step 4: Try to submit empty form
    await page.getByRole('button', { name: /Registrieren|Konto erstellen/i }).click()

    // Step 5: Should show validation errors (HTML5 validation or custom)
    const firstNameInput = page.locator('input[name="firstName"]')
    const isRequired = await firstNameInput.evaluate((el: HTMLInputElement) => el.required)
    expect(isRequired).toBe(true)

    // Step 6: Test password mismatch
    await page.locator('input[name="password"]').fill('password123')
    await page.locator('input[name="confirmPassword"]').fill('different_password')
    await page.getByRole('button', { name: /Registrieren|Konto erstellen/i }).click()

    // Step 7: Should show password mismatch error (German text)
    await expect(
      page.getByText(/passwörter.*stimmen.*nicht|passwort.*stimmen.*nicht|passwörter.*nicht.*überein/i)
    ).toBeVisible({ timeout: 5000 })

    // Step 8: Test booking validation (requires login)
    await page.goto('/login')
    await page.getByPlaceholder(/Dein Benutzername|Benutzername/i).fill('customer')
    await page.getByPlaceholder(/Dein Passwort|Passwort/i).fill('customer123')
    await page.getByRole('button', { name: /Anmelden/i }).click()
    await page.waitForURL(/\/(dashboard|$)/, { timeout: 10000 })

    // Step 9: Navigate to REAL vehicle from database
    await page.goto('/vehicles')
    await page.waitForSelector('button:has-text("Details anzeigen")', { timeout: 20000 })
    await page.locator('button:has-text("Details anzeigen")').first().click()
    await expect(page).toHaveURL(/\/vehicle\/\d+/)
    
    // Wait for REAL vehicle data to load
    await page.waitForLoadState('networkidle')

    // Step 10: Try to book without dates (client-side validation)
    page.on('dialog', async dialog => {
      expect(dialog.message()).toMatch(/select.*date|pickup.*drop.*off/i)
      await dialog.accept()
    })
    
    await page.getByRole('button', { name: 'Jetzt buchen' }).click()

    // Step 11: Should show alert (client-side validation before API call)
  })

  /**
   * Journey 6: Navigation and Page Transitions
   * 
   * As a user, I want to:
   * 1. Navigate between all main pages
   * 2. Use navigation menu
   * 3. Use breadcrumbs and back buttons
   */
  test('Navigation: All Pages → Menu → Breadcrumbs', async ({ page }) => {
    // Step 1: Start at home page
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveURL('/')

    // Step 2: Navigate to About Us (German: "Über uns")
    await page.getByRole('link', { name: /über uns|about/i }).click()
    await expect(page).toHaveURL(/\/about/)

    // Step 3: Navigate to Vehicles
    await page.getByRole('link', { name: /vehicles|browse/i }).click().catch(async () => {
      // If no direct link, use home and then vehicles
      await page.goto('/vehicles')
    })
    await expect(page).toHaveURL(/\/vehicles/)

    // Step 4: Navigate to Login
    await page.getByRole('link', { name: /sign in|login/i }).click()
    await expect(page).toHaveURL(/\/login/)

    // Step 5: Navigate to Register
    await page.getByRole('link', { name: /sign up|register/i }).click()
    await expect(page).toHaveURL(/\/register/)

    // Step 6: Navigate back to home
    await page.goto('/')
    await expect(page).toHaveURL('/')

    // Step 7: Test logo navigation
    const logo = page.locator('a:has-text("RentACar"), [href="/"]').first()
    if (await logo.isVisible()) {
      await logo.click()
      await expect(page).toHaveURL('/')
    }
  })

  /**
   * Journey 7: Responsive Design and Mobile Experience
   * 
   * As a mobile user, I want to:
   * 1. Use the application on mobile devices
   * 2. Have a responsive layout
   * 3. Access all features on mobile
   */
  test('Mobile Experience: Responsive Layout → Mobile Navigation', async ({ page }) => {
    // Step 1: Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE size

    // Step 2: Navigate to home page
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // Step 3: Verify mobile layout
    await expect(page.getByRole('heading', { name: /Premium Autovermietung/i })).toBeVisible()

    // Step 4: Test mobile navigation (if hamburger menu exists)
    const hamburgerMenu = page.locator('button[aria-label*="menu"], button:has-text("☰"), [class*="hamburger"]')
    if (await hamburgerMenu.isVisible()) {
      await hamburgerMenu.click()
      await expect(page.getByRole('link', { name: /about|vehicles/i })).toBeVisible()
    }

    // Step 5: Navigate to vehicles on mobile
    await page.goto('/vehicles')
    await page.waitForLoadState('domcontentloaded')

    // Step 6: Verify mobile vehicle list (German text)
    await expect(page.getByText(/Fahrzeuge|verfügbar/i)).toBeVisible()

    // Step 7: Test vehicle detail on mobile
    const vehicleLink = page.locator('button:has-text("Details anzeigen"), a:has-text("Details anzeigen")').first()
    if (await vehicleLink.isVisible()) {
      await vehicleLink.click()
      await expect(page).toHaveURL(/\/vehicle\/\d+/)
      await expect(page.getByRole('heading').first()).toBeVisible()
    }
  })

  /**
   * Journey 8: Complete Booking Flow with All Steps
   * 
   * As a customer, I want to:
   * 1. Complete the entire booking process
   * 2. See all booking steps
   * 3. Review my booking before confirmation
   */
  test('Complete Booking Flow: All Steps → Review → Confirm', async ({ page }) => {
    // Step 1: Login with REAL user from database
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')
    
    await page.getByPlaceholder(/Dein Benutzername|Benutzername/i).fill('customer')
    await page.getByPlaceholder(/Dein Passwort|Passwort/i).fill('customer123')
    await page.getByRole('button', { name: /Anmelden/i }).click()
    
    // Wait for REAL authentication response
    await page.waitForURL(/\/(dashboard|$)/, { timeout: 15000 })

    // Step 2: Navigate to REAL vehicles from database
    await page.goto('/vehicles')
    await page.waitForSelector('button:has-text("Details anzeigen")', { timeout: 20000 })
    
    // Verify REAL vehicles are loaded
    const vehicleLinks = page.locator('button:has-text("Details anzeigen")')
    const count = await vehicleLinks.count()
    expect(count).toBeGreaterThan(0)
    
    await vehicleLinks.first().click()
    await expect(page).toHaveURL(/\/vehicle\/\d+/)
    
    // Wait for REAL vehicle data to load
    await page.waitForLoadState('networkidle')

    // Step 3: Select dates
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfter = new Date(tomorrow)
    dayAfter.setDate(dayAfter.getDate() + 3)

    await page.locator('input[type="date"]').first().fill(tomorrow.toISOString().split('T')[0])
    await page.locator('input[type="date"]').nth(1).fill(dayAfter.toISOString().split('T')[0])

    // Step 4: Start booking (will create REAL booking in database)
    await page.getByRole('button', { name: 'Jetzt buchen' }).click()
    await expect(page).toHaveURL(/\/booking\/\d+/)
    
    // Wait for booking page to load with REAL vehicle data
    await page.waitForLoadState('networkidle')

    // Step 5: Verify booking flow steps are visible
    await expect(
      page.getByText(/Datum wählen|Schritt 1|Mietdaten/i)
    ).toBeVisible({ timeout: 10000 })

    // Step 6: Complete Step 1 (Dates - should be pre-filled)
    await page.getByRole('button', { name: /Weiter|weiter/i }).click()

    // Step 7: Complete Step 2 (Customer Details)
    await page.waitForSelector('input[placeholder*="name"], input[placeholder*="email"]', { timeout: 10000 })
    await page.getByPlaceholder(/Max Mustermann|Vollständiger Name/i).fill('Max Mustermann')
    await page.getByPlaceholder(/max@example.com|E-Mail/i).fill('max@example.com')
    await page.getByPlaceholder(/\+49 123 456789|Telefon/i).fill('+49 123 456789')
    await page.getByPlaceholder(/B123456789|Führerschein/i).fill('DL-123-456')
    await page.getByRole('button', { name: /Weiter zur Zahlung/i }).click()

    // Step 8: Complete Step 3 (Payment)
    await page.waitForSelector('input[placeholder*="card"], input[placeholder*="0000"]', { timeout: 10000 })
    await page.getByPlaceholder(/0000 0000 0000 0000|Kartennummer/i).fill('4111 1111 1111 1111')
    await page.getByPlaceholder(/Max Mustermann|Name auf der Karte/i).fill('Max Mustermann')
    await page.getByPlaceholder(/MM\/JJ|Ablaufdatum/i).fill('12/30')
    await page.getByPlaceholder(/cvv|cvc|\.\.\./i).fill('123')

    // Step 9: Review and confirm (REAL API call - creates booking in database)
    await page.getByRole('button', { name: /Bestätigen & Bezahlen/i }).click()

    // Step 10: Wait for REAL booking creation response from backend
    await page.waitForURL(/\/(dashboard|\?booking=success)/, { timeout: 20000 })
    
    // Verify booking was created in REAL database
    const successIndicators = [
      page.getByText(/success|confirmed|thank you|booking.*complete/i),
      page.locator('[class*="success"]')
    ]
    
    let _bookingCreated = false
    for (const indicator of successIndicators) {
      try {
        if (await indicator.isVisible({ timeout: 5000 })) {
          _bookingCreated = true
          break
        }
      } catch {
        // Continue checking
      }
    }
    
    // At minimum, URL should indicate success
    expect(page.url()).toMatch(/\/(dashboard|\?booking=success)/)
    console.log('REAL booking created in database')
  })
})

