#!/usr/bin/env node

/**
 * Jest Global Setup für Integration Tests
 * Startet Backend und Frontend Server
 */

import { spawn } from 'child_process'
import axios from 'axios'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..', '..')
const frontendRoot = join(__dirname, '..')

const BACKEND_URL = 'http://localhost:8081/api'
const FRONTEND_URL = 'http://localhost:3000'

let backendProcess = null
let frontendProcess = null

async function checkServer(url, maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(url, {
        timeout: 1000,
        validateStatus: () => true,
      })
      if (response.status === 200 || response.status === 401) {
        return true
      }
    } catch {
      // Server noch nicht bereit
    }
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  return false
}

async function waitForServer(url, name, maxRetries = 60) {
  console.log(`⏳ Warte auf ${name}...`)
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(url, {
        timeout: 2000,
        validateStatus: () => true,
      })
      if (response.status === 200 || response.status === 401) {
        console.log(`✅ ${name} ist bereit`)
        return true
      }
    } catch {
      // Server noch nicht bereit
    }
    if (i % 10 === 0 && i > 0) {
      console.log(`⏳ ${name} noch nicht bereit... (${i}/${maxRetries})`)
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  return false
}

export default async function globalSetup() {
  console.log('\n🚀 Starte Server für Integration Tests\n')
  console.log('='.repeat(60))

  // Prüfe ob Backend bereits läuft
  const backendRunning = await checkServer(`${BACKEND_URL}/vehicles`)
  if (!backendRunning) {
    console.log('🚀 Starte Backend...')
    backendProcess = spawn('./gradlew', ['bootRun'], {
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

    const backendReady = await waitForServer(`${BACKEND_URL}/vehicles`, 'Backend', 120)
    if (!backendReady) {
      console.error('❌ Backend konnte nicht gestartet werden')
      if (backendProcess) {
        process.kill(backendProcess.pid, 'SIGTERM')
      }
      throw new Error('Backend konnte nicht gestartet werden')
    }
  } else {
    console.log('✅ Backend läuft bereits')
  }

  // Prüfe ob Frontend bereits läuft
  const frontendRunning = await checkServer(FRONTEND_URL)
  if (!frontendRunning) {
    console.log('🚀 Starte Frontend...')
    frontendProcess = spawn('npm', ['run', 'dev', '--', '--host'], {
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

    const frontendReady = await waitForServer(FRONTEND_URL, 'Frontend', 60)
    if (!frontendReady) {
      console.error('❌ Frontend konnte nicht gestartet werden')
      if (frontendProcess) {
        process.kill(frontendProcess.pid, 'SIGTERM')
      }
      if (backendProcess) {
        process.kill(backendProcess.pid, 'SIGTERM')
      }
      throw new Error('Frontend konnte nicht gestartet werden')
    }
  } else {
    console.log('✅ Frontend läuft bereits')
  }

  console.log('\n✅ Beide Server sind bereit für Integration Tests\n')
  console.log('='.repeat(60))

  // Speichere Prozess-IDs für Teardown
  global.__BACKEND_PROCESS__ = backendProcess
  global.__FRONTEND_PROCESS__ = frontendProcess
}

/**
 * Jest Global Setup für Integration Tests
 * Startet Backend und Frontend Server
 */

import { spawn } from 'child_process'
import axios from 'axios'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..', '..')
const frontendRoot = join(__dirname, '..')

const BACKEND_URL = 'http://localhost:8081/api'
const FRONTEND_URL = 'http://localhost:3000'

let backendProcess = null
let frontendProcess = null

async function checkServer(url, maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(url, {
        timeout: 1000,
        validateStatus: () => true,
      })
      if (response.status === 200 || response.status === 401) {
        return true
      }
    } catch {
      // Server noch nicht bereit
    }
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  return false
}

async function waitForServer(url, name, maxRetries = 60) {
  console.log(`⏳ Warte auf ${name}...`)
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(url, {
        timeout: 2000,
        validateStatus: () => true,
      })
      if (response.status === 200 || response.status === 401) {
        console.log(`✅ ${name} ist bereit`)
        return true
      }
    } catch {
      // Server noch nicht bereit
    }
    if (i % 10 === 0 && i > 0) {
      console.log(`⏳ ${name} noch nicht bereit... (${i}/${maxRetries})`)
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  return false
}

export default async function globalSetup() {
  console.log('\n🚀 Starte Server für Integration Tests\n')
  console.log('='.repeat(60))

  // Prüfe ob Backend bereits läuft
  const backendRunning = await checkServer(`${BACKEND_URL}/vehicles`)
  if (!backendRunning) {
    console.log('🚀 Starte Backend...')
    backendProcess = spawn('./gradlew', ['bootRun'], {
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

    const backendReady = await waitForServer(`${BACKEND_URL}/vehicles`, 'Backend', 120)
    if (!backendReady) {
      console.error('❌ Backend konnte nicht gestartet werden')
      if (backendProcess) {
        process.kill(backendProcess.pid, 'SIGTERM')
      }
      throw new Error('Backend konnte nicht gestartet werden')
    }
  } else {
    console.log('✅ Backend läuft bereits')
  }

  // Prüfe ob Frontend bereits läuft
  const frontendRunning = await checkServer(FRONTEND_URL)
  if (!frontendRunning) {
    console.log('🚀 Starte Frontend...')
    frontendProcess = spawn('npm', ['run', 'dev', '--', '--host'], {
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

    const frontendReady = await waitForServer(FRONTEND_URL, 'Frontend', 60)
    if (!frontendReady) {
      console.error('❌ Frontend konnte nicht gestartet werden')
      if (frontendProcess) {
        process.kill(frontendProcess.pid, 'SIGTERM')
      }
      if (backendProcess) {
        process.kill(backendProcess.pid, 'SIGTERM')
      }
      throw new Error('Frontend konnte nicht gestartet werden')
    }
  } else {
    console.log('✅ Frontend läuft bereits')
  }

  console.log('\n✅ Beide Server sind bereit für Integration Tests\n')
  console.log('='.repeat(60))

  // Speichere Prozess-IDs für Teardown
  global.__BACKEND_PROCESS__ = backendProcess
  global.__FRONTEND_PROCESS__ = frontendProcess
}
