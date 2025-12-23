import type { H3Event } from 'h3'

import { ignoreTimestampCols } from '../db/utils'

/**
 * Get song info from cache or database
 * @param songId Song ID
 * @returns Song info or undefined if not found
 */
export const getCachedSongInfo = defineCachedFunction(
  async (_: H3Event, songId: string): Promise<SongInfo | undefined> => {
    const song: SongInfo | undefined = await db.query.songs.findFirst({
      columns: { ...ignoreTimestampCols },
      with: {
        charts: { columns: { id: false, ...ignoreTimestampCols } },
      },
      where: (songs, { and, isNull, eq }) =>
        and(eq(songs.id, songId), isNull(songs.deletedAt)),
    })
    return song
  },
  {
    maxAge: 60 * 60 * 24, // 24 hour
    name: 'songs',
    getKey: (_, songId) => songId,
  }
)

/**
 * Get user info from cache or database
 * @summary This function does not care about user's visibility. Need to handle it in caller if necessary.
 * @param userId User ID
 * @returns User info or undefined if not found
 */
export const getCachedUser = defineCachedFunction(
  async (_: H3Event, userId: string): Promise<UserInfo | undefined> => {
    const user: UserInfo | undefined = await db.query.users.findFirst({
      columns: { ...ignoreTimestampCols, provider: false, providerId: false },
      where: (users, { and, isNull, eq }) =>
        and(eq(users.id, userId), isNull(users.deletedAt)),
    })
    return user
  },
  {
    maxAge: 60 * 60 * 24, // 24 hour
    name: 'users',
    getKey: (_, userId) => userId,
  }
)
