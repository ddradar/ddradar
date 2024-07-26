import type { CosmosClient } from '@azure/cosmos'
import type { Song, StepChart } from '@ddradar/core'

import { databaseName, songContainer } from '../constants'
import type {
  DBSongSchema,
  DBSongSchemaWithCP as DBSchema,
} from '../schemas/songs'
import { dbSongSchema } from '../schemas/songs'
import type { Column, FuncColumn, QueryFilter } from '../utils'
import { generateQueryConditions } from '../utils'

const orderBy = 'ORDER BY c.cp_nameIndex, c.nameKana'

type DBColumn<T, Alias extends string = 'c'> = Column<DBSchema, T, Alias>

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
    const columns: DBColumn<Song>[] = [
      'c.id',
      'c.name',
      'c.nameKana',
      'c.cp_nameIndex AS nameIndex',
      'c.artist',
      'c.series',
      'c.minBPM',
      'c.maxBPM',
      'c.cp_folders AS folders',
      'c.charts',
      'c.skillAttackId',
      'c.deleted',
    ]
    const { resources } = await this.client
      .database(databaseName)
      .container(songContainer)
      .items.query<Song>(
        {
          query: `SELECT TOP 1 ${columns.join(', ')} FROM c WHERE c.id = @id`,
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
    conditions: QueryFilter<DBSchema>[]
  ): Promise<Omit<Song, 'charts' | 'skillAttackId'>[]> {
    const columns: DBColumn<Omit<Song, 'charts' | 'skillAttackId'>>[] = [
      'c.id',
      'c.name',
      'c.nameKana',
      'c.cp_nameIndex AS nameIndex',
      'c.artist',
      'c.series',
      'c.minBPM',
      'c.maxBPM',
      'c.cp_folders AS folders',
      'c.deleted',
    ]
    const { queryConditions, parameters } = generateQueryConditions(conditions)
    const { resources } = await this.client
      .database(databaseName)
      .container(songContainer)
      .items.query<Song>({
        query: `SELECT ${columns.join(', ')} FROM c${queryConditions ? ` WHERE ${queryConditions}` : ''} ${orderBy}`,
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
    conditions: (QueryFilter<DBSchema, 's'> | QueryFilter<StepChart>)[]
  ): Promise<(Omit<Song, 'minBPM' | 'maxBPM' | 'charts'> & StepChart)[]> {
    const columns: (
      | DBColumn<Omit<Song, 'minBPM' | 'maxBPM' | 'charts' | 'folders'>, 's'>
      | Column<StepChart>
      | FuncColumn<DBSchema, Pick<Song, 'folders'>, 's'>
    )[] = [
      's.id',
      's.name',
      's.nameKana',
      's.cp_nameIndex AS nameIndex',
      's.artist',
      's.series',
      'ARRAY_CONCAT(s.cp_folders, [{ type: "level", name: ToString(c.level) }]) AS folders',
      'c.playStyle',
      'c.difficulty',
      'c.bpm',
      'c.level',
      'c.notes',
      'c.freezeArrow',
      'c.shockArrow',
    ]
    const { queryConditions, parameters } = generateQueryConditions(conditions)
    const { resources } = await this.client
      .database(databaseName)
      .container(songContainer)
      .items.query<Omit<Song, 'minBPM' | 'maxBPM' | 'charts'> & StepChart>({
        query: `SELECT ${columns.join(', ')} FROM s JOIN c IN s.charts${queryConditions ? ` WHERE ${queryConditions}` : ''} ${orderBy}`,
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
