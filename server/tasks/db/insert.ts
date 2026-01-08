import type { D1Result } from '@cloudflare/workers-types'
import * as z from 'zod/mini'

import { seriesList } from '#shared/schemas/song'
import { Difficulty } from '#shared/schemas/step-chart'

const runtimeConfigSchema = z.object({
  ddrCardDrawJsonUrl: z
    .string(
      'Invalid URL. Please check your `NUXT_DDR_CARD_DRAW_JSON_URL` environment variable.'
    )
    .check(z.url()),
})

/**
 * Describes the shape of data that any individual json file under `src/songs` will conform to
 */
interface DDRCardDrawGameData {
  /**
   * Describes unique configuration options for this game
   */
  meta: {
    /**
     * If supplied, the parent folder name in the game select menu
     */
    menuParent?: string
    /**
     * Unix timestamp of last update to this data file
     */
    lastUpdated: number
    styles: string[]
    /**
     * List of all difficulty classes available
     */
    difficulties: {
      /**
       * A unique string key to identify this difficulty class
       */
      key: string
      /**
       * A css color to use to visually define this difficulty class
       */
      color: string
    }[]
    flags: string[]
    folders: string[]
    usesDrawGroups?: boolean
    /**
     * Number of steps from one level to the next when using the `sanbaiTier` granular levels
     */
    granularTierResolution?: number
  }
  songs: DDRCardDrawSong[]
}
interface DDRCardDrawSong {
  flags?: string[]
  name: string
  artist: string
  genre?: string
  artist_translation?: string
  bpm: string
  name_translation?: string
  search_hint?: string
  date_added?: string
  charts: DDRCardDrawChart[]
  jacket: string
  folder?: string
  saHash?: string
  saIndex?: string
  remyLink?: string
}
interface DDRCardDrawChart {
  flags?: string[]
  /**
   * e.g. single/double
   */
  style: string
  /**
   * e.g. expert/challenge
   */
  diffClass: string
  /**
   * in-game numeric rating
   */
  lvl: number
  /**
   * a more granular rating sourced from 3icecream, calculated based on community performance
   */
  sanbaiTier?: number
  /**
   * tournament-specific grouping of charts (e.g. tier)
   */
  drawGroup?: number
  step?: number
  shock?: number
  freeze?: number
  jacket?: string
  author?: string
  /**
   * per-chart BPM range, if one applies
   */
  bpm?: string
}

export default defineTask({
  meta: {
    name: 'db:insert',
    description: 'Insert new song data into database from DDRCardDraw data',
  },
  async run() {
    // Get source URL from config and validate
    const config = runtimeConfigSchema.safeParse(useRuntimeConfig())
    if (!config.success) {
      console.error('Invalid configuration:')
      console.error(config.error.message)
      return {
        result: 'failure',
        error: 'Invalid configuration: ' + config.error.message,
      }
    }

    const data = await $fetch<DDRCardDrawGameData>(
      config.data.ddrCardDrawJsonUrl,
      { responseType: 'json' }
    )
    const hasChallengeChartIds = (
      await db.query.songs.findMany({
        columns: { id: true },
        with: {
          charts: {
            where: (charts, { eq }) =>
              eq(charts.difficulty, Difficulty.CHALLENGE),
          },
        },
        where: (_, { isNull, sql }) => isNull(sql`charts`),
      })
    ).map(s => s.id)

    const newSongsOrCharts = data.songs.filter(
      song => song.saHash && !hasChallengeChartIds.includes(song.saHash)
    )
    const series = data.meta.folders.reverse()
    const insertedCounts = await Promise.all(
      newSongsOrCharts.map(async song => {
        const songRes: D1Result = await db
          .insert(schema.songs)
          .values({
            id: song.saHash!,
            name: song.name,
            nameKana: song.name.toUpperCase(),
            artist: song.artist,
            bpm: song.bpm,
            series: seriesList.at(series.indexOf(song.folder!))!,
          })
          .onConflictDoNothing()
        if (songRes.results.length > 0)
          console.log(`Added song: ${song.name} (${song.saHash})`)

        // New songs or CHALLENGE charts for existing songs only
        const charts = song.charts.filter(
          c =>
            songRes.results.length > 0 ||
            data.meta.difficulties.findIndex(d => d.key === c.diffClass) ===
              Difficulty.CHALLENGE
        )
        if (charts.length === 0) return songRes.results.length
        const chartRes: D1Result = await db
          .insert(schema.charts)
          .values(
            charts.map(c => ({
              id: song.saHash!,
              playStyle: c.style.toLowerCase() === 'double' ? 2 : 1,
              difficulty: data.meta.difficulties.findIndex(
                d => d.key === c.diffClass
              ),
              level: +c.lvl,
              bpm: parseBPM(c.bpm ?? song.bpm),
              notes: c.step,
              freezes: c.freeze,
              shocks: c.shock,
            }))
          )
          .onConflictDoNothing()
        if (chartRes.results.length > 0)
          console.log(
            `Added ${chartRes.results.length} chart(s) for ${song.name}`
          )
        const count = songRes.results.length + chartRes.results.length
        if (count) await clearSongCache(song.saHash!, false)
        return count

        function parseBPM(
          bpm: string | undefined
        ): [number] | [number, number, number] {
          if (!bpm) return [0]
          const parts = bpm.split('-').map(part => parseInt(part, 10))
          if (parts.length === 1) {
            return [parts[0]]
          } else {
            return [parts[0], parts[1], parts[1]]
          }
        }
      })
    )
    const totalInserted = insertedCounts.reduce((a, b) => a + b, 0)
    if (totalInserted > 0) await clearSongCache('', true)

    return { result: 'success', inserted: totalInserted }
  },
})
