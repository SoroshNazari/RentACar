#!/usr/bin/env node

/**
 * Startet Backend und Frontend für Integration Tests
 * Wartet bis beide Server bereit sind
 */

import { spawn, execSync } from 'child_process'
import axios from 'axios'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..', '..')
const frontendRoot = join(__dirname, '..')

let backendProcess = null
let frontendProcess = null

const BACKEND_URL = 'http://localhost:8081/api'
const FRONTEND_URL = 'http://localhost:3000'

async function waitForBackend(maxRetries = 60) {
  console.log('⏳ Warte auf Backend...')
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(`${BACKEND_URL}/vehicles`, {
        timeout: 2000,
        validateStatus: () => true,
      })
      if (response.status === 200 || response.status === 401) {
        console.log('✅ Backend ist bereit')
        return true
      }
    } catch {
      // Backend noch nicht bereit
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  return false
}

async function waitForFrontend(maxRetries = 30) {
  console.log('⏳ Warte auf Frontend...')
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(FRONTEND_URL, {
        timeout: 2000,
        validateStatus: () => true,
      })
      if (response.status === 200) {
        console.log('✅ Frontend ist bereit')
        return true
      }
    } catch {
      // Frontend noch nicht bereit
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  return false
}

function checkIfBackendRunning() {
  try {
    execSync(`curl -s ${BACKEND_URL}/vehicles -o /dev/null -w "%{http_code}"`, {
      timeout: 2000,
      stdio: 'ignore',
    })
    return true
  } catch {
    return false
  }
}

function checkIfFrontendRunning() {
  try {
    execSync(`curl -s ${FRONTEND_URL} -o /dev/null -w "%{http_code}"`, {
      timeout: 2000,
      stdio: 'ignore',
    })
    return true
  } catch {
    return false
  }
}

async function startBackend() {
  if (checkIfBackendRunning()) {
    console.log('✅ Backend läuft bereits')
    return null
  }

  console.log('🚀 Starte Backend...')
  const backendProcess = spawn('./gradlew', ['bootRun'], {
    cwd: projectRoot,
    stdio: 'pipe',
    detached: false,
  })

  backendProcess.stdout.on('data', (data) => {
    const output = data.toString()
    if (output.includes('Started RentACarApplication') || output.includes('Tomcat started')) {
      console.log('✅ Backend gestartet')
    }
  })

  backendProcess.stderr.on('data', () => {
    // Ignoriere stderr für sauberere Ausgabe
  })

  return backendProcess
}

async function startFrontend() {
  if (checkIfFrontendRunning()) {
    console.log('✅ Frontend läuft bereits')
    return null
  }

  console.log('🚀 Starte Frontend...')
  const frontendProcess = spawn('npm', ['run', 'dev', '--', '--host'], {
    cwd: frontendRoot,
    stdio: 'pipe',
    detached: false,
  })

  frontendProcess.stdout.on('data', (data) => {
    const output = data.toString()
    if (output.includes('Local:') || output.includes('localhost:3000')) {
      console.log('✅ Frontend gestartet')
    }
  })

  frontendProcess.stderr.on('data', () => {
    // Ignoriere stderr für sauberere Ausgabe
  })

  return frontendProcess
}

async function cleanup() {
  console.log('\n🛑 Stoppe Server...')
  
  if (backendProcess) {
    try {
      process.kill(backendProcess.pid, 'SIGTERM')
      console.log('✅ Backend gestoppt')
    } catch {
      // Ignoriere Fehler
    }
  }
  
  if (frontendProcess) {
    try {
      process.kill(frontendProcess.pid, 'SIGTERM')
      console.log('✅ Frontend gestoppt')
    } catch {
      // Ignoriere Fehler
    }
  }
}

// Signal Handler für sauberes Beenden
process.on('SIGINT', async () => {
  await cleanup()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await cleanup()
  process.exit(0)
})

async function main() {
  try {
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

    console.log('\n✅ Beide Server sind bereit für Integration Tests\n')
    
    // Warte auf Prozess-Ende (wird von Jest gestoppt)
    // Oder warte unbegrenzt wenn als standalone Script ausgeführt
    if (process.argv.includes('--wait')) {
      await new Promise(() => {}) // Warte unbegrenzt
    }
  } catch (error) {
    console.error('❌ Fehler beim Starten der Server:', error.message)
    await cleanup()
    process.exit(1)
  }
}

// Exportiere für Verwendung in anderen Scripts
export { startBackend, startFrontend, waitForBackend, waitForFrontend, cleanup }

