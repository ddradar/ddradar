import type {
  ClearLamp,
  DanceLevel,
  ScoreSchema,
  UserClearLampSchema,
  UserGrooveRadarSchema,
  UserRankSchema,
  UserSchema,
} from '@ddradar/core'
import {
  scoreSchema,
  userGrooveRadarSchema,
  userRankSchema,
  userSchema,
} from '@ddradar/core'
import { z } from 'zod'

/** GET `api/v1/user` response type */
export type CurrentUserInfo = Omit<UserSchema, 'loginId'>

/** GET `api/v1/user/roles` expected body */
export const getRolesBodySchema = z.object({ userId: userSchema.shape.loginId })

/** GET `api/v1/users` expected queries */
export const getListQuerySchema = z.object({
  name: z.ostring(),
  area: z.coerce
    .number()
    .pipe(userSchema.shape.area)
    .optional()
    .catch(undefined),
  code: z.coerce
    .number()
    .pipe(userSchema.shape.code)
    .optional()
    .catch(undefined),
})

/** GET `api/v1/users`, `api/v1/users/[id]` response type */
export type UserInfo = Omit<UserSchema, 'loginId' | 'isPublic' | 'password'>

/** GET `api/v1/users/[id]/*` expected router params */
export const paramsSchema = z.object({ id: userSchema.shape.id })

/** GET `api/v1/users/[id]/clear` expected queries */
export const getClearQuerySchema = z.object({
  style: z.coerce.number().default(0),
  lv: z.coerce.number().default(0),
})

/** GET `api/v1/users/[id]/clear` response type */
export type ClearStatus = Pick<
  UserClearLampSchema,
  'playStyle' | 'level' | 'count'
> & {
  /**
   * `-1`: No Play,
   * `0`: Failed,
   * `1`: Assisted Clear,
   * `2`: Clear,
   * `3`: LIFE4,
   * `4`: Good FC (Full Combo),
   * `5`: Great FC,
   * `6`: PFC,
   * `7`: MFC
   */
  clearLamp: ClearLamp | -1
}

/** GET `api/v1/users/[id]/exists` response type */
export type ExistsUser = Pick<UserSchema, 'id'> & {
  /** User exists or not */
  exists: boolean
}

/** GET `api/v1/users/[id]/radar` expected queries */
export const getRadarQuerySchema = z.object({
  style: z.coerce
    .number()
    .pipe(userGrooveRadarSchema.shape.playStyle)
    .optional()
    .catch(undefined),
})

/** GET `api/v1/users/[id]/radar` response type */
export type GrooveRadarInfo = Omit<UserGrooveRadarSchema, 'userId' | 'type'>

/** GET `api/v1/users/[id]/rank` expected queries */
export const getRankQuerySchema = z.object({
  style: z.coerce
    .number()
    .pipe(userRankSchema.shape.playStyle)
    .optional()
    .catch(undefined),
  lv: z.coerce
    .number()
    .pipe(userRankSchema.shape.level)
    .optional()
    .catch(undefined),
})

/** GET `api/v1/users/[id]/rank` response type */
export type RankStatus = Pick<
  UserRankSchema,
  'playStyle' | 'level' | 'count'
> & {
  /** Dance level (`"E"` ~ `"AAA"`), `"-"`: No Play */
  rank: DanceLevel | '-'
}

/** GET `api/v1/users/[id]/scores` expected queries */
export const getScoresQuerySchema = z.object({
  style: z.coerce
    .number()
    .pipe(scoreSchema.shape.playStyle)
    .optional()
    .catch(undefined),
  diff: z.coerce
    .number()
    .pipe(scoreSchema.shape.difficulty)
    .optional()
    .catch(undefined),
  level: z.coerce
    .number()
    .pipe(scoreSchema.shape.level)
    .optional()
    .catch(undefined),
  lamp: z.coerce
    .number()
    .pipe(scoreSchema.shape.clearLamp)
    .optional()
    .catch(undefined),
  rank: z.coerce
    .string()
    .pipe(scoreSchema.shape.rank)
    .optional()
    .catch(undefined),
})

/** GET `api/v1/users/[id]/scores` response type */
export type ScoreList = Omit<ScoreSchema, 'userId' | 'userName' | 'isPublic'>
