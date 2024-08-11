import type { CosmosClient, FeedOptions } from '@azure/cosmos'
import type {
  ScoreRecord,
  Song,
  StepChart,
  User,
  UserScoreRecord,
} from '@ddradar/core'
import { isValidScore } from '@ddradar/core'

import { databaseName, scoreContainer, songContainer } from '../constants'
import { type DBScoreSchema, dbScoreSchema } from '../schemas/scores'
import type { DBSongSchemaWithCP } from '../schemas/songs'
import type { Column, QueryFilter } from '../utils'
import { generateQueryConditions } from '../utils'

type DBColumn<T = DBScoreSchema> = Column<DBScoreSchema, T>

/**
 * Repository for Score data.
 */
export class ScoreRepository {
  /**
   * Create a new repository instance.
   * @param client Cosmos DB client
   */
  constructor(private readonly client: CosmosClient) {}

  /**
   * Get score data by ID.
   * @param songId Song ID
   * @param playStyle PlayStyle
   * @param difficulty Difficulty
   * @param userId User ID
   * @returns Score data
   */
  async get(
    songId: Song['id'],
    playStyle: StepChart['playStyle'],
    difficulty: StepChart['difficulty'],
    userId: User['id']
  ): Promise<ScoreRecord | undefined> {
    const columns: DBColumn<ScoreRecord>[] = [
      'c.score',
      'c.clearLamp',
      'c.rank',
      'c.exScore',
      'c.maxCombo',
      'c.flareRank',
      'c.flareSkill',
    ]
    const { resources } = await this.client
      .database(databaseName)
      .container(scoreContainer)
      .items.query<ScoreRecord>(
        {
          query: `SELECT TOP 1 ${columns.join(', ')} FROM c WHERE c.id = @id AND c.song.id = @songId AND c.type = "score"`,
          parameters: [
            {
              name: '@id',
              value: `${songId}/${playStyle}/${difficulty}/${userId}`,
            },
            { name: '@songId', value: songId },
          ],
        },
        { maxItemCount: 1 }
      )
      .fetchNext()
    return resources[0]
  }

  /**
   * Get score list that matches the conditions.
   * @param conditions Filtering conditions.
   * @param user User info to get area top & non-public data.
   * @returns Score list that matches the conditions.
   */
  async list(
    conditions: QueryFilter<DBScoreSchema>[],
    orderBy:
      | `${DBColumn} ${'ASC' | 'DESC'}`
      | 'c.score DESC, c.clearLamp DESC, c._ts ASC' = 'c.score DESC, c.clearLamp DESC, c._ts ASC'
  ): Promise<UserScoreRecord[]> {
    const { resources } = await this.queryInner(conditions, orderBy).fetchAll()
    return resources
  }

  /**
   * Get score list that contains total flare skill.
   * @param userId User ID
   * @param seriesCategory "CLASSIC", "WHITE" or "GOLD"
   * @param playStyle 1: SINGLE, 2: DOUBLE
   * @returns Score list (up to 30).
   */
  async listFlareSkills(
    userId: User['id'],
    seriesCategory: Song['seriesCategory'],
    playStyle: StepChart['playStyle']
  ): Promise<UserScoreRecord[]> {
    const { resources } = await this.queryInner(
      [
        { condition: 'c.user.id = @', value: userId },
        { condition: 'c.song.seriesCategory = @', value: seriesCategory },
        { condition: 'c.chart.playStyle = @', value: playStyle },
        { condition: 'IS_DEFINED(c.flareSkill)' },
      ],
      'c.flareSkill DESC, c._ts ASC',
      { maxItemCount: 30 }
    ).fetchNext()
    return resources
  }

  async count<T extends { count: number }>(
    summaryColumns: DBColumn<T>[],
    conditions: QueryFilter<DBScoreSchema>[],
    user?: Pick<User, 'id' | 'area'>
  ): Promise<T[]> {
    const { queryConditions, parameters } = generateQueryConditions([
      { condition: 'c.type = "score"' },
      {
        condition: 'c.user.isPublic OR ARRAY_CONTAINS(@, c.user.id)',
        value: ['0', ...(user ? [user.id, `${user.area}`] : [])],
      },
      ...conditions,
    ])
    const { resources } = await this.client
      .database(databaseName)
      .container(scoreContainer)
      .items.query<T>({
        query: `SELECT ${summaryColumns.join(', ')}, COUNT(1) AS count FROM c WHERE ${queryConditions} GROUP BY ${summaryColumns.join(', ')}`,
        parameters,
      })
      .fetchAll()
    return resources
  }

