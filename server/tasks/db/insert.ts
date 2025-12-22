import * as z from 'zod/mini'

import { cacheName as getSongByIdKey } from '~~/server/api/songs/[id]/index.get'
import { cacheName as getSongListKey } from '~~/server/api/songs/index.get'
import { seriesList } from '~~/shared/types/song'

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
    const existsIds = (
      await db.query.songs.findMany({
        columns: { id: true },
      })
    ).map(s => s.id)

    const newSongs = data.songs.filter(
      song => song.saHash && !existsIds.includes(song.saHash)
    )
    const series = data.meta.folders.reverse()
    await Promise.all(
      newSongs.map(async song => {
        await db.batch([
          db
            .insert(schema.songs)
            .values({
              id: song.saHash!,
              name: song.name,
              nameKana: song.name.toUpperCase(),
              artist: song.artist,
              bpm: song.bpm,
              series: seriesList.at(series.indexOf(song.folder!))!,
            })
            .onConflictDoNothing(),
          db
            .insert(schema.charts)
            .values(
              song.charts.map(c => ({
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
            .onConflictDoNothing(),
        ])
        // Clear cache for Song API
        await useStorage('cache').removeItem(
          `nitro:handler:${getSongByIdKey}:${song.saHash}.json`
        )
        console.log(`Added song: ${song.name} (${song.saHash})`)

        function parseBPM(bpm: string | undefined): number[] {
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
    // Clear cache for Song API
    if (newSongs.length)
      await useStorage('cache').removeItem(`nitro:handler:${getSongListKey}`)

    return { result: 'success', inserted: newSongs.length }
  },
})
