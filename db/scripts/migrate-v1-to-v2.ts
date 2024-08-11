import 'dotenv/config'

import { CosmosClient } from '@azure/cosmos'
import type { Series, Song, User, UserScoreRecord } from '@ddradar/core'
import { difficultyMap, playStyleMap } from '@ddradar/core'
import consola from 'consola'

import { SongRepository, UserRepository } from '../src'
import {
  databaseName,
  notificationContainer,
  scoreContainer,
  songContainer,
} from '../src/constants'
import type { DBNotificationSchema } from '../src/schemas/notification'
import type { DBScoreSchema } from '../src/schemas/scores'
import type { DBSongSchema } from '../src/schemas/songs'
import type { ContainerPath } from '../src/utils'

const connectionString = process.env.COSMOS_DB_CONN

const oldContainerMap = new Map<string, string>([
  [songContainer, 'Songs'],
  [scoreContainer, 'Scores'],
])

async function run() {
  if (!connectionString) {
    consola.error('Environment variable "COSMOS_DB_CONN" is required.')
    return
  }

  const client = new CosmosClient(connectionString)

  const { resources } = await client
    .database(databaseName)
    .containers.readAll()
    .fetchAll()

  if (resources.some(c => c.id === oldContainerMap.get(songContainer)!)) {
    await migrateSongs(client)
  }
  if (resources.some(c => c.id === oldContainerMap.get(scoreContainer)!)) {
    await migrateScores(client)
  }
  await migrateNotification(client)
}

run().catch(consola.error)

/**
 * Migrate Songs container from V1 to V2.
 * @param client Cosmos DB client
 */
async function migrateSongs(client: CosmosClient) {
  const oldContainerName = oldContainerMap.get(songContainer)!
  const logger = consola.withTag(oldContainerName)
  const oldContainer = client.database(databaseName).container(oldContainerName)
  const destContainer = client.database(databaseName).container(songContainer)

  logger.start('Migrating...')
  for await (const { resources } of oldContainer.items
    .readAll<SongSchemaV1 | CourseSchemaV1>()
    .getAsyncIterator()) {
    for (const songOrCource of resources) {
      // Course data
      if (isCourseSchemaV1(songOrCource)) {
        logger.info(`Skipped Course: ${songOrCource.name}`)
        continue
      }

      // Song V1 data
      await destContainer.items.upsert<DBSongSchema>({
        id: songOrCource.id,
        type: 'song',
        name: songOrCource.name,
        nameKana: songOrCource.nameKana,
        artist: songOrCource.artist,
        series: songOrCource.series,
        minBPM: songOrCource.minBPM,
        maxBPM: songOrCource.maxBPM,
        folders: [],
        charts: songOrCource.charts.map(c => ({
          playStyle: c.playStyle,
          difficulty: c.difficulty,
          bpm: [songOrCource.minBPM, songOrCource.maxBPM, songOrCource.maxBPM],
          level: c.level,
          notes: c.notes,
          freezeArrow: c.freezeArrow,
          shockArrow: c.shockArrow,
        })),
        skillAttackId: songOrCource.skillAttackId,
        deleted: songOrCource.deleted,
      })
      logger.success(`Migrated: ${songOrCource.name}`)
    }
  }
  logger.success('Migration completed!')

  function isCourseSchemaV1(
    songOrCource: SongSchemaV1 | CourseSchemaV1
  ): songOrCource is CourseSchemaV1 {
    return songOrCource.nameIndex === -1 || songOrCource.nameIndex === -2
  }

  /** Old Song schema */
  type SongSchemaV1 = {
    id: string
    name: string
    nameKana: string
    nameIndex: Song['nameIndex']
    artist: string
    series: Series
    minBPM: number
    maxBPM: number
    charts: {
      playStyle: Song['charts'][number]['playStyle']
      difficulty: Song['charts'][number]['difficulty']
      level: number
      notes: number
      freezeArrow: number
      shockArrow: number
      voltage: number
      stream: number
      air: number
      freeze: number
      chaos: number
    }[]
    skillAttackId?: number
    deleted?: boolean
  }
  /** Old Course schema */
  type CourseSchemaV1 = {
    id: string
    name: string
    nameKana: string
    nameIndex: -1 | -2
  }
}

/**
 * Migrate Scores container from V1 to V2.
 * @param client Cosmos DB client
 */
