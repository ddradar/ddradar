import { and, eq } from 'drizzle-orm'

export const ignoreTimestampCols = {
  createdAt: false,
  updatedAt: false,
  deletedAt: false,
} as const

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
