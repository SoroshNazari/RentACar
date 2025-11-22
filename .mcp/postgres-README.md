# MCP PostgreSQL Server

Diese Datei konfiguriert den PostgreSQL MCP-Server für das RentACar-Projekt.

## Verwendung

Der MCP-Server ermöglicht AI-Assistenten, direkt mit der PostgreSQL-Datenbank zu interagieren.

### Voraussetzungen

1. Node.js installiert
2. PostgreSQL läuft (via `docker compose up -d`)
3. Datenbank `rentacar` existiert

### Funktionen

Der PostgreSQL MCP-Server bietet:

- **Schema-Informationen**: Tabellen, Spalten, Indizes, Constraints
- **Query-Ausführung**: SELECT, INSERT, UPDATE, DELETE
- **Datenbank-Analyse**: Statistiken, Beziehungen, Performance-Daten

### Sicherheit

⚠️ **Wichtig**: Diese Konfiguration enthält Datenbank-Credentials und sollte:
- Nicht in Git committed werden (bereits in `.gitignore`)
- Nur für lokale Entwicklung verwendet werden
- Für Production durch sichere Credential-Management ersetzt werden

### Konfiguration anpassen

Falls du andere Datenbank-Credentials verwendest, passe die Werte in `.mcp-config.json` an:

```json
{
  "env": {
    "PGHOST": "dein-host",
    "PGPORT": "dein-port",
    "PGDATABASE": "deine-db",
    "PGUSER": "dein-user",
    "PGPASSWORD": "dein-passwort"
  }
}
```

### Testen

Um zu testen, ob der MCP-Server funktioniert:

```bash
npx -y @modelcontextprotocol/server-postgres postgresql://postgres:password@localhost:5432/rentacar
```

Der Server sollte starten und auf MCP-Anfragen warten.
