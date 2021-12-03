import type { Api, Song } from '@ddradar/core'
import { ref, useContext, useFetch } from '@nuxtjs/composition-api'

const apiPrefix = '/api/v1'

/**
 * Use "Search Song" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/songs--get/
 */
export function useSongList(nameIndex?: number, seriesIndex?: number) {
  // Data
  const songs = ref<Api.SongListData[]>([])

  // Lifecycle
  const { $http } = useContext()
  const { fetch } = useFetch(async () => {
    const searchParams = new URLSearchParams()
    if (nameIndex !== undefined) searchParams.append('name', `${nameIndex}`)
    if (seriesIndex !== undefined)
      searchParams.append('series', `${seriesIndex}`)
    songs.value = await $http.$get<Api.SongListData[]>(`${apiPrefix}/songs`, {
      searchParams,
    })
  })

  return { songs, fetch }
}

/**
 * Use "Search Charts" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/charts__style__level/
 */
export function useChartList(playStyle: Song.PlayStyle, level: number) {
  // Data
  const charts = ref<Api.ChartInfo[]>([])

  // Lifecycle
  const { $http } = useContext()
  const { fetch } = useFetch(async () => {
    charts.value = await $http.$get<Api.ChartInfo[]>(
      `${apiPrefix}/charts/${playStyle}/${level}`
    )
  })

  return { charts, fetch }
}

/**
 * Use "Get Song Information" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/songs__id/
 */
export function useSongInfo(id: string) {
  // Data
  const song = ref<Api.SongInfo | null>(null)

  // Lifecycle
  const { $http } = useContext()
  const { fetch } = useFetch(async () => {
    song.value = await $http.$get<Api.SongInfo>(`${apiPrefix}/songs/${id}`)
  })

  return { song, fetch }
}
