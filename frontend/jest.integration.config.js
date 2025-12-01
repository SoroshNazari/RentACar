export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/integration'],
  testMatch: ['**/?(*.)+(spec|test).ts'],
}
