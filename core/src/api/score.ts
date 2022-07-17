import type { ScoreSchema } from '../db/scores'
import { isScore } from '../score'
import { difficultyMap, playStyleMap } from '../song'
import { hasIntegerProperty, hasProperty } from '../typeUtils'

/**
 * Request body to "/api/v1/scores/{@link ScoreSchema.songId :songId}/{@link ScoreSchema.playStyle :playStyle}/{@link ScoreSchema.difficulty :difficulty}"
 * @see https://github.com/ddradar/ddradar/blob/master/api/scores__id__style__difficulty--post/
 */
export type ScoreBody = Pick<
  ScoreSchema,
  'score' | 'exScore' | 'maxCombo' | 'clearLamp' | 'rank'
>

/**
 * Request body to "/api/v1/scores/{@link ScoreSchema.songId :songId}"
 * @see https://github.com/ddradar/ddradar/blob/master/api/scores__id--post/
 */
export type ScoreListBody = Pick<
  ScoreSchema,
  | 'playStyle'
  | 'difficulty'
  | 'score'
  | 'exScore'
  | 'maxCombo'
  | 'clearLamp'
  | 'rank'
> & {
  /** World Record {@link ScoreSchema.score score}. */
  topScore?: number
}

/** Type Assertion for {@link ScoreListBody} */
export function isScoreListBody(obj: unknown): obj is ScoreListBody {
  return (
    isScore(obj) &&
    hasIntegerProperty(obj, 'playStyle', 'difficulty') &&
    (playStyleMap as ReadonlyMap<number, string>).has(obj.playStyle) &&
    (difficultyMap as ReadonlyMap<number, string>).has(obj.difficulty) &&
    (!hasProperty(obj, 'topScore') || hasIntegerProperty(obj, 'topScore'))
  )
}
