import type { LocaleObject } from '@nuxtjs/i18n'
import { readBody } from 'h3'
import { vi } from 'vitest'

/** Supported locales */
export const locales = [
  'en' satisfies LocaleObject['code'],
  'ja' satisfies LocaleObject['code'],
  'ko' satisfies LocaleObject['code'],
] as const

export function withLocales<T>(
  en: T,
  ja: T,
  ko: T
): [LocaleObject['code'], T][] {
  return [en, ja, ko].map((item, i) => [locales[i]!, item])
}

/** Mock handler for API endpoint (returning request body) */
export const mockHandler = vi.fn(event => readBody(event))
/** Mock for useToast composable */
export const addMock = vi.fn<ReturnType<typeof useToast>['add']>()
