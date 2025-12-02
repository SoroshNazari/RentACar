#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('📦 Analysiere Bundle-Größe...\n')

try {
  // Build das Projekt
  console.log('🔨 Baue Projekt...')
  execSync('npm run build', { 
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit' 
  })

  // Analysiere dist Ordner
  const distPath = path.join(__dirname, '..', 'dist')
  const assetsPath = path.join(distPath, 'assets')

  if (!fs.existsSync(assetsPath)) {
    console.error('❌ Assets-Ordner nicht gefunden. Build fehlgeschlagen?')
    process.exit(1)
  }

  console.log('\n📊 Bundle-Analyse:\n')
  console.log('='.repeat(60))

  // Analysiere JavaScript-Dateien
  const jsFiles = fs.readdirSync(assetsPath)
    .filter(file => file.endsWith('.js'))
    .map(file => {
      const filePath = path.join(assetsPath, file)
      const stats = fs.statSync(filePath)
      return {
        name: file,
        size: stats.size,
        sizeKB: (stats.size / 1024).toFixed(2),
        sizeMB: (stats.size / (1024 * 1024)).toFixed(2)
      }
    })
    .sort((a, b) => b.size - a.size)

  console.log('\n📜 JavaScript Bundles:')
  jsFiles.forEach(file => {
    const size = file.sizeMB > 0.1 
      ? `${file.sizeMB} MB` 
      : `${file.sizeKB} KB`
    console.log(`  ${file.name.padEnd(50)} ${size.padStart(10)}`)
  })

  const totalJS = jsFiles.reduce((sum, file) => sum + file.size, 0)
  console.log(`\n  Total JS: ${(totalJS / (1024 * 1024)).toFixed(2)} MB`)

  // Analysiere CSS-Dateien
  const cssFiles = fs.readdirSync(assetsPath)
    .filter(file => file.endsWith('.css'))
    .map(file => {
      const filePath = path.join(assetsPath, file)
      const stats = fs.statSync(filePath)
      return {
        name: file,
        size: stats.size,
        sizeKB: (stats.size / 1024).toFixed(2)
      }
    })

  if (cssFiles.length > 0) {
    console.log('\n🎨 CSS Bundles:')
    cssFiles.forEach(file => {
      console.log(`  ${file.name.padEnd(50)} ${file.sizeKB.padStart(10)} KB`)
    })
    const totalCSS = cssFiles.reduce((sum, file) => sum + file.size, 0)
    console.log(`\n  Total CSS: ${(totalCSS / 1024).toFixed(2)} KB`)
  }

  // Analysiere andere Assets
  const otherFiles = fs.readdirSync(assetsPath)
    .filter(file => !file.endsWith('.js') && !file.endsWith('.css'))
    .map(file => {
      const filePath = path.join(assetsPath, file)
      const stats = fs.statSync(filePath)
      return {
        name: file,
        size: stats.size,
        sizeKB: (stats.size / 1024).toFixed(2)
      }
    })

  if (otherFiles.length > 0) {
    console.log('\n📦 Andere Assets:')
    otherFiles.forEach(file => {
      console.log(`  ${file.name.padEnd(50)} ${file.sizeKB.padStart(10)} KB`)
    })
  }

  // Empfehlungen
  console.log('\n' + '='.repeat(60))
  console.log('\n💡 Empfehlungen:')

  const largeFiles = jsFiles.filter(f => f.size > 500 * 1024) // > 500KB
  if (largeFiles.length > 0) {
    console.log('\n⚠️  Große Bundles (>500KB):')
    largeFiles.forEach(file => {
      console.log(`  - ${file.name}: ${file.sizeKB} KB`)
      console.log(`    → Prüfe auf Code-Splitting oder Tree-Shaking`)
    })
  }

  if (totalJS > 2 * 1024 * 1024) { // > 2MB
    console.log('\n⚠️  Total JS Bundle ist sehr groß (>2MB)')
    console.log('   → Erwäge weitere Code-Splitting-Strategien')
    console.log('   → Prüfe auf ungenutzte Dependencies')
  }

  console.log('\n✅ Bundle-Analyse abgeschlossen!')
  console.log('\n💡 Tipp: Nutze "npm run build" und öffne dist/index.html im Browser')
  console.log('   für eine detaillierte Analyse mit Chrome DevTools.')

} catch (error) {
  console.error('❌ Fehler bei Bundle-Analyse:', error.message)
  process.exit(1)
}


