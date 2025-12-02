#!/usr/bin/env node

/**
 * Jest Global Teardown für Integration Tests
 * Stoppt Backend und Frontend Server
 */

export default async function globalTeardown() {
  console.log('\n🧹 Räume auf...\n')
  console.log('='.repeat(60))

  if (global.__BACKEND_PROCESS__) {
    try {
      console.log('🛑 Stoppe Backend...')
      process.kill(global.__BACKEND_PROCESS__.pid, 'SIGTERM')
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('✅ Backend gestoppt')
    } catch {
      // Ignoriere Fehler
    }
  }

  if (global.__FRONTEND_PROCESS__) {
    try {
      console.log('🛑 Stoppe Frontend...')
      process.kill(global.__FRONTEND_PROCESS__.pid, 'SIGTERM')
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('✅ Frontend gestoppt')
    } catch {
      // Ignoriere Fehler
    }
  }

  console.log('\n✅ Aufräumen abgeschlossen\n')
}


/**
 * Jest Global Teardown für Integration Tests
 * Stoppt Backend und Frontend Server
 */

export default async function globalTeardown() {
  console.log('\n🧹 Räume auf...\n')
  console.log('='.repeat(60))

  if (global.__BACKEND_PROCESS__) {
    try {
      console.log('🛑 Stoppe Backend...')
      process.kill(global.__BACKEND_PROCESS__.pid, 'SIGTERM')
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('✅ Backend gestoppt')
    } catch {
      // Ignoriere Fehler
    }
  }

  if (global.__FRONTEND_PROCESS__) {
    try {
      console.log('🛑 Stoppe Frontend...')
      process.kill(global.__FRONTEND_PROCESS__.pid, 'SIGTERM')
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('✅ Frontend gestoppt')
    } catch {
      // Ignoriere Fehler
    }
  }

  console.log('\n✅ Aufräumen abgeschlossen\n')
}

