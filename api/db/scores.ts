import type { ScoreSchema } from '../core/db/scores'
import type { Difficulty } from '../core/db/songs'
import { fetchOne, ItemDefinition } from '.'

export function fetchScore(
  userId: string,
  songId: string,
  playStyle: 1 | 2,
  difficulty: Difficulty
): Promise<(ScoreSchema & ItemDefinition) | null> {
  return fetchOne<ScoreSchema>(
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