import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('📦 Analysiere Bundle-Größe...\n')

try {
  // Build das Projekt
  console.log('🔨 Baue Projekt...')
  execSync('npm run build', { 
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit' 
  })

  // Analysiere dist Ordner
  const distPath = path.join(__dirname, '..', 'dist')
  const assetsPath = path.join(distPath, 'assets')

  if (!fs.existsSync(assetsPath)) {
    console.error('❌ Assets-Ordner nicht gefunden. Build fehlgeschlagen?')
    process.exit(1)
  }

  console.log('\n📊 Bundle-Analyse:\n')
  console.log('='.repeat(60))

  // Analysiere JavaScript-Dateien
  const jsFiles = fs.readdirSync(assetsPath)
    .filter(file => file.endsWith('.js'))
    .map(file => {
      const filePath = path.join(assetsPath, file)
      const stats = fs.statSync(filePath)
      return {
        name: file,
        size: stats.size,
        sizeKB: (stats.size / 1024).toFixed(2),
        sizeMB: (stats.size / (1024 * 1024)).toFixed(2)
      }
    })
    .sort((a, b) => b.size - a.size)

  console.log('\n📜 JavaScript Bundles:')
  jsFiles.forEach(file => {
    const size = file.sizeMB > 0.1 
      ? `${file.sizeMB} MB` 
      : `${file.sizeKB} KB`
    console.log(`  ${file.name.padEnd(50)} ${size.padStart(10)}`)
  })

  const totalJS = jsFiles.reduce((sum, file) => sum + file.size, 0)
  console.log(`\n  Total JS: ${(totalJS / (1024 * 1024)).toFixed(2)} MB`)

  // Analysiere CSS-Dateien
  const cssFiles = fs.readdirSync(assetsPath)
    .filter(file => file.endsWith('.css'))
    .map(file => {
      const filePath = path.join(assetsPath, file)
      const stats = fs.statSync(filePath)
      return {
        name: file,
        size: stats.size,
        sizeKB: (stats.size / 1024).toFixed(2)
      }
    })

  if (cssFiles.length > 0) {
    console.log('\n🎨 CSS Bundles:')
    cssFiles.forEach(file => {
      console.log(`  ${file.name.padEnd(50)} ${file.sizeKB.padStart(10)} KB`)
    })
    const totalCSS = cssFiles.reduce((sum, file) => sum + file.size, 0)
    console.log(`\n  Total CSS: ${(totalCSS / 1024).toFixed(2)} KB`)
  }

  // Analysiere andere Assets
  const otherFiles = fs.readdirSync(assetsPath)
    .filter(file => !file.endsWith('.js') && !file.endsWith('.css'))
    .map(file => {
      const filePath = path.join(assetsPath, file)
      const stats = fs.statSync(filePath)
      return {
        name: file,
        size: stats.size,
        sizeKB: (stats.size / 1024).toFixed(2)
      }
    })

  if (otherFiles.length > 0) {
    console.log('\n📦 Andere Assets:')
    otherFiles.forEach(file => {
      console.log(`  ${file.name.padEnd(50)} ${file.sizeKB.padStart(10)} KB`)
    })
  }

  // Empfehlungen
  console.log('\n' + '='.repeat(60))
  console.log('\n💡 Empfehlungen:')

  const largeFiles = jsFiles.filter(f => f.size > 500 * 1024) // > 500KB
  if (largeFiles.length > 0) {
    console.log('\n⚠️  Große Bundles (>500KB):')
    largeFiles.forEach(file => {
      console.log(`  - ${file.name}: ${file.sizeKB} KB`)
      console.log(`    → Prüfe auf Code-Splitting oder Tree-Shaking`)
    })
  }

  if (totalJS > 2 * 1024 * 1024) { // > 2MB
    console.log('\n⚠️  Total JS Bundle ist sehr groß (>2MB)')
    console.log('   → Erwäge weitere Code-Splitting-Strategien')
    console.log('   → Prüfe auf ungenutzte Dependencies')
  }

  console.log('\n✅ Bundle-Analyse abgeschlossen!')
  console.log('\n💡 Tipp: Nutze "npm run build" und öffne dist/index.html im Browser')
  console.log('   für eine detaillierte Analyse mit Chrome DevTools.')

} catch (error) {
  console.error('❌ Fehler bei Bundle-Analyse:', error.message)
  process.exit(1)
}

