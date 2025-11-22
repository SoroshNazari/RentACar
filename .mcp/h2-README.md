# H2 Database MCP Integration

## Aktueller Status

Das Projekt verwendet jetzt **H2 dateibasierte Datenbank** als Standard.

**Vorteile:**
- ✅ Daten bleiben nach Neustart erhalten
- ✅ Keine Docker-Installation erforderlich
- ✅ Datenbankdatei in `./data/rentacar.mv.db`

## H2-Console (Empfohlen)

Die einfachste Methode, um mit der H2-Datenbank zu interagieren:

**URL**: http://localhost:8080/h2-console

**Verbindungsdetails:**
- JDBC URL: `jdbc:h2:file:./data/rentacar`
- Username: `sa`
- Password: (leer lassen)

## MCP-Server für H2

Leider gibt es keinen offiziellen H2 MCP-Server. Alternativen:

### Option 1: H2-Console verwenden (Aktiv)
✅ Bereits konfiguriert und läuft
✅ Web-basierte GUI
✅ SQL-Abfragen direkt ausführen

### Option 2: PostgreSQL MCP-Server (wenn Docker läuft)

Wenn Sie PostgreSQL mit Docker verwenden möchten, ist der MCP-Server bereits konfiguriert in `.mcp-config.json`:

```json
{
    "mcpServers": {
        "postgres-rentacar": {
            "command": "npx",
            "args": [
                "-y",
                "@modelcontextprotocol/server-postgres",
                "postgresql://postgres:password@localhost:5432/rentacar"
            ]
        }
    }
}
```

**Um PostgreSQL zu verwenden:**
1. Docker starten: `docker compose up -d`
2. Anwendung mit PostgreSQL-Profil starten: `mvn spring-boot:run -Dspring-boot.run.profiles=postgres`

## Empfehlung

Für **Entwicklung mit H2**: Verwenden Sie die **H2-Console** (http://localhost:8080/h2-console)
- Daten bleiben erhalten nach Neustart
- Datenbankdatei: `./data/rentacar.mv.db`

Für **Produktion oder MCP-Integration**: Verwenden Sie **PostgreSQL** mit dem konfigurierten MCP-Server.

## Context.json aktualisieren

Die `.mcp/context.json` wurde bereits aktualisiert, um H2 als Standard zu reflektieren:

```json
"database": {
    "default": "H2 (dateibasiert für Entwicklung)",
    "production": "PostgreSQL 16",
    "h2": {
        "url": "jdbc:h2:file:./data/rentacar",
        "console": "http://localhost:8080/h2-console",
        "file": "./data/rentacar.mv.db"
    },
    "postgres": {
        "url": "jdbc:postgresql://localhost:5432/rentacar",
        "mcp_server": "postgres-rentacar"
    }
}
```
