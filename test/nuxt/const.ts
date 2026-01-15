import type { LocaleObject } from '@nuxtjs/i18n'
import { readBody } from 'h3'
import { vi } from 'vitest'

/** Supported locales */
export const locales = [
  'en' satisfies LocaleObject['code'],
  'ja' satisfies LocaleObject['code'],
] as const

/** Mock handler for API endpoint (returning request body) */
export const mockHandler = vi.fn(event => readBody(event))
/** Mock for useToast composable */
export const addMock = vi.fn<ReturnType<typeof useToast>['add']>()
