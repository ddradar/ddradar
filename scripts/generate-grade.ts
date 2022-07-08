import { config } from 'dotenv'

// load .env file
config()

import type { Database } from '@ddradar/core'
import { Song } from '@ddradar/core'
import { getContainer } from '@ddradar/db'
import consola from 'consola'

import { fetchSongs } from './modules/database'

const gradeMap = new Map([
  [1, '初段'],
  [2, '二段'],
  [3, '三段'],
  [4, '四段'],
  [5, '五段'],
  [6, '六段'],
  [7, '七段'],
  [8, '八段'],
  [9, '九段'],
  [10, '十段'],
  [11, '皆伝'],
] as const)

const grade = {
  /** Course id */
  id: '',
  /** Course index (1:初段, 2:二段, ..., 11:皆伝) */
  index: 1,
  /** PlayStyle */
  playStyle: 1,
} as const
/** Course order (pair of songId & difficulty) */
const order = [
  { id: '', difficulty: 1 as Song.Difficulty }, // 1st
  { id: '', difficulty: 1 as Song.Difficulty }, // 2nd
  { id: '', difficulty: 1 as Song.Difficulty }, // 3rd
  { id: '', difficulty: 1 as Song.Difficulty }, // FINAL
]

/** Generate 段位認定 course data from each songs info. */
async function main() {
  if (!Song.isValidId(grade.id)) {
    consola.warn(`Invalid ID: ${grade.id}`)
    return
  }
  const playStyle = Song.playStyleMap.get(grade.playStyle)
  const name = gradeMap.get(grade.index) as string
  consola.ready(`Add ${name}(${playStyle}) (${grade.id})`)

  const songs = await fetchSongs(order.map(d => d.id))
  const charts = songs
    .map((s, i) =>
      (s.charts as Database.StepChartSchema[]).find(
        c =>
          c.playStyle === grade.playStyle &&
          c.difficulty === order[i].difficulty
      )
    )
    .filter((d): d is Database.StepChartSchema => !!d)

  if (charts.length !== 4) {
    consola.warn('Not found 4 charts. Please check has been registered.')
    return
  }

  for (let i = 0; i < 4; i++) {
    const diff = Song.difficultyMap.get(order[i].difficulty)
    consola.info(`${i + 1}: ${songs[i].name} (${playStyle}-${diff})`)
  }

  const zeroPadding = new Intl.NumberFormat(undefined, {
    minimumIntegerDigits: 2,
  })
  const course: Database.CourseSchema = {
    id: grade.id,
    name,
    nameIndex: -2,
    nameKana: `D-A3-${grade.playStyle}-${zeroPadding.format(grade.index)}`,
    series: 'DanceDanceRevolution A3',
    minBPM: Math.min(...songs.map(s => s.minBPM ?? 0)),
    maxBPM: Math.max(...songs.map(s => s.maxBPM ?? 0)),
    charts: [
      {
        playStyle: grade.playStyle,
        difficulty: 4,
        level: Math.max(...charts.map(c => c.level)),
        notes: charts.reduce((prev, curr) => prev + curr.notes, 0),
        freezeArrow: charts.reduce((prev, curr) => prev + curr.freezeArrow, 0),
        shockArrow: charts.reduce((prev, curr) => prev + curr.shockArrow, 0),
        order: charts.map((c, i) => ({
          songId: songs[i].id,
          songName: songs[i].name,
          playStyle: c.playStyle,
          difficulty: c.difficulty,
          level: c.level,
        })),
      },
    ],
  }
  await getContainer('Songs').items.create(course)

  consola.success(`Added ${name}(${playStyle}) (${grade.id})`)
}

// yarn start ./generate-grade.ts
main().catch(e => consola.error(e))
