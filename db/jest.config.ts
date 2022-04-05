import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  displayName: 'DB',
  maxWorkers: 1,
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
