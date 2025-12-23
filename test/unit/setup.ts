import {
  createError,
  defineEventHandler,
  getValidatedQuery,
  getValidatedRouterParams,
  readValidatedBody,
} from 'h3'
import { vi } from 'vitest'

import { charts, scores, songs, users } from '~~/server/db/schema'

// h3
vi.stubGlobal('createError', createError)
vi.stubGlobal('defineEventHandler', defineEventHandler)
vi.stubGlobal('getValidatedQuery', getValidatedQuery)
vi.stubGlobal('getValidatedRouterParams', getValidatedRouterParams)
vi.stubGlobal('readValidatedBody', readValidatedBody)

// Nitro
vi.stubGlobal('cachedEventHandler', vi.fn())
vi.stubGlobal('defineRouteMeta', vi.fn())
vi.stubGlobal('useStorage', vi.fn())

// nuxthub
vi.stubGlobal('db', vi.fn())
vi.stubGlobal('schema', { charts, scores, songs, users })

// nuxt-auth-utils
vi.stubGlobal('getUserSession', vi.fn())
vi.stubGlobal('requireUserSession', vi.fn())
vi.stubGlobal('setUserSession', vi.fn())

// Server Utils
vi.stubGlobal('getAuthenticatedUser', vi.fn())
vi.stubGlobal('requireAuthenticatedUser', vi.fn())
vi.stubGlobal('requireAuthenticatedUserFromSession', vi.fn())

// Auto imports
vi.stubGlobal('getCachedSongInfo', vi.fn())
vi.stubGlobal('getCachedUser', vi.fn())
