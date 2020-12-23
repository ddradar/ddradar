import type { ItemDefinition } from '@azure/cosmos'
import type { ScoreSchema } from '@ddradar/core/db/scores'
import type { Difficulty, PlayStyle } from '@ddradar/core/db/songs'

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
