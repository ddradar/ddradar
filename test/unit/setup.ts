import {
  createError,
  defineEventHandler,
  getValidatedQuery,
  getValidatedRouterParams,
  readValidatedBody,
  setResponseStatus,
} from 'h3'
import { vi } from 'vitest'

// h3
vi.stubGlobal('createError', createError)
vi.stubGlobal('defineEventHandler', defineEventHandler)
vi.stubGlobal('getValidatedQuery', getValidatedQuery)
vi.stubGlobal('getValidatedRouterParams', getValidatedRouterParams)
vi.stubGlobal('readValidatedBody', readValidatedBody)
vi.stubGlobal('setResponseStatus', setResponseStatus)

// Nitro
vi.stubGlobal('cachedEventHandler', vi.fn<typeof cachedEventHandler>())
vi.stubGlobal('defineCachedFunction', vi.fn<typeof defineCachedFunction>())
vi.stubGlobal('defineRouteMeta', vi.fn<typeof defineRouteMeta>())
vi.stubGlobal('useStorage', vi.fn<typeof useStorage>())
vi.stubGlobal('useRuntimeConfig', vi.fn<typeof useRuntimeConfig>())

// nuxthub
vi.stubGlobal('db', {
  batch: vi.fn<typeof db.batch>(),
  insert: vi.fn(() => ({
    values: vi.fn(() => ({
      onConflictDoUpdate: vi.fn(() => ({ returning: vi.fn() })),
    })),
  })),
  update: vi.fn(),
  query: {
    songs: { findFirst: vi.fn(), findMany: vi.fn() },
    charts: { findFirst: vi.fn(), findMany: vi.fn() },
    scores: { findFirst: vi.fn(), findMany: vi.fn() },
    users: { findFirst: vi.fn(), findMany: vi.fn() },
  },
})
vi.stubGlobal('kv', {
  get: vi.fn<typeof kv.get>(),
  set: vi.fn<typeof kv.set>(),
  del: vi.fn<typeof kv.del>(),
  keys: vi.fn<typeof kv.keys>(),
  has: vi.fn<typeof kv.has>(),
})

// nuxt-auth-utils
vi.stubGlobal('getUserSession', vi.fn<typeof getUserSession>())
vi.stubGlobal('requireUserSession', vi.fn<typeof requireUserSession>())
vi.stubGlobal('setUserSession', vi.fn<typeof setUserSession>())

// Server Utils (/server/utils/*.ts)
vi.stubGlobal('getAuthenticatedUser', vi.fn<typeof getAuthenticatedUser>())
vi.stubGlobal(
  'requireAuthenticatedUser',
  vi.fn<typeof requireAuthenticatedUser>()
)
vi.stubGlobal(
  'requireAuthenticatedUserFromSession',
  vi.fn<typeof requireAuthenticatedUserFromSession>()
)
vi.stubGlobal('getCachedSongInfo', vi.fn<typeof getCachedSongInfo>())
vi.stubGlobal('getCachedUser', vi.fn<typeof getCachedUser>())
vi.stubGlobal('clearSongCache', vi.fn<typeof clearSongCache>())
vi.stubGlobal('clearUserCache', vi.fn<typeof clearUserCache>())