// Wenn direkt ausgeführt
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}


/**
 * Startet Backend und Frontend für Integration Tests
 * Wartet bis beide Server bereit sind
 */

import { spawn, execSync } from 'child_process'
import axios from 'axios'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..', '..')
const frontendRoot = join(__dirname, '..')

let backendProcess = null
let frontendProcess = null

const BACKEND_URL = 'http://localhost:8081/api'
const FRONTEND_URL = 'http://localhost:3000'

async function waitForBackend(maxRetries = 60) {
  console.log('⏳ Warte auf Backend...')
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(`${BACKEND_URL}/vehicles`, {
        timeout: 2000,
        validateStatus: () => true,
      })
      if (response.status === 200 || response.status === 401) {
        console.log('✅ Backend ist bereit')
        return true
      }
    } catch {
      // Backend noch nicht bereit
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  return false
}

async function waitForFrontend(maxRetries = 30) {
  console.log('⏳ Warte auf Frontend...')
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(FRONTEND_URL, {
        timeout: 2000,
        validateStatus: () => true,
      })
      if (response.status === 200) {
        console.log('✅ Frontend ist bereit')
        return true
      }
    } catch {
      // Frontend noch nicht bereit
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  return false
}

function checkIfBackendRunning() {
  try {
    execSync(`curl -s ${BACKEND_URL}/vehicles -o /dev/null -w "%{http_code}"`, {
      timeout: 2000,
      stdio: 'ignore',
    })
    return true
  } catch {
    return false
  }
}

function checkIfFrontendRunning() {
  try {
    execSync(`curl -s ${FRONTEND_URL} -o /dev/null -w "%{http_code}"`, {
      timeout: 2000,
      stdio: 'ignore',
    })
    return true
  } catch {
    return false
  }
}

async function startBackend() {
  if (checkIfBackendRunning()) {
    console.log('✅ Backend läuft bereits')
    return null
  }

  console.log('🚀 Starte Backend...')
  const backendProcess = spawn('./gradlew', ['bootRun'], {
    cwd: projectRoot,
    stdio: 'pipe',
    detached: false,
  })

  backendProcess.stdout.on('data', (data) => {
    const output = data.toString()
    if (output.includes('Started RentACarApplication') || output.includes('Tomcat started')) {
      console.log('✅ Backend gestartet')
    }
  })

  backendProcess.stderr.on('data', () => {
    // Ignoriere stderr für sauberere Ausgabe
  })

  return backendProcess
}

async function startFrontend() {
  if (checkIfFrontendRunning()) {
    console.log('✅ Frontend läuft bereits')
    return null
  }

  console.log('🚀 Starte Frontend...')
  const frontendProcess = spawn('npm', ['run', 'dev', '--', '--host'], {
    cwd: frontendRoot,
    stdio: 'pipe',
    detached: false,
  })

  frontendProcess.stdout.on('data', (data) => {
    const output = data.toString()
    if (output.includes('Local:') || output.includes('localhost:3000')) {
      console.log('✅ Frontend gestartet')
    }
  })

  frontendProcess.stderr.on('data', () => {
    // Ignoriere stderr für sauberere Ausgabe
  })

  return frontendProcess
}

async function cleanup() {
  console.log('\n🛑 Stoppe Server...')
  
  if (backendProcess) {
    try {
      process.kill(backendProcess.pid, 'SIGTERM')
      console.log('✅ Backend gestoppt')
    } catch {
      // Ignoriere Fehler
    }
  }
  
  if (frontendProcess) {
    try {
      process.kill(frontendProcess.pid, 'SIGTERM')
      console.log('✅ Frontend gestoppt')
    } catch {
      // Ignoriere Fehler
    }
  }
}

// Signal Handler für sauberes Beenden
process.on('SIGINT', async () => {
  await cleanup()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await cleanup()
  process.exit(0)
})

async function main() {
  try {
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

    console.log('\n✅ Beide Server sind bereit für Integration Tests\n')
    
    // Warte auf Prozess-Ende (wird von Jest gestoppt)
    // Oder warte unbegrenzt wenn als standalone Script ausgeführt
    if (process.argv.includes('--wait')) {
      await new Promise(() => {}) // Warte unbegrenzt
    }
  } catch (error) {
    console.error('❌ Fehler beim Starten der Server:', error.message)
    await cleanup()
    process.exit(1)
  }
}

// Exportiere für Verwendung in anderen Scripts
export { startBackend, startFrontend, waitForBackend, waitForFrontend, cleanup }

// Wenn direkt ausgeführt
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

