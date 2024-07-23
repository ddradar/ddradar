import type { CosmosClient } from '@azure/cosmos'
import type { Song, StepChart } from '@ddradar/core'

import { databaseName, songContainer } from '../constants'
import type { DBSongSchema, DBSongSchemaWithCP } from '../schemas/songs'
import { dbSongSchema } from '../schemas/songs'
import type { QueryFilter } from '../utils'
import { generateQueryConditions } from '../utils'

const songSchemaToListMappings = [
  ['c.id', 'id'],
  ['c.name', 'name'],
  ['c.nameKana', 'nameKana'],
  ['c.cp_nameIndex', 'nameIndex'],
  ['c.artist', 'artist'],
  ['c.series', 'series'],
  ['c.minBPM', 'minBPM'],
  ['c.maxBPM', 'maxBPM'],
  ['c.cp_folders', 'folders'],
  ['c.deleted', 'deleted'],
] as const satisfies [`c.${keyof DBSongSchemaWithCP}`, keyof Song][]
/** Columns used for SELECT Song data list */
const songListColumns = songSchemaToListMappings
  .map(([schema, model]) => `${schema} AS ${model}`)
  .join(', ')

const songSchemaToModelMappings = [
  ...songSchemaToListMappings,
  ['c.charts', 'charts'],
  ['c.skillAttackId', 'skillAttackId'],
] as const satisfies [`c.${keyof DBSongSchemaWithCP}`, keyof Song][]
/** Columns used for SELECT Song data */
const songColumns = songSchemaToModelMappings
  .map(([schema, model]) => `${schema} AS ${model}`)
  .join(', ')

const chartSchemaToModelMappings = [
  ['s.id', 'id'],
  ['s.name', 'name'],
  ['s.nameKana', 'nameKana'],
  ['s.cp_nameIndex', 'nameIndex'],
  ['s.artist', 'artist'],
  ['s.series', 'series'],
  [
    'ARRAY_CONCAT(c.cp_folders, [{ type: "level", name: ToString(i.level) }])',
    'folders',
  ],
  ['c.playStyle', 'playStyle'],
  ['c.difficulty', 'difficulty'],
  ['c.level', 'level'],
  ['c.notes', 'notes'],
] as const satisfies [
  `s.${keyof DBSongSchemaWithCP}` | `c.${keyof StepChart}` | string,
  keyof Song | keyof StepChart,
][]
/** Columns used for SELECT StepChart data */
const chartColumns = chartSchemaToModelMappings
  .map(([schema, model]) => `${schema} AS ${model}`)
  .join(', ')

const orderBy = 'ORDER BY c.cp_nameIndex, c.nameKana'

/**
 * Repository for Song & chart data.
 */
export class SongRepository {
  /**
   * Create a new repository instance.
   * @param client Cosmos DB client
   */
  constructor(private readonly client: CosmosClient) {}

  /**
   * Get song data by ID.
   * @param id Song ID
   * @returns Song data
   */
  async get(id: string): Promise<Song | undefined> {
    const { resources } = await this.client
      .database(databaseName)
      .container(songContainer)
      .items.query<Song>(
        {
          query: `SELECT TOP 1 ${songColumns} FROM c WHERE c.id = @id`,
          parameters: [{ name: '@id', value: id }],
        },
        { maxItemCount: 1 }
      )
      .fetchNext()
    return resources[0]
  }

  /**
   * Get song list that matches the conditions.
   * @param conditions Filtering conditions.
   * @returns Song list that matches the conditions.
   */
  async list(
    conditions: QueryFilter<DBSongSchemaWithCP>[]
  ): Promise<Omit<Song, 'charts' | 'skillAttackId'>[]> {
    const { queryConditions, parameters } = generateQueryConditions(conditions)
    const { resources } = await this.client
      .database(databaseName)
      .container(songContainer)
      .items.query<Song>({
        query: `SELECT ${songListColumns} FROM c${queryConditions ? ` WHERE ${queryConditions}` : ''} ${orderBy}`,
        parameters,
      })
      .fetchAll()
    return resources
  }

  /**
   * Get chart list that matches the conditions.
   * @param conditions Filtering conditions.
   * @returns Chart list that matches the conditions.
   */
  async listCharts(
    conditions: (
      | QueryFilter<DBSongSchemaWithCP, 's'>
      | QueryFilter<StepChart>
    )[]
  ): Promise<(Omit<Song, 'minBPM' | 'maxBPM' | 'charts'> & StepChart)[]> {
    const { queryConditions, parameters } = generateQueryConditions(conditions)
    const { resources } = await this.client
      .database(databaseName)
      .container(songContainer)
      .items.query<Omit<Song, 'minBPM' | 'maxBPM' | 'charts'> & StepChart>({
        query: `SELECT ${chartColumns} FROM s JOIN c IN s.charts${queryConditions ? ` WHERE ${queryConditions}` : ''} ${orderBy}`,
        parameters,
      })
      .fetchAll()
    return resources
  }

  /**
   * Count chart data grouped by playStyle and level.
   * @returns Chart count grouped by playStyle and level.
   */
  async countCharts(): Promise<
    (Pick<StepChart, 'playStyle' | 'level'> & { count: number })[]
  > {
    const { resources } = await this.client
      .database(databaseName)
      .container(songContainer)
      .items.query<Pick<StepChart, 'playStyle' | 'level'> & { count: number }>({
        query:
          'SELECT c.playStyle, c.level, COUNT(1) AS count ' +
          'FROM s JOIN c IN s.charts ' +
          'WHERE NOT (IS_DEFINED(s.deleted) AND s.deleted = true) ' +
          'GROUP BY c.playStyle, c.level',
      })
      .fetchAll()
    return resources
  }

  /**
   * Update or insert song data.
   * @remarks
   * - Not supported to update `id` property.
   * @param song Song body
   */
  async upsert(song: DBSongSchema): Promise<void> {
    const doc = dbSongSchema.parse(song)
    await this.client
      .database(databaseName)
      .container(songContainer)
      .items.upsert(doc)
  }
}
