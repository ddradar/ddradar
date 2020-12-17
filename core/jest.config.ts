import { Config } from '@jest/types'

const config: Config.InitialOptions = {
  displayName: 'Core',
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: ['<rootDir>/core/**'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  globalSetup: '<rootDir>/__tests__/initDatabase.js',
  coverageDirectory: './coverage/',
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/*.ts',
    '!**/*.d.ts',
    '!<rootDir>/*.config.ts',
    '!**/__tests__/**',
  ],
}
export default config
