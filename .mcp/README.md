# MCP Context Files

Dieses Verzeichnis enthält Kontext-Informationen für AI-Assistenten (Model Context Protocol).

## Dateien

- **context.json** - Vollständige strukturierte Projekt-Dokumentation im JSON-Format
- **../.context7** - Vereinfachte Markdown-Version für schnelle Übersicht

## Verwendung

Diese Dateien werden von MCP-kompatiblen AI-Assistenten automatisch gelesen, um besseren Kontext über das Projekt zu erhalten.

### Für Entwickler

Die Dateien dienen auch als Projekt-Dokumentation und sollten bei größeren Änderungen aktualisiert werden:

- Neue Module → `modules` Array erweitern
- Neue APIs → `apis` Arrays aktualisieren
- Architektur-Änderungen → `key_patterns` anpassen
- Neue Einschränkungen → `known_limitations` ergänzen
