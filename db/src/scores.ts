import type { ItemDefinition } from '@azure/cosmos'
import type { Database, Song } from '@ddradar/core'

import { Condition, fetchGroupedList, fetchList, fetchOne } from './database'

/**
 * Score is not deleted.
 * (not defined {@link https://docs.microsoft.com/azure/cosmos-db/time-to-live Time to Live}.)
 */
const isNotObsolete = {
  condition: '((NOT IS_DEFINED(c.ttl)) OR c.ttl = -1 OR c.ttl = null)' as const,
}
/** Score is not Area user score and not Course score. */
const isUserSongScore = { condition: 'IS_DEFINED(c.radar)' as const }

/**
 * Returns one score data that matches conditions.
 * @param userId User id
 * @param songId Song id
 * @param playStyle {@link Song.PlayStyle}
 * @param difficulty {@link Song.Difficulty}
 */
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
    isNotObsolete
  )
}

/**
 * Returns one score data list that matches conditions.
 * @param userId User id
 * @param conditions WHERE conditions
 * @param includeCourse Includes course score or not
 */
export function fetchScoreList(
  userId: string,
  conditions: Partial<
    Pick<
      Database.ScoreSchema,
      'playStyle' | 'difficulty' | 'level' | 'clearLamp' | 'rank'
    >
  > = {},
  includeCourse = false
): Promise<Omit<Database.ScoreSchema, 'userId' | 'userName' | 'isPublic'>[]> {
  const condition: Condition<'Scores'>[] = [
    { condition: 'c.userId = @', value: userId },
    isNotObsolete,
    ...Object.entries(conditions).map(([k, v]) => ({
      condition: `c.${k as keyof Database.ScoreSchema} = @` as const,
      value: v,
    })),
  ]
  if (!includeCourse) condition.push(isUserSongScore)

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
      'radar',
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
 * Generates {@link Database.ClearStatusSchema} from Score data.
 * @description This function consumes a lot of RU cost. Please call carefully.
 */
export function fetchSummaryClearLampCount(): Promise<
  Database.ClearStatusSchema[]
> {
  return fetchGroupedList(
    'Scores',
    [...summaryColumns, '"clear" AS type', 'clearLamp', 'COUNT(1) AS count'],
    [isUserSongScore, isNotObsolete, isNotDeletedSong],
    [...summaryColumns, 'clearLamp']
  )
}

/**
 * Generates {@link Database.ScoreStatusSchema} from Score data.
 * @description This function consumes a lot of RU cost. Please call carefully.
 */
export function fetchSummaryRankCount(): Promise<Database.ScoreStatusSchema[]> {
  return fetchGroupedList(
    'Scores',
    [...summaryColumns, '"score" AS type', 'rank', 'COUNT(1) AS count'],
    [isUserSongScore, isNotObsolete, isNotDeletedSong],
    [...summaryColumns, 'rank']
  )
}

/**
 * Generates {@link Database.GrooveRadarSchema} from Score data.
 * @param userId User id
 * @param playStyle {@link Song.PlayStyle}
 */
export async function generateGrooveRadar(
  userId: string,
  playStyle: Song.PlayStyle
): Promise<Database.GrooveRadarSchema> {
  const [resource]: Database.GrooveRadarSchema[] = await fetchGroupedList(
    'Scores',
    [
      'userId',
      '"radar" AS type',
      'playStyle',
      'MAX(c.radar.stream) AS stream',
      'MAX(c.radar.voltage) AS voltage',
      'MAX(c.radar.air) AS air',
      'MAX(c.radar.freeze) AS freeze',
      'MAX(c.radar.chaos) AS chaos',
    ],
    [
      { condition: 'c.userId = @', value: userId },
      { condition: 'c.playStyle = @', value: playStyle },
      isUserSongScore,
      isNotObsolete,
    ],
    ['userId', 'playStyle']
  )
  const result: Database.GrooveRadarSchema & Pick<ItemDefinition, 'id'> =
    resource ?? {
      userId,
      type: 'radar',
      playStyle,
      stream: 0,
      voltage: 0,
      air: 0,
      freeze: 0,
      chaos: 0,
    }
  result.id = `radar-${userId}-${playStyle}`
  return result
}
