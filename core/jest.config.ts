import { Config } from '@jest/types'

const config: Config.InitialOptions = {
  displayName: 'Core',
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.d.ts',
    '!<rootDir>/*.config.ts',
    '!**/__tests__/**',
  ],
}
export default config
