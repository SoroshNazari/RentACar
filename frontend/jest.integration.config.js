export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom', // jsdom für React-Komponenten
  roots: ['<rootDir>/tests/integration'],
  testMatch: ['**/?(*.)+(spec|test).ts?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/lib/(.*)$': '<rootDir>/src/services/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@shared/(.*)$': '<rootDir>/../shared/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  // WICHTIG: Keine Mocks für Integration Tests
  // Wir verwenden das echte Backend
  testTimeout: 15000, // Längere Timeouts für echte API-Aufrufe
  // Startet automatisch Backend und Frontend vor den Tests
  globalSetup: '<rootDir>/scripts/jest-integration-setup.mjs',
  globalTeardown: '<rootDir>/scripts/jest-integration-teardown.mjs',
  // jsdom Konfiguration für CORS
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
    resources: 'usable',
    runScripts: 'dangerously',
  },
}

    '^@/lib/(.*)$': '<rootDir>/src/services/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@shared/(.*)$': '<rootDir>/../shared/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  // WICHTIG: Keine Mocks für Integration Tests
  // Wir verwenden das echte Backend
  testTimeout: 15000, // Längere Timeouts für echte API-Aufrufe
  // Startet automatisch Backend und Frontend vor den Tests
  globalSetup: '<rootDir>/scripts/jest-integration-setup.mjs',
  globalTeardown: '<rootDir>/scripts/jest-integration-teardown.mjs',
  // jsdom Konfiguration für CORS
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
    resources: 'usable',
    runScripts: 'dangerously',
  },
}
