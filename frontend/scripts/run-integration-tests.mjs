#!/usr/bin/env node

/**
 * Startet Backend und Frontend, führt Integration Tests aus, stoppt Server
 */

import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { startBackend, startFrontend, waitForBackend, waitForFrontend, cleanup } from './start-servers-for-integration.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const frontendRoot = join(__dirname, '..')

let backendProcess = null
let frontendProcess = null

async function main() {
  try {
    console.log('🚀 Starte Backend und Frontend für Integration Tests\n')
    console.log('='.repeat(60))

    // Starte Backend
    backendProcess = await startBackend()
    if (backendProcess) {
      const backendReady = await waitForBackend()
      if (!backendReady) {
        console.error('❌ Backend konnte nicht gestartet werden')
        await cleanup()
        process.exit(1)
      }
    }

    // Starte Frontend
    frontendProcess = await startFrontend()
    if (frontendProcess) {
      const frontendReady = await waitForFrontend()
      if (!frontendReady) {
        console.error('❌ Frontend konnte nicht gestartet werden')
        await cleanup()
        process.exit(1)
      }
    }

    console.log('\n✅ Beide Server sind bereit')
    console.log('🧪 Führe Integration Tests aus...\n')
    console.log('='.repeat(60))

    // Führe Jest Integration Tests aus
    const jestProcess = spawn('npm', ['run', 'test:integration'], {
      cwd: frontendRoot,
      stdio: 'inherit',
      shell: true,
    })

    // Warte auf Test-Ende
    const exitCode = await new Promise((resolve) => {
      jestProcess.on('exit', (code) => {
        resolve(code || 0)
      })
    })

    console.log('\n' + '='.repeat(60))
    console.log('🧹 Räume auf...\n')

    // Stoppe Server
    await cleanup()

    // Exit mit Jest Exit-Code
    process.exit(exitCode)
  } catch (error) {
    console.error('❌ Fehler:', error.message)
    await cleanup()
    process.exit(1)
  }
}

main()


/**
 * Startet Backend und Frontend, führt Integration Tests aus, stoppt Server
 */

import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { startBackend, startFrontend, waitForBackend, waitForFrontend, cleanup } from './start-servers-for-integration.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const frontendRoot = join(__dirname, '..')

let backendProcess = null
let frontendProcess = null

async function main() {
  try {
    console.log('🚀 Starte Backend und Frontend für Integration Tests\n')
    console.log('='.repeat(60))

    // Starte Backend
    backendProcess = await startBackend()
    if (backendProcess) {
      const backendReady = await waitForBackend()
      if (!backendReady) {
        console.error('❌ Backend konnte nicht gestartet werden')
        await cleanup()
        process.exit(1)
      }
    }

    // Starte Frontend
    frontendProcess = await startFrontend()
    if (frontendProcess) {
      const frontendReady = await waitForFrontend()
      if (!frontendReady) {
        console.error('❌ Frontend konnte nicht gestartet werden')
        await cleanup()
        process.exit(1)
      }
    }

    console.log('\n✅ Beide Server sind bereit')
    console.log('🧪 Führe Integration Tests aus...\n')
    console.log('='.repeat(60))

    // Führe Jest Integration Tests aus
    const jestProcess = spawn('npm', ['run', 'test:integration'], {
      cwd: frontendRoot,
      stdio: 'inherit',
      shell: true,
    })

    // Warte auf Test-Ende
    const exitCode = await new Promise((resolve) => {
      jestProcess.on('exit', (code) => {
        resolve(code || 0)
      })
    })

    console.log('\n' + '='.repeat(60))
    console.log('🧹 Räume auf...\n')

    // Stoppe Server
    await cleanup()

    // Exit mit Jest Exit-Code
    process.exit(exitCode)
  } catch (error) {
    console.error('❌ Fehler:', error.message)
    await cleanup()
    process.exit(1)
  }
}

main()

