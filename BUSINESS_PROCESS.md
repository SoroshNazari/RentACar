# Geschäftsprozesse für RentACar

Dieses Dokument beschreibt die zentralen Geschäftsprozesse des RentACar-Systems. Der Fokus liegt auf dem Kernprozess der Fahrzeugvermietung, von der Buchung bis zur Rückgabe und Abrechnung.

---

## Kernprozess: Fahrzeuganmietung (End-to-End)

Dieser Prozess beschreibt den Ablauf einer typischen Fahrzeugmiete. Er involviert den Kunden (**Customer**), den Mitarbeiter (**Employee**) und das System (**RentACar System**).

### Ablaufbeschreibung

1.  **Buchungsanfrage**: Der Kunde sucht ein Fahrzeug und fragt eine Buchung für einen bestimmten Zeitraum an.
2.  **Verfügbarkeitsprüfung**: Das System prüft, ob das Fahrzeug verfügbar ist.
3.  **Reservierung**: Bei Verfügbarkeit wird eine Buchung mit Status `PENDING` oder `CONFIRMED` erstellt.
4.  **Fahrzeugabholung (Check-out)**:
    *   Der Kunde erscheint zur Abholung.
    *   Der Mitarbeiter prüft Führerschein und Identität.
    *   Ein Mietvertrag (**Rental**) wird erstellt (Start-Kilometerstand, Zeit).
    *   Fahrzeugübergabe an den Kunden.
5.  **Nutzungsphase**: Der Kunde nutzt das Fahrzeug.
6.  **Fahrzeugrückgabe (Check-in)**:
    *   Der Kunde bringt das Fahrzeug zurück.
    *   Der Mitarbeiter prüft auf Schäden und erfasst den End-Kilometerstand.
    *   Der Mietvorgang wird abgeschlossen.
7.  **Abrechnung**: Das System berechnet den Endpreis (basierend auf Zeit, Kilometern, Schäden).
8.  **Zahlung**: Der Kunde tätigt die Zahlung, und der Vorgang wird geschlossen.

---

## Mermaid-Diagramm: Sequenzdiagramm

Dieses Diagramm visualisiert die Interaktionen zwischen den Beteiligten über die Zeit.

```mermaid
sequenceDiagram
    autonumber
    actor C as Kunde (Customer)
    participant S as RentACar System
    actor E as Mitarbeiter (Employee)

    Note over C, S: Phase 1: Buchung (Booking)
    C->>S: Sucht verfügbares Fahrzeug (Zeitraum, Typ)
    S-->>C: Zeigt verfügbare Fahrzeuge
    C->>S: Erstellt Buchungsanfrage (Booking Request)
    S->>S: Prüft Verfügbarkeit & Kreditwürdigkeit
    alt Verfügbar
        S-->>C: Buchungsbestätigung (Status: CONFIRMED)
        S-->>E: Benachrichtigung über neue Buchung
    else Nicht Verfügbar
        S-->>C: Ablehnung / Alternativvorschlag
    end

    Note over C, E: Phase 2: Abholung (Rental Start)
    C->>E: Erscheint zur Abholung (zeigt Führerschein)
    E->>S: Ruft Buchung ab
    E->>E: Überprüft Dokumente & Führerschein
    E->>S: Erstellt Mietvertrag (Rental)
    S->>S: Setzt Status auf IN_PROGRESS
    E->>C: Übergibt Fahrzeugschlüssel

    Note over C, S: Phase 3: Nutzung
    C->>C: Nutzt das Fahrzeug

    Note over C, E: Phase 4: Rückgabe (Rental End)
    C->>E: Bringt Fahrzeug zurück
    E->>E: Inspektion (Schäden, Tank, Sauberkeit)
    E->>S: Erfasst Rückgabedaten (End-KM, Zeit)
    S->>S: Berechnet Endpreis (Total Price)
    S->>C: Sendet Rechnung / Zahlungsaufforderung

    Note over C, S: Phase 5: Zahlung
    C->>S: Führt Zahlung durch (Payment)
    S->>S: Verbuchung Zahlungseingang
    S->>S: Setzt Rental Status auf PAID / CLOSED
```

---

## Mermaid-Diagramm: Zustandsdiagramm (State Diagram)

Dieses Diagramm zeigt die Zustände, die eine Buchung bzw. ein Mietvorgang durchlaufen kann.

```mermaid
stateDiagram-v2
    [*] --> BOOKING_PENDING: Kunde fragt an

    state "Buchungsphase" as BookingPhase {
        BOOKING_PENDING --> BOOKING_CONFIRMED: Bestätigt
        BOOKING_PENDING --> BOOKING_CANCELED: Storniert/Abgelehnt
        BOOKING_CONFIRMED --> BOOKING_CANCELED: Storniert
    }

    BOOKING_CONFIRMED --> RENTAL_ACTIVE: Fahrzeug abgeholt (Mietvertrag erstellt)

    state "Mietphase" as RentalPhase {
        RENTAL_ACTIVE --> RENTAL_OVERDUE: Rückgabezeit überschritten
        RENTAL_ACTIVE --> RENTAL_RETURNED: Fahrzeug zurückgegeben
        RENTAL_OVERDUE --> RENTAL_RETURNED: Verspätet zurückgegeben
    }

    RENTAL_RETURNED --> PAYMENT_PENDING: Endabrechnung erstellt
    PAYMENT_PENDING --> COMPLETED: Zahlung erfolgreich
    
    COMPLETED --> [*]
    BOOKING_CANCELED --> [*]
```
