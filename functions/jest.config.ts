import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  displayName: 'Functions',
  automock: false,
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  setupFiles: ['<rootDir>/__tests__/setupJest.js'],
  coverageDirectory: './coverage/',
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/**/*.ts',
    '!<rootDir>/db/index.ts',
    '!**/*.d.ts',
    '!<rootDir>/*.config.ts',
    '!**/__tests__/**',
  ],
}
export default config
