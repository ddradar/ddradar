import type { SongListData } from '../src/api/song'
import type { NotificationSchema } from '../src/db/notification'
import type { ScoreSchema } from '../src/db/scores'
import type { CourseSchema, SongSchema } from '../src/db/songs'

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

//#region CourseSchema
/** TWENTY course info */
export const testCourseData: CourseSchema = {
  id: 'I90bQ81P1blOPIdd9PPl6I9D8DQ1dIob',
  name: 'TWENTY',
  nameKana: 'C-A20-2',
  nameIndex: -1,
  series: 'DanceDanceRevolution A20',
  minBPM: 128,
  maxBPM: 180,
  charts: [
    {
      playStyle: 1,
      difficulty: 0,
      level: 4,
      notes: 438,
      freezeArrow: 26,
      shockArrow: 0,
      order: [
        {
          songId: 'PdPdbdQ1lDI18O90Q0li8QI0bo99bidd',
          songName: 'This Beat Is.....',
          playStyle: 1,
          difficulty: 0,
          level: 1,
        },
        {
          songId: 'PPQb966D6Ql6Q8iPo68810PdDiI6D0bl',
          songName: 'Waiting',
          playStyle: 1,
          difficulty: 0,
          level: 3,
        },
        {
          songId: '6iO8d9ld00I6lDIO6qbOldP99oqloqb9',
          songName: 'Dead Heat',
          playStyle: 1,
          difficulty: 0,
          level: 4,
        },
        {
          songId: '1iDPo19Pb9ooi8OqiidbqPb06DDdqiqo',
          songName: 'Neverland',
          playStyle: 1,
          difficulty: 0,
          level: 4,
        },
      ],
    },
    {
      playStyle: 1,
      difficulty: 1,
      level: 8,
      notes: 782,
      freezeArrow: 36,
      shockArrow: 0,
      order: [
        {
          songId: 'PdPdbdQ1lDI18O90Q0li8QI0bo99bidd',
          songName: 'This Beat Is.....',
          playStyle: 1,
          difficulty: 1,
          level: 4,
        },
        {
          songId: 'PPQb966D6Ql6Q8iPo68810PdDiI6D0bl',
          songName: 'Waiting',
          playStyle: 1,
          difficulty: 1,
          level: 6,
        },
        {
          songId: '6iO8d9ld00I6lDIO6qbOldP99oqloqb9',
          songName: 'Dead Heat',
          playStyle: 1,
          difficulty: 1,
          level: 6,
        },
        {
          songId: '1iDPo19Pb9ooi8OqiidbqPb06DDdqiqo',
          songName: 'Neverland',
          playStyle: 1,
          difficulty: 1,
          level: 8,
        },
      ],
    },
    {
      playStyle: 1,
      difficulty: 2,
      level: 12,
      notes: 1146,
      freezeArrow: 56,
      shockArrow: 0,
      order: [
        {
          songId: 'PdPdbdQ1lDI18O90Q0li8QI0bo99bidd',
          songName: 'This Beat Is.....',
          playStyle: 1,
          difficulty: 2,
          level: 7,
        },
        {
          songId: 'PPQb966D6Ql6Q8iPo68810PdDiI6D0bl',
          songName: 'Waiting',
          playStyle: 1,
          difficulty: 2,
          level: 10,
        },
        {
          songId: '6iO8d9ld00I6lDIO6qbOldP99oqloqb9',
          songName: 'Dead Heat',
          playStyle: 1,
          difficulty: 2,
          level: 10,
        },
        {
          songId: '1iDPo19Pb9ooi8OqiidbqPb06DDdqiqo',
          songName: 'Neverland',
          playStyle: 1,
          difficulty: 2,
          level: 12,
        },
      ],
    },
    {
      playStyle: 1,
      difficulty: 3,
      level: 15,
      notes: 1557,
      freezeArrow: 58,
      shockArrow: 0,
      order: [
        {
          songId: 'PdPdbdQ1lDI18O90Q0li8QI0bo99bidd',
          songName: 'This Beat Is.....',
          playStyle: 1,
          difficulty: 3,
          level: 11,
        },
        {
          songId: 'PPQb966D6Ql6Q8iPo68810PdDiI6D0bl',
          songName: 'Waiting',
          playStyle: 1,
          difficulty: 3,
          level: 13,
        },
        {
          songId: '6iO8d9ld00I6lDIO6qbOldP99oqloqb9',
          songName: 'Dead Heat',
          playStyle: 1,
          difficulty: 3,
          level: 14,
        },
        {
          songId: '1iDPo19Pb9ooi8OqiidbqPb06DDdqiqo',
          songName: 'Neverland',
          playStyle: 1,
          difficulty: 3,
          level: 15,
        },
      ],
    },
    {
      playStyle: 2,
      difficulty: 1,
      level: 8,
      notes: 761,
      freezeArrow: 45,
      shockArrow: 0,
      order: [
        {
          songId: 'PdPdbdQ1lDI18O90Q0li8QI0bo99bidd',
          songName: 'This Beat Is.....',
          playStyle: 2,
          difficulty: 1,
          level: 4,
        },
        {
          songId: 'PPQb966D6Ql6Q8iPo68810PdDiI6D0bl',
          songName: 'Waiting',
          playStyle: 2,
          difficulty: 1,
          level: 7,
        },
        {
          songId: '6iO8d9ld00I6lDIO6qbOldP99oqloqb9',
          songName: 'Dead Heat',
          playStyle: 2,
          difficulty: 1,
          level: 6,
        },
        {
          songId: '1iDPo19Pb9ooi8OqiidbqPb06DDdqiqo',
          songName: 'Neverland',
          playStyle: 2,
          difficulty: 1,
          level: 8,
        },
      ],
    },
    {
      playStyle: 2,
      difficulty: 2,
      level: 12,
      notes: 1123,
      freezeArrow: 41,
      shockArrow: 0,
      order: [
        {
          songId: 'PdPdbdQ1lDI18O90Q0li8QI0bo99bidd',
          songName: 'This Beat Is.....',
          playStyle: 2,
          difficulty: 2,
          level: 7,
        },
        {
          songId: 'PPQb966D6Ql6Q8iPo68810PdDiI6D0bl',
          songName: 'Waiting',
          playStyle: 2,
          difficulty: 2,
          level: 10,
        },
        {
          songId: '6iO8d9ld00I6lDIO6qbOldP99oqloqb9',
          songName: 'Dead Heat',
          playStyle: 2,
          difficulty: 2,
          level: 10,
        },
        {
          songId: '1iDPo19Pb9ooi8OqiidbqPb06DDdqiqo',
          songName: 'Neverland',
          playStyle: 2,
          difficulty: 2,
          level: 12,
        },
      ],
    },
    {
      playStyle: 2,
      difficulty: 3,
      level: 14,
      notes: 1493,
      freezeArrow: 47,
      shockArrow: 0,
      order: [
        {
          songId: 'PdPdbdQ1lDI18O90Q0li8QI0bo99bidd',
          songName: 'This Beat Is.....',
          playStyle: 2,
          difficulty: 3,
          level: 10,
        },
        {
          songId: 'PPQb966D6Ql6Q8iPo68810PdDiI6D0bl',
          songName: 'Waiting',
          playStyle: 2,
          difficulty: 3,
          level: 13,
        },
        {
          songId: '6iO8d9ld00I6lDIO6qbOldP99oqloqb9',
          songName: 'Dead Heat',
          playStyle: 2,
          difficulty: 3,
          level: 14,
        },
        {
          songId: '1iDPo19Pb9ooi8OqiidbqPb06DDdqiqo',
          songName: 'Neverland',
          playStyle: 2,
          difficulty: 3,
          level: 14,
        },
      ],
    },
  ],
}
//#endregion

