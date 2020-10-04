import type { Logger } from '@azure/functions'

import { getContainer } from '../db'
import type { ScoreSchema } from '../db/scores'
import type { SongSchema } from '../db/songs'

/**
 * Update song info of other container.
 * @param context Function context
 * @param songs Change feed of "Songs" container
 */
export default async function (
  context: { log: Pick<Logger, 'info' | 'warn' | 'error'> },
  songs: SongSchema[]
): Promise<ScoreSchema[]> {
  const result: ScoreSchema[] = []

  for (const song of songs) {
    context.log.info(`Start: ${song.name}`)
    // Get scores
    const container = getContainer('Scores')
    const { resources } = await container.items
      .query<ScoreSchema>({
        query: 'SELECT * FROM c WHERE c.songId = @id',
        parameters: [{ name: '@id', value: song.id }],
      })
      .fetchAll()

    for (const score of resources) {
      const chart = song.charts.find(
        c =>
          c.playStyle === score.playStyle && c.difficulty === score.difficulty
      )
      if (!chart) {
        context.log.error(
          `Invalid score: { id: ${score.id}, playStyle: ${score.playStyle}, difficulty: ${score.difficulty} }`
        )
        continue
      }
      if (song.name !== score.songName || chart.level !== score.level) {
        context.log.info(`Updated: ${score.id}`)
        result.push({ ...score, songName: song.name, level: chart.level })
      }
    }
  }

  return result
}
