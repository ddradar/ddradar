/** @type {import('@jest/types/build/Config').InitialOptions} */
module.exports = {
  displayName: 'Core',
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  coverageDirectory: './coverage/',
  collectCoverage: true,
  collectCoverageFrom: ['**/*.ts', '!**/*.d.ts', '!**/__tests__/**'],
}
