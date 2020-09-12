/** @type {import('@jest/types/build/Config').InitialOptions} */
module.exports = {
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
    '!**/*.d.ts',
    '!**/__tests__/**',
    '!<rootDir>/core/**',
  ],
}
