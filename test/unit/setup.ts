import type { db } from '@nuxthub/db'
import * as schema from '@nuxthub/db/schema'
import type { kv } from '@nuxthub/kv'
import { vi } from 'vitest'

// Nitro
vi.mock('nitropack/runtime', () => ({
  defineCachedEventHandler: vi.fn((handler: unknown) => handler),
  defineCachedFunction: vi.fn(),
  useStorage: vi.fn(),
}))

// nuxthub
vi.mock('@nuxthub/db', () => {
  return {
    db: {
      batch: vi.fn<typeof db.batch>(),
      insert: vi.fn(() => ({
        values: vi.fn(() => ({
          onConflictDoUpdate: vi.fn(() => ({ returning: vi.fn() })),
        })),
      })),
      query: {
        songs: {
          findFirst: vi.fn<typeof db.query.songs.findFirst>(),
          findMany: vi.fn<typeof db.query.songs.findMany>(),
        },
        charts: {
          findFirst: vi.fn<typeof db.query.charts.findFirst>(),
          findMany: vi.fn<typeof db.query.charts.findMany>(),
        },
        scores: {
          findFirst: vi.fn<typeof db.query.scores.findFirst>(),
          findMany: vi.fn<typeof db.query.scores.findMany>(),
        },
        users: {
          findFirst: vi.fn<typeof db.query.users.findFirst>(),
          findMany: vi.fn<typeof db.query.users.findMany>(),
        },
      },
      select: vi.fn(() => ({
        from: vi.fn(() => ({ where: vi.fn(() => ({})) })),
      })),
      update: vi.fn<typeof db.update>(),
    },
    schema,
  }
})
vi.mock('@nuxthub/kv', () => {
  return {
    kv: {
      get: vi.fn<typeof kv.get>(),
      set: vi.fn<typeof kv.set>(),
      del: vi.fn<typeof kv.del>(),
      keys: vi.fn<typeof kv.keys>(),
      has: vi.fn<typeof kv.has>(),
    },
  }
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
