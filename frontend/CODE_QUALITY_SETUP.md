# ESLint + Prettier Setup - Quick Start

## ✅ Was wurde konfiguriert:

### 1. ESLint (`eslint.config.js`)
- ✅ TypeScript Support
- ✅ React & React Hooks Rules
- ✅ Prettier Integration (keine Konflikte)
- ✅ Code Quality Rules
- ✅ Separate Rules für Tests/Scripts/E2E

### 2. Prettier (`.prettierrc`)
- ✅ Konsistente Formatierung
- ✅ Single Quotes, No Semicolons
- ✅ 2 Spaces, 100 Zeichen Breite

### 3. EditorConfig (`.editorconfig`)
- ✅ Konsistente Editor-Einstellungen

### 4. VS Code Settings (`.vscode/settings.json`)
- ✅ Format on Save
- ✅ ESLint Auto-Fix on Save

---

## 🚀 Verwendung

### Basis-Commands:

```bash
# Code formatieren
npm run format

# Lint prüfen
npm run lint

# Lint automatisch fixen
npm run lint:fix

# Alles prüfen (Lint + Format + TypeCheck)
npm run quality

# Alles prüfen + automatisch fixen
npm run quality:fix
```

---

## 📝 Workflow

### Vor jedem Commit:

```bash
npm run quality:fix
```

Dies führt aus:
1. ESLint Fixes
2. Prettier Formatierung
3. TypeScript Type Check

### In VS Code:

- **Format on Save**: Automatisch aktiviert
- **ESLint Auto-Fix**: Automatisch aktiviert
- **Prettier**: Als Standard-Formatter

---

## ⚙️ Konfiguration

### ESLint Warnings

Aktuell sind **34 Warnings** erlaubt (max-warnings: 50).

Häufige Warnings:
- `@typescript-eslint/no-non-null-assertion` - Non-null assertions (z.B. `!`)
- `react-hooks/exhaustive-deps` - Fehlende Dependencies in useEffect
- `no-console` - console.log Statements

**Tipp:** Diese können schrittweise behoben werden, sind aber nicht kritisch.

### Prettier

Alle Dateien sollten Prettier-konform sein. Nutze `npm run format` um automatisch zu formatieren.

---

## 🔧 Troubleshooting

### Problem: ESLint findet Dateien nicht

**Lösung:** Prüfe `eslint.config.js` - `ignores` Array sollte die richtigen Patterns enthalten.

### Problem: Prettier und ESLint Konflikte

**Lösung:** `eslint-config-prettier` ist konfiguriert. Stelle sicher, dass es als letzte Config steht.

### Problem: VS Code formatiert nicht automatisch

**Lösung:** 
1. Installiere "Prettier - Code formatter" Extension
2. Installiere "ESLint" Extension
3. Prüfe `.vscode/settings.json`

---

## 📊 Status

- ✅ ESLint: Konfiguriert
- ✅ Prettier: Konfiguriert
- ✅ EditorConfig: Konfiguriert
- ✅ VS Code Settings: Konfiguriert
- ✅ NPM Scripts: Konfiguriert

**Bereit für Code Quality Checks!**

