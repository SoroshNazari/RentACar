#!/bin/bash

# Test-Skript für RentACar Anwendung

set -e

echo "🧪 Starte Test-Suite für RentACar Anwendung..."

# Backend Tests
echo "🔍 Führe Backend Tests aus..."
cd backend
./gradlew test jacocoTestReport
cd ..

# Frontend Tests
echo "🔍 Führe Frontend Tests aus..."
cd frontend
npm run test:coverage
cd ..

echo "✅ Alle Tests erfolgreich durchgeführt!"
echo "📊 Test-Abdeckung:"
echo "- Backend: backend/build/reports/jacoco/test/html/index.html"
echo "- Frontend: frontend/coverage/lcov-report/index.html"