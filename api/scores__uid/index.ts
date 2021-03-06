import type { HttpRequest } from '@azure/functions'
import type { Api, Database } from '@ddradar/core'
import { Score, Song } from '@ddradar/core'
import { fetchScoreList } from '@ddradar/db'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { ErrorResult, SuccessResult } from '../function'

/** Get user scores that match the specified conditions. */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'headers' | 'query'>,
  [user]: Pick<Database.UserSchema, 'id' | 'isPublic'>[]
): Promise<ErrorResult<404> | SuccessResult<Api.ScoreList[]>> {
  const loginUser = await getLoginUserInfo(getClientPrincipal(req))
  if (!user || (!user.isPublic && user.id !== loginUser?.id))
    return new ErrorResult(404)

  const { style, diff, lv, lamp, rank } = req.query

  const playStyle = parseInt(style ?? '', 10)
  const difficulty = parseInt(diff ?? '', 10)
  const level = parseInt(lv ?? '', 10)
  const clearLamp = parseInt(lamp ?? '', 10)

  const conditions = {
    ...(isPlayStyle(playStyle) ? { playStyle } : {}),
    ...(isDifficulty(difficulty) ? { difficulty } : {}),
    ...(isLevel(level) ? { level } : {}),
    ...(isClearLamp(clearLamp) ? { clearLamp } : {}),
    ...(isDanceLevel(rank) ? { rank } : {}),
  }

  const body = await fetchScoreList(user.id, conditions)
  if (body.length === 0) return new ErrorResult(404)

  return new SuccessResult(
    body.map(d => {
      const r = { ...d, isCourse: !!d.radar }
      delete r.radar
      return r
    })
  )

  //#region Assertion Functions
  function isPlayStyle(num: number): num is Song.PlayStyle {
    return num === 1 || num === 2
  }

  function isDifficulty(num: number): num is Song.Difficulty {
    return (Song.difficultyMap as Map<number, string>).has(num)
  }

  function isLevel(num: number): boolean {
    return Number.isInteger(num) && num >= 1 && num <= 20
  }

  function isClearLamp(num: number): num is Score.ClearLamp {
    return (Score.clearLampMap as Map<number, string>).has(num)
  }

  function isDanceLevel(str: string | undefined): str is Score.DanceLevel {
    return (Score.danceLevelSet as Set<string>).has(rank ?? '')
  }
  //#endregion
}