//#region UserSchema
/** { isPublic: true, area: 13 (Tokyo), code: 10000000 } user */
export const publicUser = {
  id: 'public_user',
  loginId: '1',
  name: 'Public User',
  area: 13,
  code: 10000000,
  isPublic: true,
  password: 'password',
} as const

/** { isPublic: true, area: 0, code: undefined } user */
export const areaHiddenUser = {
  id: 'area_hidden_user',
  loginId: 'area_hidden_user',
  name: 'Area Hidden User',
  area: 0,
  isPublic: true,
  password: 'password',
} as const

/** { isPublic: false, area: 13 (Tokyo), code: undefined } user */
export const privateUser = {
  id: 'private_user',
  loginId: 'private_user',
  name: 'Private User',
  area: 0,
  isPublic: false,
  password: 'password',
} as const

/** { isPublic: false, area: 13 (Tokyo), code: undefined } user */
export const noPasswordUser = {
  id: 'no_password_user',
  loginId: 'no_password_user',
  name: 'No password User',
  area: 0,
  isPublic: false,
} as const
//#endregion

//#region NotificationSchema
/** Sample Notification data */
export const notification = {
  id: 'foo',
  sender: 'SYSTEM',
  pinned: false,
  type: 'is-info',
  icon: 'info',
  title: '新曲を追加しました',
  body: '下記の譜面情報を追加しました。\n\n- [新曲](/song/foo)',
  /** 2020/8/13 0:00 (UTC) */
  timeStamp: 1597276800,
} as const

/** Sample Notification list data */
export const notifications: readonly NotificationSchema[] = [
  notification,
  {
    ...notification,
    id: 'bar',
    pinned: true,
    type: 'is-warning',
    icon: 'warning',
    title: 'このサイトはベータ版です',
    body: 'このWebサイトはベータ版環境です。',
    timeStamp: 1596250800,
  },
  {
    ...notification,
    id: 'baz',
    title: 'v0.6.0をリリースしました',
    body: '変更点は以下を参照してください。',
    timeStamp: 1597114800,
  },
] as const
//#endregion

//#region ScoreSchema
const scoreTemplate = {
  songId: testSongData.id,
  songName: testSongData.name,
  playStyle: testSongData.charts[0].playStyle,
  difficulty: testSongData.charts[0].difficulty,
  level: testSongData.charts[0].level,
  score: 970630, // P:28, Gr:10
  clearLamp: 5,
  rank: 'AA+',
  maxCombo: 138,
  exScore: 366,
} as const
export const testScores: ScoreSchema[] = [
  {
    userId: '0',
    userName: '0',
    isPublic: false,
    ...scoreTemplate,
    score: 999620, // P:38
    clearLamp: 6,
    rank: 'AAA',
    maxCombo: 138,
    exScore: 376,
  },
  {
    userId: '13',
    userName: '13',
    isPublic: false,
    ...scoreTemplate,
    score: 996720, // P:37, Gr:1
    clearLamp: 5,
    rank: 'AAA',
    maxCombo: 138,
    exScore: 375,
  },
  {
    userId: publicUser.id,
    userName: publicUser.name,
    isPublic: publicUser.isPublic,
    ...scoreTemplate,
  },
  {
    userId: areaHiddenUser.id,
    userName: areaHiddenUser.name,
    isPublic: areaHiddenUser.isPublic,
    ...scoreTemplate,
  },
  {
    userId: privateUser.id,
    userName: privateUser.name,
    isPublic: privateUser.isPublic,
    ...scoreTemplate,
  },
]
//#endregion
