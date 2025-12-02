#!/usr/bin/env node
/**
 * Script to find and list all English text strings in the frontend
 * This helps identify what needs to be translated
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const pagesDir = path.join(__dirname, '../src/pages')

const commonEnglishPhrases = [
  'Please',
  'Select',
  'Continue',
  'Complete',
  'Cancel',
  'Confirm',
  'Details',
  'Payment',
  'Date',
  'Time',
  'Location',
  'Vehicle',
  'Customer',
  'Employee',
  'Check',
  'Profile',
  'Dashboard',
  'About',
  'Sign',
  'Log',
  'Register',
  'Create',
  'Account',
  'Book',
  'Search',
  'Loading',
  'Error',
  'Success',
  'Welcome',
  'Back',
  'to',
  'Vehicles',
  'not',
  'found',
  'available',
  'moment',
  'check',
  'back',
  'later',
  'contact',
  'support',
  'problem',
  'persists',
  'Total',
  'Price',
  'per day',
  'Rental',
  'Days',
  'Taxes',
  'Fees',
]

function findEnglishText(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const found = []

  lines.forEach((line, index) => {
    // Look for strings in JSX
    const stringMatches = line.match(/['"`]([^'"`]{10,})['"`]/g)
    if (stringMatches) {
      stringMatches.forEach(match => {
        const text = match.slice(1, -1) // Remove quotes
        // Check if it contains English words
        if (
          commonEnglishPhrases.some(phrase =>
            text.toLowerCase().includes(phrase.toLowerCase())
          ) &&
          !text.includes('className') &&
          !text.includes('htmlFor') &&
          !text.includes('aria-') &&
          !text.includes('http') &&
          !text.includes('api') &&
          !text.includes('id=')
        ) {
          found.push({
            line: index + 1,
            text: text.substring(0, 100), // Limit length
            fullLine: line.trim(),
          })
        }
      })
    }
  })

  return found
}

function scanDirectory(dir) {
  const files = fs.readdirSync(dir)
  const results = {}

  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      Object.assign(results, scanDirectory(filePath))
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const found = findEnglishText(filePath)
      if (found.length > 0) {
        results[filePath] = found
      }
    }
  })

  return results
}

console.log('🔍 Scanning for English text...\n')
const results = scanDirectory(pagesDir)

let total = 0
Object.entries(results).forEach(([file, found]) => {
  console.log(`\n📄 ${path.relative(pagesDir, file)}`)
  found.forEach(({ line, text }) => {
    console.log(`   Line ${line}: "${text}"`)
    total++
  })
})

console.log(`\n✅ Found ${total} potential English strings to translate`)
console.log('\n💡 Tip: Review these and translate them to German')

/**
 * Script to find and list all English text strings in the frontend
 * This helps identify what needs to be translated
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const pagesDir = path.join(__dirname, '../src/pages')

const commonEnglishPhrases = [
  'Please',
  'Select',
  'Continue',
  'Complete',
  'Cancel',
  'Confirm',
  'Details',
  'Payment',
  'Date',
  'Time',
  'Location',
  'Vehicle',
  'Customer',
  'Employee',
  'Check',
  'Profile',
  'Dashboard',
  'About',
  'Sign',
  'Log',
  'Register',
  'Create',
  'Account',
  'Book',
  'Search',
  'Loading',
  'Error',
  'Success',
  'Welcome',
  'Back',
  'to',
  'Vehicles',
  'not',
  'found',
  'available',
  'moment',
  'check',
  'back',
  'later',
  'contact',
  'support',
  'problem',
  'persists',
  'Total',
  'Price',
  'per day',
  'Rental',
  'Days',
  'Taxes',
  'Fees',
]

function findEnglishText(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const found = []

  lines.forEach((line, index) => {
    // Look for strings in JSX
    const stringMatches = line.match(/['"`]([^'"`]{10,})['"`]/g)
    if (stringMatches) {
      stringMatches.forEach(match => {
        const text = match.slice(1, -1) // Remove quotes
        // Check if it contains English words
        if (
          commonEnglishPhrases.some(phrase =>
            text.toLowerCase().includes(phrase.toLowerCase())
          ) &&
          !text.includes('className') &&
          !text.includes('htmlFor') &&
          !text.includes('aria-') &&
          !text.includes('http') &&
          !text.includes('api') &&
          !text.includes('id=')
        ) {
          found.push({
            line: index + 1,
            text: text.substring(0, 100), // Limit length
            fullLine: line.trim(),
          })
        }
      })
    }
  })

  return found
}

function scanDirectory(dir) {
  const files = fs.readdirSync(dir)
  const results = {}

  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      Object.assign(results, scanDirectory(filePath))
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const found = findEnglishText(filePath)
      if (found.length > 0) {
        results[filePath] = found
      }
    }
  })

  return results
}

console.log('🔍 Scanning for English text...\n')
const results = scanDirectory(pagesDir)

let total = 0
Object.entries(results).forEach(([file, found]) => {
  console.log(`\n📄 ${path.relative(pagesDir, file)}`)
  found.forEach(({ line, text }) => {
    console.log(`   Line ${line}: "${text}"`)
    total++
  })
})

console.log(`\n✅ Found ${total} potential English strings to translate`)
console.log('\n💡 Tip: Review these and translate them to German')

