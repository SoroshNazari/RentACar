#!/bin/bash

# Deployment-Skript für RentACar Anwendung

set -e

echo "🚀 Starte Deployment für RentACar Anwendung..."

# Umgebung prüfen
ENV=${1:-development}
echo "📍 Deployment-Umgebung: $ENV"

# Docker Images bauen
echo "🐳 Erstelle Docker Images..."
docker-compose -f docker/docker-compose.yml build

# Anwendung starten
echo "▶️ Starte Anwendung..."
docker-compose -f docker/docker-compose.yml up -d

# Health Check
echo "🏥 Führe Health Check aus..."
sleep 10
curl -f http://localhost:8080/actuator/health || echo "⚠️ Backend Health Check fehlgeschlagen"
curl -f http://localhost:3000 || echo "⚠️ Frontend Health Check fehlgeschlagen"

echo "✅ Deployment abgeschlossen!"
echo "🌐 Anwendung verfügbar unter:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8080"
echo "- API Docs: http://localhost:8080/swagger-ui.html"