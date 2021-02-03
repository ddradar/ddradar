import type { ItemDefinition } from '@azure/cosmos'
import type { Logger } from '@azure/functions'
import type { ScoreSchema } from '@ddradar/core/db/scores'
import type { SongSchema } from '@ddradar/core/db/songs'
import type { ClearStatusSchema } from '@ddradar/core/db/userDetails'
import { fetchTotalChartCount, getContainer } from '@ddradar/db'

type TotalCount = { id?: string } & Pick<
  ClearStatusSchema,
  'level' | 'playStyle' | 'count'
>
type UpdateSongResult = {
  scores: ScoreSchema[]
  details: TotalCount[]
}

/**
 * Update song info of other container.
 * @param context Function context
 * @param songs Change feed of "Songs" container
 */
export default async function (
  context: { log: Pick<Logger, 'info' | 'warn' | 'error'> },
  songs: SongSchema[],
  oldTotalCounts: Required<Omit<TotalCount, 'count'>>[]
): Promise<UpdateSongResult> {
  const scores: ScoreSchema[] = []

  for (const song of songs) {
    context.log.info(`Start: ${song.name}`)
    // Get scores
    const container = getContainer('Scores')
    const { resources } = await container.items
      .query<ScoreSchema & ItemDefinition>({
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
        scores.push({ ...score, songName: song.name, level: chart.level })
      }
    }
  }

  const newTotalCounts = await fetchTotalChartCount()
  const details = newTotalCounts.map(r => ({
    ...r,
    id: oldTotalCounts.find(
      d => d.playStyle === r.playStyle && d.level === r.level
    )?.id,
  }))
  return { scores, details }
}