  /**
   * Update or insert user score data.
   * @remarks This method also updates area top & world tops scores.
   * @param user User info
   * @param songId Song ID
   * @param playStyle PlayStyle
   * @param difficulty Difficulty
   * @param score Score data
   */
  async upsert(
    user: Omit<User, 'code'>,
    songId: Song['id'],
    playStyle: StepChart['playStyle'],
    difficulty: StepChart['difficulty'],
    score: ScoreRecord
  ): Promise<DBScoreSchema> {
    // Get song and chart info
    const columns: (
      | Column<
          DBSongSchemaWithCP,
          Pick<Song, 'id' | 'name' | 'seriesCategory' | 'deleted'>,
          's'
        >
      | Column<StepChart>
    )[] = [
      's.id',
      's.name',
      's.cp_seriesCategory AS seriesCategory',
      's.deleted',
      'c.level',
      'c.notes',
      'c.freezeArrow',
      'c.shockArrow',
    ]
    const { queryConditions, parameters } = generateQueryConditions([
      { condition: 's.id = @', value: songId },
      { condition: 'c.playStyle = @', value: playStyle },
      { condition: 'c.difficulty = @', value: difficulty },
    ])
    const songAndChart = (
      await this.client
        .database(databaseName)
        .container(songContainer)
        .items.query<
          Pick<Song, 'id' | 'name' | 'seriesCategory' | 'deleted'> &
            Omit<StepChart, 'playStyle' | 'difficulty' | 'bpm'>
        >(
          {
            query: `SELECT ${columns.join(', ')} FROM s JOIN c IN s.charts WHERE ${queryConditions}`,
            parameters,
          },
          { maxItemCount: 1 }
        )
        .fetchNext()
    ).resources[0]
    if (!songAndChart) throw new Error('Song or StepChart not found')

    if (!isValidScore(songAndChart, score)) throw new Error('Invalid score')

    const { resource } = await this.client
      .database(databaseName)
      .container(scoreContainer)
      .items.upsert<DBScoreSchema>(
        dbScoreSchema.parse({
          id: `${songId}/${playStyle}/${difficulty}/${user.id}`,
          type: 'score',
          user: {
            id: user.id,
            name: user.name,
            isPublic: user.isPublic,
            area: user.area,
          },
          song: {
            id: songAndChart.id,
            name: songAndChart.name,
            seriesCategory: songAndChart.seriesCategory,
            deleted: songAndChart.deleted,
          },
          chart: {
            playStyle,
            difficulty,
            level: songAndChart.level,
          },
          score: score.score,
          clearLamp: score.clearLamp,
          rank: score.rank,
          exScore: score.exScore,
          maxCombo: score.maxCombo,
          flareRank: score.flareRank,
          flareSkill: score.flareSkill,
        })
      )
    return resource!
  }

  async delete(
    userId: User['id'],
    songId: Song['id'],
    playStyle: StepChart['playStyle'],
    difficulty: StepChart['difficulty']
  ): Promise<void> {
    await this.client
      .database(databaseName)
      .container(scoreContainer)
      .item(`${songId}/${playStyle}/${difficulty}/${userId}`, songId)
      .delete()
  }

  private queryInner(
    conditions: QueryFilter<DBScoreSchema>[],
    orderBy: string,
    options?: FeedOptions
  ) {
    const columns: DBColumn<UserScoreRecord>[] = [
      'c.user.id AS userId',
      'c.user.name AS userName',
      'c.song.id AS songId',
      'c.song.name AS songName',
      'c.chart.playStyle AS playStyle',
      'c.chart.difficulty AS difficulty',
      'c.chart.level AS level',
      'c.score',
      'c.clearLamp',
      'c.rank',
      'c.exScore',
      'c.maxCombo',
      'c.flareRank',
      'c.flareSkill',
    ]
    const { queryConditions, parameters } = generateQueryConditions([
      { condition: 'c.type = "score"' },
      ...conditions,
    ])
    return this.client
      .database(databaseName)
      .container(scoreContainer)
      .items.query<UserScoreRecord>(
        {
          query: `SELECT ${columns.join(', ')} FROM c WHERE ${queryConditions} ORDER BY ${orderBy}`,
          parameters,
        },
        options
      )
  }
}
