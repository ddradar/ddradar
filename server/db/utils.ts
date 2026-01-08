import { and, eq } from 'drizzle-orm'

export const ignoreTimestampCols = {
  createdAt: false,
  updatedAt: false,
  deletedAt: false,
} as const

/**
 * Get song info from database.
 * @summary Use `getCachedSongInfo` instead. This function is only for internal use.
 * @param id Song ID
 * @returns Song info or undefined if not found
 * @private
 */
export async function __getSongInfo(id: string): Promise<SongInfo | undefined> {
  const song: SongInfo | undefined = await db.query.songs.findFirst({
    columns: { ...ignoreTimestampCols },
    with: {
      charts: { columns: { id: false, ...ignoreTimestampCols } },
    },
    where: (songs, { and, eq, isNull }) =>
      and(eq(songs.id, id), isNull(songs.deletedAt)),
  })
  return song
}

/**
 * Get user info from database.
 * @summary Use `getCachedUser` instead. This function is only for internal use.
 * @param id User ID
 * @returns User info or undefined if not found
 */
export async function __getUser(id: string): Promise<UserInfo | undefined> {
  const user: UserInfo | undefined = await db.query.users.findFirst({
    columns: { ...ignoreTimestampCols, provider: false, providerId: false },
    where: (users, { and, isNull, eq }) =>
      and(eq(users.id, id), isNull(users.deletedAt)),
  })
  return user
}

/**
 * Get login user by provider and providerId
 * @param provider OAuth provider name
 * @param providerId User ID on the OAuth provider
 * @returns User record or undefined if not found
 */
export function getCurrentUser(provider: string, providerId: string) {
  return db.query.users.findFirst({
    where: and(
      eq(schema.users.provider, provider),
      eq(schema.users.providerId, providerId)
    ),
  })
}

/**
 * Get step chart by key, or throw 404 error if not found
 * @param key Key to identify the step chart
 * @returns The step chart
 */
export async function getStepChart(
  key: Readonly<Pick<ScoreRecordInput, 'songId' | 'playStyle' | 'difficulty'>>
): Promise<StepChart | undefined> {
  const chart = await db.query.charts.findFirst({
    columns: { ...ignoreTimestampCols },
    where: and(
      eq(schema.charts.id, key.songId),
      eq(schema.charts.playStyle, key.playStyle),
      eq(schema.charts.difficulty, key.difficulty)
    ),
  })
  return chart
}
