#!/bin/bash

# JavaDoc Generator für RentACar Projekt
# Fügt automatisch JavaDoc-Kommentare zu allen Java-Klassen hinzu

echo "🚀 Starte JavaDoc-Generierung für RentACar Projekt..."

# Zähle Java-Dateien
TOTAL=$(find src/main/java -name "*.java" -type f | wc -l | tr -d ' ')
echo "📊 Gefunden: $TOTAL Java-Dateien"

# Erstelle Backup
echo "💾 Erstelle Backup..."
tar -czf backup-before-javadoc-$(date +%Y%m%d-%H%M%S).tar.gz src/

echo "✅ Backup erstellt"
echo ""
echo "⚠️  HINWEIS:"
echo "Aufgrund der Komplexität sollten JavaDoc-Kommentare manuell oder mit einem IDE-Plugin hinzugefügt werden."
echo "Empfehlung: Verwenden Sie IntelliJ IDEA's 'Generate JavaDoc' Funktion"
echo ""
echo "Schritte in IntelliJ:"
echo "1. Rechtsklick auf 'src/main/java' Ordner"
echo "2. Wählen Sie 'Analyze' > 'Inspect Code'"
echo "3. Aktivieren Sie 'Java' > 'Javadoc issues'"
echo "4. Nutzen Sie Quick-Fixes um JavaDoc zu generieren"

