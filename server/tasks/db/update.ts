import { db } from '@nuxthub/db'
import { charts } from '@nuxthub/db/schema'
import { and, eq, isNull, or, sql } from 'drizzle-orm'
import * as z from 'zod/mini'

import { chartEquals, Difficulty, PlayStyle } from '#shared/schemas/step-chart'
import { scrapeGrooveRadar, scrapeSongNotes } from '#shared/scrapes/bemani-wiki'

type PartialStepChart = Omit<
  StepChart,
  'bpm' | 'level' | 'notes' | 'freezes' | 'shocks' | 'radar'
> &
  Partial<Pick<StepChart, 'notes' | 'freezes' | 'shocks' | 'radar'>>

const runtimeConfigSchema = z.object({
  totalNotesUrl: z
    .string(
      'Invalid URL. Please check your `NUXT_BEMANI_WIKI_TOTAL_NOTES_URL` environment variable.'
    )
    .check(z.url()),
  grooveRadarSPUrl: z
    .string(
      'Invalid URL. Please check your `NUXT_BEMANI_WIKI_GROOVE_RADAR_SP_URL` environment variable.'
    )
    .check(z.url()),
  grooveRadarDPUrl: z
    .string(
      'Invalid URL. Please check your `NUXT_BEMANI_WIKI_GROOVE_RADAR_DP_URL` environment variable.'
    )
    .check(z.url()),
})

function mergeSongChartMaps(
  target: Map<string, PartialStepChart[]>,
  source: Map<string, PartialStepChart[]>
) {
  for (const [songName, chartDataList] of source) {
    const existingCharts = target.get(songName)
    if (!existingCharts) {
      target.set(songName, chartDataList)
      continue
    }
    for (const chartData of chartDataList) {
      const existingChart = existingCharts.find(c => chartEquals(c, chartData))
      if (!existingChart) {
        existingCharts.push(chartData)
        continue
      }
      existingChart.notes ??= chartData.notes
      existingChart.freezes ??= chartData.freezes
      existingChart.shocks ??= chartData.shocks
      existingChart.radar ??= chartData.radar
    }
  }
}

export default defineTask({
  meta: {
    name: 'db:update',
    description:
      'Update chart info (notes, freezes, shocks, radar) from BEMANIWiki 2nd.',
  },
  async run() {
    /** Charts that have missing note or radar information (grouped by song) */
    const noInfoSongs = await db.query.charts
      .findMany({
        columns: {
          id: true,
          playStyle: true,
          difficulty: true,
          notes: true,
          freezes: true,
          shocks: true,
          radar: true,
        },
        with: { song: { columns: { id: true, name: true } } },
        where: (charts, { isNull, or }) =>
          or(
            isNull(charts.notes),
            isNull(charts.freezes),
            isNull(charts.shocks),
            isNull(charts.radar)
          ),
      })
      .then(charts =>
        charts.reduce(
          (acc, chart) => {
            const song = acc.find(s => s.id === chart.id)
            if (song) {
              song.charts.push(chart)
              return acc
            }
            acc.push({
              id: chart.id,
              name: chart.song.name,
              charts: [chart],
            })
            return acc
          },
          [] as (Pick<SongInfo, 'id' | 'name'> & {
            charts: PartialStepChart[]
          })[]
        )
      )
    if (noInfoSongs.length === 0) {
      console.log('[SKIP] No charts with missing information found.')
      return {
        result: 'success',
        fetched: { songs: 0 },
        updated: { songs: 0, charts: 0 },
      }
    }

    // Get source URLs from config and validate
    const config = runtimeConfigSchema.safeParse(useRuntimeConfig().bemaniWiki)
    if (!config.success) {
      console.error('Invalid configuration:')
      console.error(config.error.message)
      return {
        result: 'failure',
        error: 'Invalid configuration: ' + config.error.message,
      }
    }
    const { totalNotesUrl, grooveRadarSPUrl, grooveRadarDPUrl } = config.data

    // Parse HTML pages with cheerio-based scrapers
    const totalNotesHtml = await $fetch<string>(totalNotesUrl, {
      responseType: 'text',
    })
    const wikiSongs: Map<string, PartialStepChart[]> =
      scrapeSongNotes(totalNotesHtml)
    // radar (SINGLE)
    const grooveRadarSPHtml = await $fetch<string>(grooveRadarSPUrl, {
      responseType: 'text',
    })
    mergeSongChartMaps(wikiSongs, scrapeGrooveRadar(grooveRadarSPHtml, 1))
    // radar (DOUBLE)
    const grooveRadarDPHtml = await $fetch<string>(grooveRadarDPUrl, {
      responseType: 'text',
    })
    mergeSongChartMaps(wikiSongs, scrapeGrooveRadar(grooveRadarDPHtml, 2))
    const fetched = { songs: wikiSongs.size }

    /** Song (`id`, `name`) collection to detect target `id` from `name` */
    const allSongs = await db.query.songs.findMany({
      columns: { id: true, name: true },
    })

    const updated = { songs: 0, charts: 0 }
    for (const [name, chartDataList] of wikiSongs) {
      const songCount = allSongs.filter(song => song.name === name).length
      if (songCount !== 1) {
        // Skip if no match or multiple matches found
        console.log(`[SKIP] ${songCount} matches found for: ${name}`)
        continue
      }

      const targetSong = noInfoSongs.find(s => s.name === name)
      if (!targetSong) {
        // No charts need updating
        continue
      }

      let updatedSongs = false
      for (const chart of targetSong.charts) {
        const wikiChart = chartDataList.find(c => chartEquals(c, chart))
        if (!wikiChart) continue

        const res = await db
          .update(charts)
          .set({
            notes: wikiChart.notes,
            freezes: wikiChart.freezes,
            shocks: wikiChart.shocks,
            radar: wikiChart.radar,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(charts.id, targetSong.id),
              eq(charts.playStyle, chart.playStyle),
              eq(charts.difficulty, chart.difficulty),
              or(
                wikiChart.notes != null ? isNull(charts.notes) : sql`1 = 2`,
                wikiChart.freezes != null ? isNull(charts.freezes) : sql`1 = 2`,
                wikiChart.shocks != null ? isNull(charts.shocks) : sql`1 = 2`,
                wikiChart.radar != null ? isNull(charts.radar) : sql`1 = 2`
              )
            )
          )
          .returning({
            id: charts.id,
            playStyle: charts.playStyle,
            difficulty: charts.difficulty,
          })

        if (res.length === 0) continue // No actual update
        await clearSongCache(targetSong.id, false)
        console.log(
          `[UPDATE] ${name} (${getEnumKey(PlayStyle, chart.playStyle)}/${getEnumKey(Difficulty, chart.difficulty)})`
        )
        updatedSongs ||= true
        updated.charts++
      }
      if (updatedSongs) updated.songs++
    }
    if (updated.charts > 0) await clearSongCache('', true)
    console.log(
      `Updated ${updated.charts} charts across ${updated.songs} songs.`
    )
    return { result: 'success', fetched, updated }
  },
})
