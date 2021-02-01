import type { ItemDefinition } from '@azure/cosmos'
import type { ScoreSchema } from '@ddradar/core/db/scores'
import type { Difficulty, PlayStyle } from '@ddradar/core/db/songs'

import { fetchOne } from '.'

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
