#!/usr/bin/env node

import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.join(__dirname, '..')

console.log('🚀 Production Performance Test\n')
console.log('='.repeat(60))

try {
  // 1. Build Production
  console.log('\n📦 Schritt 1: Production Build erstellen...')
  execSync('npm run build', { 
    cwd: projectRoot,
    stdio: 'inherit' 
  })

  // 2. Start Preview Server
  console.log('\n🌐 Schritt 2: Preview Server starten...')
  // Note: Preview server should be started manually or via separate process
  // For now, we assume it's already running on port 4173
  
  // Wait for server to start
  console.log('⏳ Warte 5 Sekunden auf Server-Start...')
  await new Promise(resolve => setTimeout(resolve, 5000))

  // 3. Run Lighthouse (on preview server port 4173)
  console.log('\n🔍 Schritt 3: Lighthouse-Test durchführen...')
  execSync(
    'npx lighthouse http://localhost:4173 --quiet --enable-error-reporting=false --chrome-flags="--headless --no-sandbox --disable-gpu" --output=json --output-path=./lighthouse-report-production.json',
    {
      cwd: projectRoot,
      stdio: 'inherit',
    }
  )

  // 4. Visualize
  console.log('\n📊 Schritt 4: Visualisierung erstellen...')
  execSync('npm run lighthouse:visualize', {
    cwd: projectRoot,
    stdio: 'inherit'
  })

  console.log('\n✅ Production Performance Test abgeschlossen!')
  console.log('\n📊 Öffne lighthouse-metrics.html im Browser für Details.')
  console.log('\n💡 Tipp: Vergleiche die Ergebnisse mit dem Development Mode!')

} catch (error) {
  console.error('❌ Fehler:', error.message)
  process.exit(1)
}


import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.join(__dirname, '..')

console.log('🚀 Production Performance Test\n')
console.log('='.repeat(60))

try {
  // 1. Build Production
  console.log('\n📦 Schritt 1: Production Build erstellen...')
  execSync('npm run build', { 
    cwd: projectRoot,
    stdio: 'inherit' 
  })

  // 2. Start Preview Server
  console.log('\n🌐 Schritt 2: Preview Server starten...')
  // Note: Preview server should be started manually or via separate process
  // For now, we assume it's already running on port 4173
  
  // Wait for server to start
  console.log('⏳ Warte 5 Sekunden auf Server-Start...')
  await new Promise(resolve => setTimeout(resolve, 5000))

  // 3. Run Lighthouse (on preview server port 4173)
  console.log('\n🔍 Schritt 3: Lighthouse-Test durchführen...')
  execSync(
    'npx lighthouse http://localhost:4173 --quiet --enable-error-reporting=false --chrome-flags="--headless --no-sandbox --disable-gpu" --output=json --output-path=./lighthouse-report-production.json',
    {
      cwd: projectRoot,
      stdio: 'inherit',
    }
  )

  // 4. Visualize
  console.log('\n📊 Schritt 4: Visualisierung erstellen...')
  execSync('npm run lighthouse:visualize', {
    cwd: projectRoot,
    stdio: 'inherit'
  })

  console.log('\n✅ Production Performance Test abgeschlossen!')
  console.log('\n📊 Öffne lighthouse-metrics.html im Browser für Details.')
  console.log('\n💡 Tipp: Vergleiche die Ergebnisse mit dem Development Mode!')

} catch (error) {
  console.error('❌ Fehler:', error.message)
  process.exit(1)
}

