import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  displayName: 'DB',
  testTimeout: 10000,
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  globalSetup: '<rootDir>/__tests__/initDatabase.js',
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.d.ts',
    '!<rootDir>/*.config.ts',
    '!**/__tests__/**',
  ],
}
export default config
