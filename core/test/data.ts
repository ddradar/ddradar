import type { Notification } from '../src/notification'
import type { UserScoreRecord } from '../src/score'
import type { Song } from '../src/song'
import type { User } from '../src/user'

/** PARANOiA song info (charts are only SP/BEG & SP/BAS) */
export const testSongData: Song = {
  id: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
  name: 'PARANOiA',
  nameKana: 'PARANOIA',
  nameIndex: 25,
  artist: '180',
  series: 'DDR 1st',
  seriesCategory: 'CLASSIC',
  minBPM: 180,
  maxBPM: 180,
  folders: [
    { type: 'category', name: 'CLASSIC' },
    { type: 'name', name: 'P' },
    { type: 'series', name: '1st-5th' },
  ],
  charts: [
    {
      playStyle: 1,
      difficulty: 0,
      bpm: [170, 180, 184],
      level: 4,
      notes: 138,
      freezeArrow: 0,
      shockArrow: 0,
    },
    {
      playStyle: 1,
      difficulty: 1,
      bpm: [170, 180, 184],
      level: 8,
      notes: 264,
      freezeArrow: 0,
      shockArrow: 0,
    },
  ],
}

/** PARANOiA, PARANOiA(X-Special), SP-TRIP MACHINE～JUNGLE MIX～(X-Special) */
export const testSongList: Omit<
  Song,
  'charts' | 'skillAttackId' | 'seriesCategory'
>[] = [
  {
    id: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
    name: 'PARANOiA',
    nameKana: 'PARANOIA',
    nameIndex: 25,
    artist: '180',
    series: 'DDR 1st',
    folders: [],
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
    folders: [],
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
    folders: [],
    minBPM: 160,
    maxBPM: 160,
  },
]

//#region User
/** { isPublic: true, area: 13 (Tokyo), code: 10000000 } user */
export const publicUser: User = {
  id: 'public_user',
  name: 'Public User',
  area: 13,
  code: 10000000,
  isPublic: true,
}

/** { isPublic: true, area: 0, code: undefined } user */
export const areaHiddenUser: User = {
  id: 'area_hidden_user',
  name: 'Area Hidden User',
  area: 0,
  isPublic: true,
}

/** { isPublic: false, area: 13 (Tokyo), code: undefined } user */
export const privateUser: User = {
  id: 'private_user',
  name: 'Private User',
  area: 0,
  isPublic: false,
}

/** { isPublic: false, area: 13 (Tokyo), code: undefined } user */
export const noPasswordUser: User = {
  id: 'no_password_user',
  name: 'No password User',
  area: 0,
  isPublic: false,
}
//#endregion

//#region Notification
/** Sample Notification data */
export const notification: Notification = {
  id: 'foo',
  color: 'blue',
  icon: 'i-heroicons-musical-note',
  title: '新曲を追加しました',
  body: '下記の譜面情報を追加しました。\n\n- [新曲](/song/foo)',
  /** 2020/8/13 0:00 (UTC) */
  timeStamp: 1597276800,
}

/** Sample Notification list data */
export const notifications: readonly Notification[] = [
  notification,
  {
    ...notification,
    id: 'bar',
    color: 'yellow',
    icon: 'i-heroicons-exclamation-triangle',
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
]
//#endregion

//#region UserScoreRecord
const scoreTemplate = {
  songId: testSongData.id,
  songName: testSongData.name,
  playStyle: testSongData.charts[0]!.playStyle,
  difficulty: testSongData.charts[0]!.difficulty,
  level: testSongData.charts[0]!.level,
  score: 970630, // P:28, Gr:10
  clearLamp: 5,
  rank: 'AA+',
  maxCombo: 138,
  exScore: 366,
} as const
export const testScores: UserScoreRecord[] = [
  {
    userId: '0',
    userName: '0',
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
    ...scoreTemplate,
  },
  {
    userId: areaHiddenUser.id,
    userName: areaHiddenUser.name,
    ...scoreTemplate,
  },
  {
    userId: privateUser.id,
    userName: privateUser.name,
    ...scoreTemplate,
  },
]
//#endregion
