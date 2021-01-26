import type { ItemDefinition } from '@azure/cosmos'
import type { ScoreSchema } from '@ddradar/core/db/scores'
import type { Difficulty, PlayStyle } from '@ddradar/core/db/songs'
import type {
  ClearStatusSchema,
  ScoreStatusSchema,
} from '@ddradar/core/db/userDetails'

import { getContainer } from '.'

export async function fetchScore(
  userId: string,
  songId: string,
  playStyle: PlayStyle,
  difficulty: Difficulty
): Promise<(ScoreSchema & ItemDefinition) | null> {
  const container = getContainer('Scores')
  const columns: (keyof (ScoreSchema & ItemDefinition))[] = [
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
  ]
  const column = columns.map(col => `c.${col}`).join(', ')
  const conditions = [
    'c.userId = @userId',
    'c.songId = @songId',
    'c.playStyle = @playStyle',
    'c.difficulty = @difficulty',
    '((NOT IS_DEFINED(c.ttl)) OR c.ttl = -1 OR c.ttl = null)',
  ]
  const condition = conditions.join(' AND ')
  const query = `SELECT ${column} FROM c WHERE ${condition}`

  const { resources } = await container.items
    .query<ScoreSchema & ItemDefinition>({
      query,
      parameters: [
        { name: '@userId', value: userId },
        { name: '@songId', value: songId },
        { name: '@playStyle', value: playStyle },
        { name: '@difficulty', value: difficulty },
      ],
    })
    .fetchNext()

  return resources[0] ?? null
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
