/** @type {import('@jest/types/build/Config').InitialOptions} */
module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  transformIgnorePatterns: ['/node_modules/^(@ddradar)'],
  globalSetup: '<rootDir>/__tests__/initDatabase.js',
  coverageDirectory: './coverage/',
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/**/*.ts',
    '!**/__tests__/**',
    '!<rootDir>/core/**',
  ],
}
