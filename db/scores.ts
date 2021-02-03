import type { ItemDefinition } from '@azure/cosmos'
import type { ScoreSchema } from '@ddradar/core/db/scores'
import type { Difficulty, PlayStyle } from '@ddradar/core/db/songs'
import type {
  ClearStatusSchema,
  ScoreStatusSchema,
} from '@ddradar/core/db/userDetails'

import { fetchOne, getContainer } from '.'

export function fetchScore(
  userId: string,
  songId: string,
  playStyle: PlayStyle,
  difficulty: Difficulty
): Promise<(ScoreSchema & ItemDefinition) | null> {
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
    [
      { condition: 'c.userId = @', value: userId },
      { condition: 'c.songId = @', value: songId },
      { condition: 'c.playStyle = @', value: playStyle },
      { condition: 'c.difficulty = @', value: difficulty },
      { condition: '((NOT IS_DEFINED(c.ttl)) OR c.ttl = -1 OR c.ttl = null)' },
    ]
  )
}

export async function fetchSummeryClearLampCount(): Promise<
  ClearStatusSchema[]
> {
  const container = getContainer('Scores')

  const { resources } = await container.items
    .query<ClearStatusSchema>(
      'SELECT c.userId, "clear" AS type, c.playStyle, c.level, c.clearLamp, COUNT(1) AS count FROM c ' +
        'WHERE IS_DEFINED(c.radar) AND NOT IS_DEFINED(c.ttl) ' +
        'GROUP BY c.userId, c.playStyle, c.level, c.clearLamp'
    )
    .fetchAll()

  return resources
}

export async function fetchSummeryRankCount(): Promise<ScoreStatusSchema[]> {
  const container = getContainer('Scores')

  const { resources } = await container.items
    .query<ScoreStatusSchema>(
      'SELECT c.userId, "score" AS type, c.playStyle, c.level, c.rank, COUNT(1) AS count FROM c ' +
        'WHERE IS_DEFINED(c.radar) AND NOT IS_DEFINED(c.ttl) ' +
        'GROUP BY c.userId, c.playStyle, c.level, c.rank'
    )
    .fetchAll()

  return resources
}
