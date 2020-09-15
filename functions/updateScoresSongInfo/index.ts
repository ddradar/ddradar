import type { Context } from '@azure/functions'

import type { ScoreSchema } from '../db/scores'
import type { SongSchema } from '../db/songs'

/**
 * Update song info of "Scores" container.
 * @param context Function context
 * @param songs Change feed of "Songs" container
 * @param scores "Scores" container
 */
export default async function (
  context: Context,
  songs: SongSchema[],
  scores: ScoreSchema[]
): Promise<ScoreSchema[]> {
  if (songs.length !== 1) {
    context.log.warn(`Change feed includes multiple songs. Skiped trigger.`)
    return []
  }
  const song: SongSchema = songs[0]

  if (scores.length === 0) {
    context.log.info(`Not Found Scores: ${song.name}`)
    return []
  }

  return scores
    .map(s => {
      const chart = song.charts.find(
        c => c.playStyle === s.playStyle && c.difficulty === s.difficulty
      )
      if (!chart) {
        context.log.error(`Invalid score: { id: ${s.id}, name: ${s.songName} }`)
        return
      }
      if (song.name !== s.songName || chart.level !== s.level) {
        return { ...s, songName: song.name, level: chart.level }
      }
    })
    .filter(s => !!s) as ScoreSchema[]
}
