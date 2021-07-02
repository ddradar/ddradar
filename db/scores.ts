import type { ItemDefinition } from '@azure/cosmos'
import type { Database, Song } from '@ddradar/core'

import { fetchOne, getContainer } from './database'

export function fetchScore(
  userId: string,
  songId: string,
  playStyle: Song.PlayStyle,
  difficulty: Song.Difficulty
): Promise<(Database.ScoreSchema & Pick<ItemDefinition, 'id'>) | null> {
  return fetchOne(
    'Scores',
    [
      'id',
      'userId',
      'userName',
      'isPublic',
      'songId',
      'songName',
      'playStyle',
      'difficulty',
      'level',
      'clearLamp',
      'score',
      'rank',
      'exScore',
      'maxCombo',
      'radar',
    ],
    { condition: 'c.userId = @', value: userId },
    { condition: 'c.songId = @', value: songId },
    { condition: 'c.playStyle = @', value: playStyle },
    { condition: 'c.difficulty = @', value: difficulty },
    { condition: '((NOT IS_DEFINED(c.ttl)) OR c.ttl = -1 OR c.ttl = null)' }
  )
}

export function fetchSummaryClearLampCount(): Promise<
  Database.ClearStatusSchema[]
> {
  return summaryScores<Database.ClearStatusSchema>('score', 'rank')
}

export function fetchSummaryRankCount(): Promise<Database.ScoreStatusSchema[]> {
  return summaryScores<Database.ScoreStatusSchema>('clear', 'clearLamp')
}

async function summaryScores<T>(
  type: string,
  groupedProp: keyof Database.ScoreSchema
) {
  const container = getContainer('Scores')
  const { resources } = await container.items
    .query<T>(
      `SELECT c.userId, "${type}" AS type, c.playStyle, c.level, c.${groupedProp}, COUNT(1) AS count ` +
        'WHERE IS_DEFINED(c.radar) AND (NOT IS_DEFINED(c.ttl)) AND NOT (IS_DEFINED(c.deleted) AND c.deleted = true)' +
        `GROUP BY c.userId, c.playStyle, c.level, c.${groupedProp}`
    )
    .fetchAll()
  return resources
}
