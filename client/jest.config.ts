import { Config } from '@jest/types'

const config: Config.InitialOptions = {
  testEnvironment: 'jsdom',
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
    '.*\\.(vue)$': '@vue/vue2-jest',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!typed-vuex/lib)'],
  globals: { 'vue-jest': { transform: { i18n: 'vue-i18n-jest' } } },
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
