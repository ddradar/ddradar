import { config } from 'dotenv'

// load .env file
config()

import type { Database } from '@ddradar/core'
import { Song } from '@ddradar/core'
import { getContainer } from '@ddradar/db'
import consola from 'consola'

import { fetchSongs } from './modules/database'

const courseInfo = {
  /** Course id */
  id: '',
  /** Course name */
  name: '',
  /** Course order (1-start) */
  index: 1,
} as const
/** Course song order */
const ids = [
  '', // 1st
  '', // 2nd
  '', // 3rd
  '', // FINAL
]

/** Generate NONSTOP course data from each songs info. */
async function main() {
  if (!Song.isValidId(courseInfo.id)) {
    consola.warn(`Invalid ID: ${courseInfo.id}`)
    return
  }
  consola.ready(`Add ${courseInfo.name} (${courseInfo.id})`)

  const songs = await fetchSongs(ids)
  consola.info(`1st: ${songs[0].name}`)
  consola.info(`2nd: ${songs[1].name}`)
  consola.info(`3rd: ${songs[2].name}`)
  consola.info(`Fin: ${songs[3].name}`)

  const chartKind = songs
    .reduce((prev, curr) => {
      for (const chart of curr.charts) {
        if (
          !prev.find(
            c =>
              c.playStyle === chart.playStyle &&
              c.difficulty === chart.difficulty
          )
        )
          prev.push({
            playStyle: chart.playStyle,
            difficulty: chart.difficulty,
          })
      }
      return prev
    }, [] as Pick<Database.StepChartSchema, 'playStyle' | 'difficulty'>[])
    .sort((l, r) =>
      l.playStyle === r.playStyle
        ? l.difficulty - r.difficulty
        : l.playStyle - r.playStyle
    )

  const zeroPadding = new Intl.NumberFormat(undefined, {
    minimumIntegerDigits: 2,
  })
  const course: Database.CourseSchema = {
    id: courseInfo.id,
    name: courseInfo.name,
    nameIndex: -1,
    nameKana: `C-A3-${zeroPadding.format(courseInfo.index)}`,
    series: 'DanceDanceRevolution A3',
    minBPM: Math.min(...songs.map(s => s.minBPM ?? 0)),
    maxBPM: Math.max(...songs.map(s => s.maxBPM ?? 0)),
    charts: chartKind.map(key => {
      const chartList = [getChart(0), getChart(1), getChart(2), getChart(3)]

      return {
        ...key,
        level: Math.max(...chartList.map(c => c.level)),
        notes: chartList.reduce((p, c) => p + c.notes, 0),
        freezeArrow: chartList.reduce((p, c) => p + c.freezeArrow, 0),
        shockArrow: chartList.reduce((p, c) => p + c.shockArrow, 0),
        order: chartList.map(c => ({
          songId: c.songId,
          songName: c.songName,
          playStyle: c.playStyle,
          difficulty: c.difficulty,
          level: c.level,
        })),
      }

      function getChart(i: number) {
        const charts = songs[i].charts as Database.StepChartSchema[]
        const chart =
          charts.find(
            c =>
              c.playStyle === key.playStyle && c.difficulty === key.difficulty
          ) ??
          charts.find(
            c => c.playStyle === key.playStyle && c.difficulty === 3 // Fallback to EXPERT
          ) ??
          charts.find(c => c.playStyle === key.playStyle && c.difficulty === 4) // Fallback to CHALLENGE
        if (!chart) throw new Error('Missing chart')
        return { ...chart, songId: songs[i].id, songName: songs[i].name }
      }
    }),
  }

  await getContainer('Songs').items.create(course)
  consola.success(`Added ${course.name} (${course.id})`)
}

// yarn start ./generate-course.ts
main().catch(e => consola.error(e))
