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
export const testSongList: Omit<SongSchema, 'charts'>[] = [
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
