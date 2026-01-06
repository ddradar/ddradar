import { relations, sql } from 'drizzle-orm'
import {
  index,
  int,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'

import type { ClearLamp, FlareRank } from '~~/shared/schemas/score'
import type {
  NameIndex,
  SeriesCategory,
  SeriesFolder,
} from '~~/shared/schemas/song'
import type { Difficulty, PlayStyle } from '~~/shared/schemas/step-chart'
import type { Area } from '~~/shared/schemas/user'

const timestamps = {
  createdAt: int({ mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: int({ mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`)
    .$onUpdate(() => sql`(strftime('%s', 'now'))`),
  deletedAt: int({ mode: 'timestamp' })
    .$type<Date | null>()
    .default(sql`NULL`),
}
export type TimestampColumn = keyof typeof timestamps

// #region Tables
/** DB schema for `Song` */
export const songs = sqliteTable(
  'songs',
  {
    /**
     * ID that depend on official site.
     * @pattern /^[01689bdiloqDIOPQ]{32}$/
     */
    id: text({ length: 32 }).primaryKey(),
    /** Song name */
    name: text().notNull(),
    /** Furigana for sorting. (allows A-Z, 0-9, space, period, _, ぁ-ん, ー) */
    nameKana: text().notNull(),
    /**
     * Calculate from `nameKana`.
     * `0`: あ行, `1`: か行, ..., `10`: A, `11`: B, ..., `35`: Z, `36`: 数字・記号
     */
    nameIndex: int()
      .$type<ValueOf<typeof NameIndex>>()
      .generatedAlwaysAs(
        sql`CASE
      WHEN name_kana GLOB '[ぁ-おゔ]*' THEN 0
      WHEN name_kana GLOB '[か-ごゕ-ゖ]*' THEN 1
      WHEN name_kana GLOB '[さ-ぞ]*' THEN 2
      WHEN name_kana GLOB '[た-ど]*' THEN 3
      WHEN name_kana GLOB '[な-の]*' THEN 4
      WHEN name_kana GLOB '[は-ぽ]*' THEN 5
      WHEN name_kana GLOB '[ま-も]*' THEN 6
      WHEN name_kana GLOB '[ゃ-よ]*' THEN 7
      WHEN name_kana GLOB '[ら-ろ]*' THEN 8
      WHEN name_kana GLOB '[ゎ-ん]*' THEN 9
      WHEN name_kana GLOB '[aA]*' THEN 10
      WHEN name_kana GLOB '[bB]*' THEN 11
      WHEN name_kana GLOB '[cC]*' THEN 12
      WHEN name_kana GLOB '[dD]*' THEN 13
      WHEN name_kana GLOB '[eE]*' THEN 14
      WHEN name_kana GLOB '[fF]*' THEN 15
      WHEN name_kana GLOB '[gG]*' THEN 16
      WHEN name_kana GLOB '[hH]*' THEN 17
      WHEN name_kana GLOB '[iI]*' THEN 18
      WHEN name_kana GLOB '[jJ]*' THEN 19
      WHEN name_kana GLOB '[kK]*' THEN 20
      WHEN name_kana GLOB '[lL]*' THEN 21
      WHEN name_kana GLOB '[mM]*' THEN 22
      WHEN name_kana GLOB '[nN]*' THEN 23
      WHEN name_kana GLOB '[oO]*' THEN 24
      WHEN name_kana GLOB '[pP]*' THEN 25
      WHEN name_kana GLOB '[qQ]*' THEN 26
      WHEN name_kana GLOB '[rR]*' THEN 27
      WHEN name_kana GLOB '[sS]*' THEN 28
      WHEN name_kana GLOB '[tT]*' THEN 29
      WHEN name_kana GLOB '[uU]*' THEN 30
      WHEN name_kana GLOB '[vV]*' THEN 31
      WHEN name_kana GLOB '[wW]*' THEN 32
      WHEN name_kana GLOB '[xX]*' THEN 33
      WHEN name_kana GLOB '[yY]*' THEN 34
      WHEN name_kana GLOB '[zZ]*' THEN 35
      ELSE 36
    END`
      )
      .notNull(),
    /** Artist (possibly empty) */
    artist: text().notNull(),
    /** Displayed BPM (use DDR GRAND PRIX, A3 or earlier) */
    bpm: text(),
    /** Series title depend on official site. */
    series: text().$type<SeriesFolder>().notNull(),
    /**
     * Flare skill category.
     * @description Calculate from {@link Song.series}.
     */
    seriesCategory: text()
      .$type<SeriesCategory>()
      .generatedAlwaysAs(
        sql`CASE
      WHEN series IN (
        'DDR 1st',
        'DDR 2ndMIX',
        'DDR 3rdMIX',
        'DDR 4thMIX',
        'DDR 5thMIX',
        'DDRMAX',
        'DDRMAX2',
        'DDR EXTREME',
        'DDR SuperNOVA',
        'DDR SuperNOVAA2',
        'DDR X',
        'DDR X2',
        'DDR X3 VS 2ndMIX'
      ) THEN 'CLASSIC'
      WHEN series IN ('DDR (2013)', 'DDR (2014)', 'DDR A') THEN 'WHITE'
      ELSE 'GOLD'
    END`
      )
      .notNull(),
    ...timestamps,
  },
  table => [index('idx_name').on(table.nameIndex, table.nameKana)]
)

/** DB schema for `StepChart` */
export const charts = sqliteTable(
  'charts',
  {
    /** Song ID */
    id: text()
      .notNull()
      .references(() => songs.id),
    /**
     * Play style
     * @description `1`: SINGLE, `2`: DOUBLE
     */
    playStyle: int().$type<ValueOf<typeof PlayStyle>>().notNull(),
    /**
     * Difficulty
     * @description `0`: BEGINNER, `1`: BASIC, `2`: DIFFICULT, `3`: EXPERT, `4`: CHALLENGE
     */
    difficulty: int().$type<ValueOf<typeof Difficulty>>().notNull(),
    /**
     * Chart BPM range.
     * - 1-tuple: [fixed BPM]
     * - 3-tuple: [Min BPM, Core BPM, Max BPM]
     */
    bpm: text({ mode: 'json' })
      .$type<[number] | [number, number, number]>()
      .notNull(),
    /** Chart level (1-20) */
    level: int().notNull(),
    /** Normal arrow count. (Jump = 1 count) */
    notes: int(),
    /** Freeze Arrow count. */
    freezes: int(),
    /** Shock Arrow count. */
    shocks: int().default(0),
    /** Groove Radar data (if available) */
    radar: text({ mode: 'json' }).$type<GrooveRadar | null>(),
    ...timestamps,
  },
  table => [
    primaryKey({ columns: [table.id, table.playStyle, table.difficulty] }),
    index('idx_style_level').on(table.playStyle, table.level),
  ]
)

/** DB schema for `ScoreRecord` */
export const scores = sqliteTable(
  'scores',
  {
    /** Song ID */
    songId: text().notNull(),
    /**
     * Play style
     * @description `1`: SINGLE, `2`: DOUBLE
     */
    playStyle: int().$type<ValueOf<typeof PlayStyle>>().notNull(),
    /**
     * Difficulty
     * @description `0`: BEGINNER, `1`: BASIC, `2`: DIFFICULT, `3`: EXPERT, `4`: CHALLENGE
     */
    difficulty: int().$type<ValueOf<typeof Difficulty>>().notNull(),
    /** User ID */
    userId: text()
      .notNull()
      .references(() => users.id),
    /** Normal Score (0-1,000,000) */
    normalScore: int().notNull(),
    /** EX Score */
    exScore: int(),
    /** Max Combo */
    maxCombo: int(),
    /**
     * Clear Lamp
     * @description
     * - `0`: Failed
     * - `1`: Assisted Clear
     * - `2`: Clear
     * - `3`: Life 4
     * - `4`: Full Combo (Good FC)
     * - `5`: Great Full Combo
     * - `6`: Perfect Full Combo
     * - `7`: Marvelous Full Combo
     */
    clearLamp: int().$type<ValueOf<typeof ClearLamp>>().notNull(),
    /** Dance Level ("AAA", "AA+", "AA", "AA-", ..., "D+", "D", "E") */
    rank: text().$type<DanceLevel>().notNull(),
    /**
     * Flare Rank
     * @description
     * - `0`: No FLARE
     * - `1`: FLARE I
     * - `2`: FLARE II
     * - `3`: FLARE III
     * - `4`: FLARE IV
     * - `5`: FLARE V
     * - `6`: FLARE VI
     * - `7`: FLARE VII
     * - `8`: FLARE VIII
     * - `9`: FLARE IX
     * - `10`: FLARE EX
     */
    flareRank: int().$type<ValueOf<typeof FlareRank>>().notNull(),
    /** Flare Skill */
    flareSkill: int(),
    ...timestamps,
  },
  table => [
    primaryKey({
      columns: [table.songId, table.playStyle, table.difficulty, table.userId],
    }),
  ]
)

/** DB schema for `User` */
export const users = sqliteTable(
  'users',
  {
    /** User ID */
    id: text().primaryKey(),
    /** Display name */
    name: text().notNull(),
    /** Login provider */
    provider: text().notNull(),
    /** Provider ID */
    providerId: text().notNull(),
    /** User & score visibility */
    isPublic: int({ mode: 'boolean' }).notNull(),
    /** User area */
    area: int()
      .$type<ValueOf<typeof Area>>()
      .notNull()
      .$default(() => 0),
    /** DDR code */
    ddrCode: int(),
    /** User roles */
    roles: text({ mode: 'json' })
      .$type<string[]>()
      .notNull()
      .$default(() => []),
    ...timestamps,
  },
  table => [uniqueIndex('idx_provider').on(table.provider, table.providerId)]
)
// #endregion Tables

// #region Relations
export const songRelations = relations(songs, ({ many }) => ({
  charts: many(charts),
}))

export const chartRelations = relations(charts, ({ one }) => ({
  song: one(songs, {
    fields: [charts.id],
    references: [songs.id],
  }),
}))

export const scoreChartRelations = relations(scores, ({ one }) => ({
  chart: one(charts, {
    fields: [scores.songId, scores.playStyle, scores.difficulty],
    references: [charts.id, charts.playStyle, charts.difficulty],
  }),
}))

export const scoreSongRelations = relations(scores, ({ one }) => ({
  song: one(songs, {
    fields: [scores.songId],
    references: [songs.id],
  }),
}))

export const scoreUserRelations = relations(scores, ({ one }) => ({
  user: one(users, {
    fields: [scores.userId],
    references: [users.id],
  }),
}))

export const userRelations = relations(users, ({ many }) => ({
  scores: many(scores),
}))
// #endregion Relations
