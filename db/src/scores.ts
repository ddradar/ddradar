import type { ItemDefinition } from '@azure/cosmos'
import type {
  Difficulty,
  PlayStyle,
  ScoreSchema,
  UserClearLampSchema,
  UserRankSchema,
} from '@ddradar/core'

import type { Condition } from './database'
import { fetchGroupedList, fetchList, fetchOne } from './database'

/**
 * Score is not deleted.
 * (not defined {@link https://docs.microsoft.com/azure/cosmos-db/time-to-live Time to Live}.)
 */
const isNotObsolete = {
  condition: '((NOT IS_DEFINED(c.ttl)) OR c.ttl = -1 OR c.ttl = null)' as const,
}

/**
 * Returns one score data that matches conditions.
 * @param userId User id
 * @param songId Song id
 * @param playStyle {@link PlayStyle}
 * @param difficulty {@link Difficulty}
 */
export function fetchScore(
  userId: string,
  songId: string,
  playStyle: PlayStyle,
  difficulty: Difficulty
): Promise<(ScoreSchema & Pick<ItemDefinition, 'id'>) | null> {
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
    ],
    { condition: 'c.userId = @', value: userId },
    { condition: 'c.songId = @', value: songId },
    { condition: 'c.playStyle = @', value: playStyle },
    { condition: 'c.difficulty = @', value: difficulty },
    isNotObsolete
  )
}

/**
 * Returns one score data list that matches conditions.
 * @param userId User id
 * @param conditions WHERE conditions
 */
export function fetchScoreList(
  userId: string,
  conditions: Partial<
    Pick<
      ScoreSchema,
      'playStyle' | 'difficulty' | 'level' | 'clearLamp' | 'rank'
    >
  > = {}
): Promise<Omit<ScoreSchema, 'userId' | 'userName' | 'isPublic'>[]> {
  const condition: Condition<'Scores'>[] = [
    { condition: 'c.userId = @', value: userId },
    isNotObsolete,
    ...Object.entries(conditions)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => ({
        condition: `c.${k as keyof ScoreSchema} = @` as const,
        value: v,
      })),
  ]

  return fetchList(
    'Scores',
    [
      'songId',
      'songName',
      'playStyle',
      'difficulty',
      'level',
      'score',
      'exScore',
      'maxCombo',
      'clearLamp',
      'rank',
      'deleted',
    ],
    condition,
    { songName: 'ASC' }
  )
}

const isNotDeletedSong = {
  condition: 'NOT (IS_DEFINED(c.deleted) AND c.deleted = true)' as const,
}
const summaryColumns = ['userId', 'playStyle', 'level'] as const

/**
 * Generates {@link UserClearLampSchema} from Score data.
 * @description This function consumes a lot of RU cost. Please call carefully.
 */
export function fetchSummaryClearLampCount(): Promise<UserClearLampSchema[]> {
  return fetchGroupedList(
    'Scores',
    [...summaryColumns, '"clear" AS type', 'clearLamp', 'COUNT(1) AS count'],
    [isNotObsolete, isNotDeletedSong],
    [...summaryColumns, 'clearLamp']
  )
}

/**
 * Generates {@link UserRankSchema} from Score data.
 * @description This function consumes a lot of RU cost. Please call carefully.
 */
export function fetchSummaryRankCount(): Promise<UserRankSchema[]> {
  return fetchGroupedList(
    'Scores',
    [...summaryColumns, '"score" AS type', 'rank', 'COUNT(1) AS count'],
    [isNotObsolete, isNotDeletedSong],
    [...summaryColumns, 'rank']
  )
}