async function migrateScores(client: CosmosClient) {
  const oldContainerName = oldContainerMap.get(scoreContainer)!
  const logger = consola.withTag(oldContainerName)
  const oldContainer = client.database(databaseName).container(oldContainerName)
  const destContainer = client.database(databaseName).container(scoreContainer)
  const songRepo = new SongRepository(client)
  const userRepo = new UserRepository(client)

  logger.start('Migrating...')

  /** Cache song data */
  const songMap = new Map<string, Song>()
  /** Cache user data */
  const userMap = new Map<string, User>()
  for await (const { resources } of oldContainer.items
    .readAll<ScoreSchemaV1>()
    .getAsyncIterator()) {
    for (const score of resources) {
      const song =
        songMap.get(score.songId) ??
        songMap
          .set(score.songId, (await songRepo.get(score.songId))!)
          .get(score.songId)!
      const user =
        userMap.get(score.userId) ??
        userMap
          .set(score.userId, (await userRepo.get(score.userId))!)
          .get(score.userId)!
      const { level } = song.charts.find(
        c =>
          c.playStyle === score.playStyle && c.difficulty === score.difficulty
      )!

      await destContainer.items.upsert<DBScoreSchema>({
        id: `${score.songId}/${score.playStyle}/${score.difficulty}/${score.userId}`,
        type: 'score',
        song: {
          id: score.songId,
          name: song.name,
          seriesCategory: song.seriesCategory,
          deleted: song.deleted,
        },
        chart: {
          playStyle: score.playStyle,
          difficulty: score.difficulty,
          level,
        },
        user: {
          id: score.userId,
          name: user?.name ?? score.userId,
          area: user?.area ?? (parseInt(score.userId, 10) as User['area']),
          isPublic: user?.isPublic ?? false,
        },
        score: score.score,
        clearLamp: score.clearLamp,
        rank: score.rank,
        exScore: score.exScore,
        maxCombo: score.maxCombo,
      })
      logger.success(
        `Migrated: { user: "${score.userName}", song: "${song.name}" chart: (${playStyleMap.get(score.playStyle)} ${difficultyMap.get(score.difficulty)}) }`
      )
    }
  }
  logger.success('Migration completed!')

  type ScoreSchemaV1 = Omit<UserScoreRecord, 'flareRank' | 'flareSkill'> & {
    id: string
    isPublic: boolean
    deleted?: boolean
  }
}

/**
 * Migrate Notification container from V1 to V2.
 * @param client Cosmos DB client
 */
async function migrateNotification(client: CosmosClient) {
  const logger = consola.withTag(notificationContainer)
  const container = client
    .database(databaseName)
    .container(notificationContainer)

  logger.start('Migrating...')

  const { resources } = await container.items
    .query<NotificationSchemaV1>(
      'SELECT * FROM c WHERE c.type != "notification"'
    )
    .fetchAll()

  const colorMap: Map<
    NotificationSchemaV1['type'],
    DBNotificationSchema['color']
  > = new Map([
    ['is-success', 'green'],
    ['is-warning', 'yellow'],
    ['is-danger', 'red'],
  ])
  const iconMap = new Map([
    ['upload', 'i-heroicons-arrow-up-tray-16-solid'],
    ['twitter', 'i-simple-icons-x'],
    ['music-box-multiple', 'i-heroicons-musical-note-solid'],
    ['music-box', 'i-heroicons-musical-note-solid'],
    ['music', 'i-heroicons-musical-note-solid'],
    ['microphone', 'i-heroicons-microphone-solid'],
    ['folder-music', 'i-heroicons-musical-note-solid'],
  ])
  for (const notification of resources) {
    await container.item(notification.id, notification.sender).patch([
      {
        op: 'replace',
        path: '/type' satisfies ContainerPath<DBNotificationSchema>,
        value: 'notification' satisfies DBNotificationSchema['type'],
      },
      {
        op: 'set',
        path: '/color' satisfies ContainerPath<DBNotificationSchema>,
        value: (colorMap.get(notification.type) ??
          'blue') satisfies DBNotificationSchema['color'],
      },
      {
        op: 'set',
        path: '/icon' satisfies ContainerPath<DBNotificationSchema>,
        value: iconMap.get(notification.icon) ?? '',
      },
    ])
    logger.success(`Migrated: ${notification.title}`)
  }

  logger.success('Migration completed!')

  type NotificationSchemaV1 = Omit<DBNotificationSchema, 'type' | 'color'> & {
    type: 'is-info' | 'is-success' | 'is-warning' | 'is-danger'
    icon: string
  }
}
