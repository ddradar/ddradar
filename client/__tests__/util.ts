import { createLocalVue } from '@vue/test-utils'
import Buefy from 'buefy'
import VueI18n from 'vue-i18n'

export function mockMatchMedia() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // Deprecated
      removeListener: jest.fn(), // Deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

export function createVue() {
  const localVue = createLocalVue()
  localVue.use(Buefy)
  localVue.use(VueI18n)
  localVue.mixin({
    methods: {
      localePath: (obj: object) => obj,
      switchLocalePath: (code: string) => code,
    },
  })
  return localVue
}

export function createI18n(locale: string = 'ja') {
  const i18n = new VueI18n({ locale, silentFallbackWarn: true })
  // @ts-ignore
  i18n.locales = [
    { code: 'en', iso: 'en-US', flag: 'us', name: 'English' },
    { code: 'ja', iso: 'ja-JP', flag: 'jp', name: '日本語' },
  ]
  return i18n
}
