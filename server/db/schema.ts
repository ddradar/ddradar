import { relations, sql } from 'drizzle-orm'
import {
  index,
  int,
  primaryKey,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core'

const timestamps = {
  createdAt: int('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`strftime('%s', 'now')`),
  updatedAt: int('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`strftime('%s', 'now')`),
  deletedAt: int('deleted_at', { mode: 'timestamp' })
    .$type<Date | null>()
    .default(null),
}
export type TimestampColumn = keyof typeof timestamps

export const songs = sqliteTable(
  'songs',
  {
    /**
     * ID that depend on official site.
     * @pattern /^[01689bdiloqDIOPQ]{32}$/
     */
    id: text('id', { length: 32 }).primaryKey(),
    /** Song name */
    name: text('name').notNull(),
    /** Furigana for sorting. (allows A-Z, 0-9, space, period, _, ぁ-ん, ー) */
    nameKana: text('name_kana').notNull(),
    /**
     * Calculate from `nameKana`.
     * `0`: あ行, `1`: か行, ..., `10`: A, `11`: B, ..., `35`: Z, `36`: 数字・記号
     */
    nameIndex: int('name_index')
      .$type<NameIndex>()
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
    artist: text('artist').notNull(),
    /** Displayed BPM (use DDR GRAND PRIX, A3 or earlier) */
    bpm: text('bpm'),
    /** Series title depend on official site. */
    series: text('series').$type<SeriesFolder>().notNull(),
    /**
     * Flare skill category.
     * @description Calculate from {@link Song.series}.
     */
    seriesCategory: text('series_category')
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

export const charts = sqliteTable(
  'charts',
  {
    /** Song ID */
    id: text('id')
      .notNull()
      .references(() => songs.id),
    /**
     * Play style
     * @description `1`: SINGLE, `2`: DOUBLE
     */
    playStyle: int('play_style').$type<PlayStyle>().notNull(),
    /** Difficulty (0: BEGINNER, 1: BASIC, 2: DIFFICULT, 3: EXPERT, 4: CHALLENGE) */
    difficulty: int('difficulty').$type<Difficulty>().notNull(),
    /**
     * Chart BPM range.
     * - 1-tuple: [fixed BPM]
     * - 3-tuple: [Min BPM, Core BPM, Max BPM]
     */
    bpm: text('bpm', { mode: 'json' }).$type<number[]>().notNull(),
    /** Chart level (1-20) */
    level: int('level').notNull(),
    /** Normal arrow count. (Jump = 1 count) */
    notes: int('notes'),
    /** Freeze Arrow count. */
    freezes: int('freezes'),
    /** Shock Arrow count. */
    shocks: int('shocks').default(0),
    /** Groove Radar data (if available) */
    radar: text('radar', { mode: 'json' }).$type<GrooveRadar | null>(),
    ...timestamps,
  },
  table => [
    primaryKey({ columns: [table.id, table.playStyle, table.difficulty] }),
    index('idx_style_level').on(table.playStyle, table.level),
  ]
)

export const songRelations = relations(songs, ({ many }) => ({
  charts: many(charts),
}))

export const chartRelations = relations(charts, ({ one }) => ({
  song: one(songs, {
    fields: [charts.id],
    references: [songs.id],
  }),
}))
