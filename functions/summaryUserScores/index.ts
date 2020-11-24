import type { ItemDefinition } from '@azure/cosmos'
import type { Logger } from '@azure/functions'

import type { ScoreSchema } from '../core/db/scores'
import type { UserDetailsSchema } from '../core/db/user-details'
import {
  fetchClearAndScoreStatus,
  generateGrooveRadar,
} from '../db/user-details'

/** Import skillAttackId from Skill Attack site. */
export default async function (
  context: { log: Pick<Logger, 'info'> },
  scores: (ScoreSchema & ItemDefinition)[]
): Promise<UserDetailsSchema[]> {
  const userScores = scores.reduce((prev, s) => {
    // Skip area top score
    if (!s.radar) return prev

    if (!prev[s.userId]) prev[s.userId] = []
    prev[s.userId].push(s)
    return prev
  }, {} as Record<string, (ScoreSchema & ItemDefinition)[]>)

  const result: UserDetailsSchema[] = []
  for (const [userId, scores] of Object.entries(userScores)) {
    // Regenerate Groove Radar
    result.push(
      await generateGrooveRadar(userId, 1),
      await generateGrooveRadar(userId, 2)
    )
    context.log.info(`Generated: { userId: "${userId}" } Groove Radar`)

    const summaries = await fetchClearAndScoreStatus(userId)
    // Count up/down Clear/Score status
    for (const score of scores) {
      const clear = summaries.find(
        s =>
          s.type === 'clear' &&
          s.playStyle === score.playStyle &&
          s.level === score.level &&
          s.clearLamp === score.clearLamp
      )
      const rank = summaries.find(
        s =>
          s.type === 'score' &&
          s.playStyle === score.playStyle &&
          s.level === score.level &&
          s.rank === score.rank
      )
      // Deleted Score
      if ((score.ttl ?? -1) > 0) {
        if (clear) clear.count--
        if (rank) rank.count--
        continue
      }

      // Added Score
      if (clear) clear.count++
      else {
        context.log.info(
          `Created: { userId: "${userId}", playStyle: ${score.playStyle}, level: ${score.level}, clearLamp: ${score.clearLamp} }`
        )
        summaries.push({
          userId,
          type: 'clear',
          playStyle: score.playStyle,
          level: score.level,
          clearLamp: score.clearLamp,
          count: 1,
        })
      }
      if (rank) rank.count++
      else {
        context.log.info(
          `Created: { userId: "${userId}", playStyle: ${score.playStyle}, level: ${score.level}, rank: ${score.rank} }`
        )
        summaries.push({
          userId,
          type: 'score',
          playStyle: score.playStyle,
          level: score.level,
          rank: score.rank,
          count: 1,
        })
      }
    }
    result.push(...summaries)
  }
  return result
}
