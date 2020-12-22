import type { SongListData } from '../api/song'
import type { SongSchema } from '../db/songs'

/** PARANOiA song info (charts are only SP/BEG & SP/BAS) */
export const testSongData: SongSchema = {
  id: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
  name: 'PARANOiA',
  nameKana: 'PARANOIA',
  nameIndex: 25,
  artist: '180',
  series: 'DDR 1st',
  minBPM: 180,
  maxBPM: 180,
  charts: [
    {
      playStyle: 1,
      difficulty: 0,
      level: 4,
      notes: 138,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 29,
      voltage: 22,
      air: 5,
      freeze: 0,
      chaos: 0,
    },
    {
      playStyle: 1,
      difficulty: 1,
      level: 8,
      notes: 264,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 56,
      voltage: 44,
      air: 18,
      freeze: 0,
      chaos: 4,
    },
  ],
}

/** PARANOiA, PARANOiA(X-Special), SP-TRIP MACHINE～JUNGLE MIX～(X-Special) */
export const testSongList: SongListData[] = [
  {
    id: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
    name: 'PARANOiA',
    nameKana: 'PARANOIA',
    nameIndex: 25,
    artist: '180',
    series: 'DDR 1st',
    minBPM: 180,
    maxBPM: 180,
  },
  {
    id: 'I8bQ8ilD9l1Qi9Q9iI0q6qqqiolo01QP',
    name: 'PARANOiA(X-Special)',
    nameKana: 'PARANOIA X SPECIAL',
    nameIndex: 25,
    artist: '180',
    series: 'DDR X',
    minBPM: 180,
    maxBPM: 180,
  },
  {
    id: 'dDO8ili1081QQIb86POQ8qd0P111011o',
    name: 'SP-TRIP MACHINE～JUNGLE MIX～(X-Special)',
    nameKana: 'SP TRIP MACHINE JUNGLE MIX X SPECIAL',
    nameIndex: 28,
    artist: 'DE-SIRE',
    series: 'DDR X',
    minBPM: 160,
    maxBPM: 160,
  },
]

/** { isPublic: true, area: 13 (Tokyo), code: 10000000 } user */
export const publicUser = {
  id: 'public_user',
  loginId: '1',
  name: 'Public User',
  area: 13,
  code: 10000000,
  isPublic: true,
} as const

/** { isPublic: true, area: 0, code: undefined } user */
export const areaHiddenUser = {
  id: 'area_hidden_user',
  loginId: 'area_hidden_user',
  name: 'Area Hidden User',
  area: 0,
  isPublic: true,
} as const

/** { isPublic: false, area: 13 (Tokyo), code: undefined } user */
export const privateUser = {
  id: 'private_user',
  loginId: '2',
  name: 'Private User',
  area: 0,
  isPublic: false,
} as const
