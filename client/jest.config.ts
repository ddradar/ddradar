import { Config } from '@jest/types'

const config: Config.InitialOptions = {
  displayName: 'Client',
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/$1',
    '^vue$': 'vue/dist/vue.common.js',
  },
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'vue', 'json'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.js$': 'babel-jest',
    '.*\\.(vue)$': 'vue-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!typed-vuex/lib)'],
  globals: { 'vue-jest': { transform: { i18n: './__tests__/i18n.js' } } },
  setupFiles: ['jest-canvas-mock'],
  snapshotSerializers: ['jest-serializer-vue'],
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.ts',
    '<rootDir>/components/**/*.vue',
    '<rootDir>/layouts/**/*.vue',
    '<rootDir>/pages/**/*.vue',
    '!<rootDir>/*.config.ts',
    '!**/*.d.ts',
    '!<rootDir>/layouts/empty.vue',
    '!**/node_modules/**',
    '!**/__tests__/**',
  ],
}
export default config
