import type { OperationInput } from '@azure/cosmos'
import type {
  CourseChartSchema,
  ScoreSchema,
  StepChartSchema,
} from '@ddradar/core'
import { getDanceLevel } from '@ddradar/core'
import { fetchList, fetchOne, getContainer } from '@ddradar/db'
import { decode } from 'iconv-lite'

import { getLoginUserInfo } from '~~/server/utils/auth'
import { sendNullWithError } from '~~/server/utils/http'
import { topUser, upsertScore } from '~~/server/utils/score'

type SkillAttackScore = Pick<
  ScoreSchema,
  'playStyle' | 'difficulty' | 'score' | 'clearLamp' | 'rank'
>
type Chart = StepChartSchema | CourseChartSchema

/**
 * Import user scores from Skill Attack site.
 * @description
 * - Need Authentication.
 * - POST `api/v1/import/skillAttack`
 * @returns
 * - Returns `401 Unauthorized` if you are not logged in.
 * - Returns `400 Bad Request` if DDR-CODE is not set.
 * - Returns `404 Not Found` if cannot get scores from Skill Attack site.
 * - Returns `200 OK` with JSON body otherwize.
 * @example
 * ```jsonc
 * // Response Body
 * {
 *   "userId": "public_user",
 *   "userName": "AFRO",
 *   "songId": "QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl",
 *   "songName": "愛言葉",
 *   "playStyle": 1,
 *   "difficulty": 0,
 *   "level": 3,
 *   "score": 999950,
 *   "clearLamp": 6,
 *   "exScore": 397,
 *   "maxCombo": 122,
 *   "rank": "AAA"
 * }
 * ```
 */
export default defineEventHandler(async event => {
  // Get DDR-CODE
  const user = await getLoginUserInfo(event)
  if (!user) return sendNullWithError(event, 401)
  if (!user.code)
    return sendNullWithError(event, 400, 'Import operation needs DDR-CODE.')

  const { arrayBuffer, ok } = await $fetch.raw(
    `http://skillattack.com/sa4/data/dancer/${user.code}/score_${user.code}.txt`
  )
  if (!ok) return sendNullWithError(event, 404)
  const scoresMap = decode(Buffer.from(await arrayBuffer()), 'shift_jis')
    .trim()
    .split('\n')
    .reduce((prev, s) => {
      /**
       * - \[0\]: skillAttackId
       * - \[1\]: 0:SP, 1:DP
       * - \[2\]: 0:BEGINNER, 1:BASIC, ..., 4:CHALLENGE
       * - \[3\]: DDR CODE
       * - \[4\]: UNIX Time
       * - \[5\]: score
       * - \[6\]: 0:Played(Failed,Assisted,Clear), 1:FC(include GreatFC), 2:PFC, 3:MFC
       * - \[7\]: Song Name (HTML escaped)
       * - \[8\]: blank
       */
      const cols = s.split('\t')
      if (cols.length < 8) return prev

      const id = parseInt(cols[0], 10)
      const playStyle = (parseInt(cols[1], 10) + 1) as 1 | 2
      const difficulty = parseInt(cols[2], 10) as 0 | 1 | 2 | 3 | 4
      const score = parseInt(cols[5], 10)
      const clearLamp =
        cols[6] === '3' ? 7 : cols[6] === '2' ? 6 : cols[6] === '1' ? 4 : 2

      if (prev[id] === undefined) prev[id] = []

      const scores = prev[id]
      const oldScore = scores.find(
        s => s.playStyle === playStyle && s.difficulty === difficulty
      )
      if (oldScore === undefined) {
        scores.push({
          playStyle,
          difficulty,
          clearLamp,
          score,
          rank: getDanceLevel(score),
        })
      } else {
        oldScore.clearLamp = clearLamp
        oldScore.score = score
        oldScore.rank = getDanceLevel(score)
      }
      return prev
    }, {} as Record<number, SkillAttackScore[]>)

  const result: ScoreSchema[] = []
  const operations: OperationInput[] = []
  for (const [skillAttackId, scores] of Object.entries(scoresMap)) {
    const song = await fetchOne('Songs', ['id', 'name', 'deleted', 'charts'], {
      condition: 'c.skillAttackId = @',
      value: skillAttackId,
    })
    if (!song) continue

    const oldScores = await fetchList('Scores', '*', [
      { condition: 'c.songId = @', value: song.id },
      {
        condition: 'ARRAY_CONTAINS(@, c.userId)',
        value: [user.id, '0', `${user.area}`],
      },
      { condition: '((NOT IS_DEFINED(c.ttl)) OR c.ttl = -1 OR c.ttl = null)' },
    ])

    for (const score of scores) {
      const chart = (song.charts as Chart[]).find(
        c =>
          c.playStyle === score.playStyle && c.difficulty === score.difficulty
      )
      if (!chart) continue

      const chartInfo = { ...song, ...chart }
      upsertScore(chartInfo, user, oldScores, score, result, operations)

      if (user.isPublic) {
        // World Record
        upsertScore(chartInfo, topUser, oldScores, score, result, operations)
        if (user.area !== 0) {
          // Area Top
          const areaUser = {
            id: `${user.area}`,
            name: `${user.area}`,
            isPublic: false,
          }
          upsertScore(chartInfo, areaUser, oldScores, score, result, operations)
        }
      }
    }
  }
  await getContainer('Scores').items.batch(operations)
  return result
})
