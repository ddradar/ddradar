import type { Database } from '@ddradar/core'

export type SongInfo = Omit<Database.SongSchema, 'skillAttackId'>

/* GraphQL */
export const getByPKQuery = `
query getById($id: ID!) {
  song_by_pk(id: $id) {
    id
    name
    nameKana
    nameIndex
    artist
    series
    minBPM
    maxBPM
    charts {
      playStyle
      difficulty
      level
      notes
      freezeArrow
      shockArrow
      stream
      voltage
      air
      freeze
      chaos
    }
    deleted
  }
}`

export default async function useSongInfo(id: string) {
  return await useLazyAsyncData(
    `/songs/${id}`,
    () => callGraphQL<{ song_by_pk: SongInfo }>(getByPKQuery, { id }),
    { transform: s => s.data.song_by_pk, server: false }
  )
}
