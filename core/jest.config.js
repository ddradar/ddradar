/** @type {import('@jest/types/build/Config').InitialOptions} */
module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  coverageDirectory: './coverage/',
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/**/*.ts', '!**/*.d.ts'],
}
