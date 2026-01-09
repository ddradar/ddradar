import { cacheName as getSongListKey } from '~~/server/api/songs/index.get'
import { __getSongInfo, __getUser } from '~~/server/db/utils'

/**
 * Get song info from cache or database
 * @param songId Song ID
 * @returns Song info or undefined if not found
 */
export const getCachedSongInfo = defineCachedFunction(
  async (_: unknown, songId: string) => __getSongInfo(songId),
  {
    maxAge: 60 * 60 * 24, // 24 hour
    name: 'songs',
    getKey: (_, songId) => songId,
  }
)

/**
 * Clear song-related cache.
 * @param songId Song ID (if empty, only clear song list cache)
 * @param clearListCache Whether to clear song list cache as well
 */
export const clearSongCache = async (songId: string, clearListCache = true) => {
  // getCachedSongInfo
  if (songId)
    await useStorage('cache').removeItem(`nitro:functions:songs:${songId}.json`)
  // GET /api/songs
  if (!songId || clearListCache)
    await useStorage('cache').removeItem(`nitro:handler:${getSongListKey}`)
}

/**
 * Get user info from cache or database
 * @summary This function does not care about user's visibility. Need to handle it in caller if necessary.
 * @param userId User ID
 * @returns User info or undefined if not found
 */
export const getCachedUser = defineCachedFunction(
  async (_: unknown, userId: string) => __getUser(userId),
  {
    maxAge: 60 * 60 * 24, // 24 hour
    name: 'users',
    getKey: (_, userId) => userId,
  }
)

/**
 * Clear user-related cache.
 * @param userId User ID
 */
export const clearUserCache = async (userId: string) => {
  await useStorage('cache').removeItem(`nitro:functions:users:${userId}.json`)
}
