import { Config } from '@jest/types'

const config: Config.InitialOptions = {
  displayName: 'API',
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: ['<rootDir>/core/*'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  coverageDirectory: './coverage/',
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/**/*.ts',
    '!**/*.d.ts',
    '!<rootDir>/*.config.ts',
    '!**/__tests__/**',
    '!<rootDir>/core/**',
  ],
}
export default config
