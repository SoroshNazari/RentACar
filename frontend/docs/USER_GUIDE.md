# RentACar - Benutzerhandbuch

**Version:** 1.0.0  
**Datum:** 2025-12-01

---

## 📋 Inhaltsverzeichnis

1. [Erste Schritte](#erste-schritte)
2. [Fahrzeuge suchen und buchen](#fahrzeuge-suchen-und-buchen)
3. [Konto verwalten](#konto-verwalten)
4. [Buchungen verwalten](#buchungen-verwalten)
5. [Mitarbeiter-Funktionen](#mitarbeiter-funktionen)
6. [Häufige Fragen](#häufige-fragen)

---

## 🚀 Erste Schritte

### Registrierung

1. **Zur Registrierungsseite navigieren**
   - Klicke auf "Register" in der Navigation oder gehe zu `/register`

2. **Formular ausfüllen**
   - **Username:** Dein gewünschter Benutzername
   - **Password:** Sicheres Passwort (mindestens 8 Zeichen)
   - **First Name / Last Name:** Dein vollständiger Name
   - **Email:** Deine E-Mail-Adresse
   - **Phone:** Deine Telefonnummer
   - **Address:** Deine Adresse (optional)
   - **Driver License:** Deine Führerscheinnummer

3. **Registrierung abschließen**
   - Klicke auf "Register"
   - Bei Erfolg wirst du automatisch eingeloggt

![Register Page](screenshots/register.png)

---

### Anmeldung

1. **Zur Anmeldeseite navigieren**
   - Klicke auf "Login" in der Navigation oder gehe zu `/login`

2. **Anmeldedaten eingeben**
   - **Username:** Dein Benutzername
   - **Password:** Dein Passwort

3. **Anmelden**
   - Klicke auf "Sign In"
   - Bei Erfolg wirst du zu deinem Dashboard weitergeleitet

![Login Page](screenshots/login.png)

---

## 🚗 Fahrzeuge suchen und buchen

### Fahrzeuge durchsuchen

#### Option 1: Suche auf der Startseite

1. **Startseite öffnen**
   - Gehe zur Homepage (`/`)

2. **Suchkriterien eingeben**
   - **Location:** Abholort (z.B. "Berlin")
   - **Pick-up Date:** Abholdatum
   - **Drop-off Date:** Rückgabedatum
   - **Vehicle Type:** Fahrzeugtyp (optional)

3. **Suche starten**
   - Klicke auf "Search Vehicles"
   - Du wirst zur Fahrzeugliste weitergeleitet

![Homepage Search](screenshots/home.png)

#### Option 2: Direkt zur Fahrzeugliste

1. **Fahrzeugliste öffnen**
   - Klicke auf "Vehicles" in der Navigation oder gehe zu `/vehicles`

2. **Fahrzeuge durchsuchen**
   - Alle verfügbaren Fahrzeuge werden angezeigt
   - Du kannst nach Typ, Marke oder Preis filtern

![Vehicle List](screenshots/vehicles.png)

---

### Fahrzeugdetails anzeigen

1. **Fahrzeug auswählen**
   - Klicke auf ein Fahrzeug in der Liste

2. **Details ansehen**
   - **Bilder:** Bildergalerie durchblättern
   - **Spezifikationen:** Marke, Modell, Typ, Preis
   - **Features:** Ausstattung und Details
   - **Verfügbarkeit:** Status und Standort

3. **Datum auswählen**
   - **Pick-up Date:** Abholdatum
   - **Drop-off Date:** Rückgabedatum
   - Preis wird automatisch berechnet

![Vehicle Detail](screenshots/vehicle-detail.png)

---

### Buchung durchführen

#### Schritt 1: Datum und Zeit auswählen

1. **Auf Fahrzeugdetailseite**
   - Wähle Pick-up und Drop-off Datum
   - Optional: Pick-up und Drop-off Zeit

2. **Weiter zur Buchung**
   - Klicke auf "Book Now"
   - Du wirst zum Buchungsprozess weitergeleitet

![Booking Flow - Dates](screenshots/booking-flow.png)

#### Schritt 2: Kundendaten eingeben

1. **Persönliche Daten**
   - **Full Name:** Vollständiger Name
   - **Email:** E-Mail-Adresse
   - **Phone:** Telefonnummer
   - **Driver License:** Führerscheinnummer
   - **Address:** Adresse (optional)

2. **Rechnungsadresse**
   - **Billing Same as Home:** Wenn aktiviert, wird die Rechnungsadresse gleich der Lieferadresse gesetzt

3. **Weiter zur Zahlung**
   - Klicke auf "Continue to Payment"

![Booking Flow - Customer Details](screenshots/booking-flow.png)

#### Schritt 3: Zahlung und Extras

1. **Extras auswählen**
   - **Insurance:** Versicherung (+10€/Tag)
   - **Additional Driver:** Zusätzlicher Fahrer (+5€/Tag)
   - **Child Seat:** Kindersitz (+3€/Tag)

2. **Zahlungsmethode wählen**
   - **Credit Card:** Kreditkarte
   - **Debit Card:** Debitkarte
   - **PayPal:** PayPal (falls verfügbar)

3. **Zahlungsdetails eingeben**
   - **Card Number:** Kartennummer
   - **Cardholder Name:** Name auf der Karte
   - **Expiry Date:** Ablaufdatum
   - **CVV:** Sicherheitscode

4. **Buchung abschließen**
   - Prüfe die Zusammenfassung
   - Klicke auf "Complete Booking"
   - Bei Erfolg siehst du eine Bestätigung

![Booking Flow - Payment](screenshots/booking-flow.png)

#### Schritt 4: Bestätigung

- **Buchungsnummer:** Wird angezeigt
- **Status:** "PENDING" (wartet auf Bestätigung)
- **Zusammenfassung:** Alle Details der Buchung

![Booking Success](screenshots/booking-success.png)

---

## 👤 Konto verwalten

### Dashboard öffnen

1. **Zum Dashboard navigieren**
   - Klicke auf "Dashboard" in der Navigation (nur wenn eingeloggt)
   - Oder gehe zu `/dashboard`

2. **Übersicht ansehen**
   - **Profil:** Deine Kundendaten
   - **Buchungen:** Alle deine Buchungen
   - **Status:** Aktuelle Buchungsstatus

![Customer Dashboard](screenshots/booking-success.png)

---

### Buchungen anzeigen

1. **Im Dashboard**
   - Alle deine Buchungen werden angezeigt
   - Sortiert nach Datum (neueste zuerst)

2. **Buchungsdetails**
   - **Fahrzeug:** Marke, Modell
   - **Datum:** Pick-up und Drop-off
   - **Status:** PENDING, CONFIRMED, ACTIVE, COMPLETED, CANCELLED
   - **Preis:** Gesamtpreis

---

### Buchung stornieren

1. **Buchung auswählen**
   - Klicke auf eine Buchung im Dashboard

2. **Stornieren**
   - Klicke auf "Cancel Booking"
   - Bestätige die Stornierung
   - Status ändert sich zu "CANCELLED"

**Hinweis:** Stornierungen sind nur möglich, wenn die Buchung noch nicht aktiv ist.

---

## 👔 Mitarbeiter-Funktionen

### Check-out (Abholung)

1. **Zum Check-out navigieren**
   - Gehe zu `/employee` (nur für Mitarbeiter)

2. **Datum auswählen**
   - Wähle das Datum für die Abholungen

3. **Abholungen anzeigen**
   - Alle Buchungen für das gewählte Datum werden angezeigt

4. **Check-out durchführen**
   - Wähle eine Buchung
   - **Mileage:** Kilometerstand eingeben
   - **Notes:** Notizen (optional)
   - Klicke auf "Check-out"
   - Status ändert sich zu "ACTIVE"

![Employee Checkout](screenshots/booking-flow.png)

---

### Check-in (Rückgabe)

1. **Zum Check-in navigieren**
   - Gehe zu `/employee/checkin` (nur für Mitarbeiter)

2. **Datum auswählen**
   - Wähle das Datum für die Rückgaben

3. **Rückgaben anzeigen**
   - Alle Buchungen für das gewählte Datum werden angezeigt

4. **Check-in durchführen**
   - Wähle eine Buchung
   - **Return Mileage:** Rückgabe-Kilometerstand
   - **Damage Present:** Schäden vorhanden?
   - **Damage Notes:** Schadensbeschreibung (falls vorhanden)
   - **Damage Cost:** Schadenskosten (falls vorhanden)
   - Klicke auf "Check-in"
   - Status ändert sich zu "COMPLETED"

![Employee Checkin](screenshots/booking-flow.png)

---

## ❓ Häufige Fragen

### Allgemein

**Q: Wie kann ich ein Konto erstellen?**  
A: Klicke auf "Register" in der Navigation und fülle das Formular aus.

**Q: Was passiert, wenn ich mein Passwort vergesse?**  
A: Kontaktiere bitte den Support. Ein Passwort-Reset-Feature ist in Entwicklung.

**Q: Kann ich mehrere Fahrzeuge gleichzeitig buchen?**  
A: Ja, du kannst mehrere separate Buchungen erstellen.

---

### Buchungen

**Q: Kann ich eine Buchung ändern?**  
A: Aktuell können Buchungen nur storniert werden. Für Änderungen kontaktiere bitte den Support.

**Q: Wie lange im Voraus kann ich buchen?**  
A: Du kannst bis zu 12 Monate im Voraus buchen.

**Q: Was passiert bei Verspätung?**  
A: Kontaktiere bitte den Support oder die Filiale. Zusatzkosten können anfallen.

**Q: Kann ich eine Buchung stornieren?**  
A: Ja, solange die Buchung noch nicht aktiv ist (Status: PENDING oder CONFIRMED).

---

### Zahlung

**Q: Welche Zahlungsmethoden werden akzeptiert?**  
A: Kreditkarte, Debitkarte und PayPal (falls verfügbar).

**Q: Wann wird mein Konto belastet?**  
A: Die Zahlung wird bei Buchungsbestätigung verarbeitet.

**Q: Gibt es eine Kaution?**  
A: Die Kaution wird bei Abholung des Fahrzeugs hinterlegt.

---

### Fahrzeuge

**Q: Wie finde ich ein Fahrzeug in meiner Nähe?**  
A: Verwende die Suche auf der Startseite und wähle deinen Standort.

**Q: Kann ich ein bestimmtes Fahrzeug reservieren?**  
A: Ja, wenn das Fahrzeug verfügbar ist, kannst du es direkt buchen.

**Q: Was ist im Preis enthalten?**  
A: Grundpreis, Steuern und Gebühren. Extras (Versicherung, etc.) sind optional.

---

### Technische Probleme

**Q: Die Seite lädt nicht richtig**  
A: 
- Prüfe deine Internetverbindung
- Lösche Browser-Cache
- Versuche einen anderen Browser
- Kontaktiere den Support

**Q: Ich kann mich nicht anmelden**  
A:
- Prüfe Username und Passwort
- Stelle sicher, dass Caps Lock aus ist
- Versuche die Seite neu zu laden
- Kontaktiere den Support

**Q: Bilder werden nicht angezeigt**  
A:
- Prüfe deine Internetverbindung
- Versuche die Seite neu zu laden
- Kontaktiere den Support

---

## 📞 Support

Bei weiteren Fragen oder Problemen:

- **Email:** support@rentacar.com
- **Telefon:** +49 123 456789
- **Öffnungszeiten:** Mo-Fr 9:00-18:00 Uhr

---

## 🎯 Tipps & Tricks

### Schnellbuchung

1. Verwende die Suche auf der Startseite
2. Wähle direkt ein Fahrzeug aus der Liste
3. Fülle die Buchungsformulare schnell aus
4. Speichere deine Zahlungsdetails (falls verfügbar)

### Beste Preise

- Buche frühzeitig für bessere Preise
- Vermeide Wochenenden und Feiertage
- Nutze Sonderangebote und Rabatte

### Reibungslose Abholung

- Komme pünktlich zur Abholung
- Bring deinen Führerschein mit
- Prüfe das Fahrzeug vor Abfahrt
- Dokumentiere Schäden sofort

---

**Viel Erfolg mit deiner Buchung! 🚗✨**

