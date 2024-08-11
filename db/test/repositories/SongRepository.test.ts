import type { CosmosClient } from '@azure/cosmos'
import { testSongData, testSongList } from '@ddradar/core/test/data'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { SongRepository } from '../../src/repositories/SongRepository'

describe('/repositories/SongRepository', () => {
  const client = {
    database: vi.fn().mockReturnThis(),
    container: vi.fn().mockReturnThis(),
    items: {
      query: vi.fn().mockReturnThis(),
      fetchNext: vi.fn(),
      fetchAll: vi.fn(),
      upsert: vi.fn(),
    },
    item: vi.fn().mockReturnThis(),
  }
  beforeEach(() => {
    client.items.query.mockClear()
    client.items.fetchNext.mockClear()
    client.items.fetchAll.mockClear()
    client.items.upsert.mockClear()
  })

  describe('get', () => {
    test('calls items.query()', async () => {
      // Arrange
      client.items.fetchNext.mockResolvedValue({ resources: [testSongData] })

      // Act
      const repository = new SongRepository(client as unknown as CosmosClient)
      const result = await repository.get(testSongData.id)

      // Assert
      expect(result).toEqual(testSongData)
      expect(client.items.query).toBeCalledWith(
        {
          query:
            'SELECT TOP 1 c.id, c.name, c.nameKana, c.cp_nameIndex AS nameIndex, c.artist, ' +
            'c.series, c.cp_seriesCategory AS seriesCategory, c.minBPM, c.maxBPM, c.cp_folders AS folders, ' +
            'c.charts, c.skillAttackId, c.deleted ' +
            'FROM c WHERE c.id = @id',
          parameters: [{ name: '@id', value: testSongData.id }],
        },
        { maxItemCount: 1 }
      )
    })
  })
  describe('list', () => {
    test('calls items.query()', async () => {
      // Arrange
      client.items.fetchAll.mockResolvedValue({ resources: testSongList })

      // Act
      const repository = new SongRepository(client as unknown as CosmosClient)
      const result = await repository.list(
        [{ condition: 'c.series = @', value: testSongData.series }],
        'c.cp_nameIndex ASC'
      )

      // Assert
      expect(result).toEqual(testSongList)
      expect(client.items.query).toBeCalledWith({
        query:
          'SELECT c.id, c.name, c.nameKana, c.cp_nameIndex AS nameIndex, c.artist, ' +
          'c.series, c.cp_seriesCategory AS seriesCategory, c.minBPM, c.maxBPM, c.cp_folders AS folders, c.deleted ' +
          'FROM c WHERE (c.type = "song") AND (c.series = @param1) ' +
          'ORDER BY c.cp_nameIndex ASC',
        parameters: [{ name: '@param1', value: testSongData.series }],
      })
    })
  })
  describe('listCharts', () => {
    test('calls items.query()', async () => {
      // Arrange
      const resources = testSongData.charts.map(d => ({
        id: testSongData.id,
        name: testSongData.name,
        nameKana: testSongData.nameKana,
        nameIndex: testSongData.nameIndex,
        artist: testSongData.artist,
        series: testSongData.series,
        seriesCategory: testSongData.seriesCategory,
        folders: testSongData.folders,
        deleted: testSongData.deleted,
        ...d,
      }))
      client.items.fetchAll.mockResolvedValue({ resources })

      // Act
      const repository = new SongRepository(client as unknown as CosmosClient)
      const result = await repository.listCharts([
        { condition: 's.id = @', value: testSongData.id },
      ])

      // Assert
      expect(result).toStrictEqual(resources)
      expect(client.items.query).toBeCalledWith({
        query:
          'SELECT s.id, s.name, s.nameKana, s.cp_nameIndex AS nameIndex, s.artist, s.series, ' +
          's.cp_seriesCategory AS seriesCategory, ARRAY_CONCAT(s.cp_folders, [{ type: "level", name: ToString(c.level) }]) AS folders, ' +
          'c.playStyle, c.difficulty, c.bpm, c.level, c.notes, c.freezeArrow, c.shockArrow ' +
          'FROM s JOIN c IN s.charts WHERE (s.type = "song") AND (s.id = @param1) ' +
          'ORDER BY s.cp_nameIndex ASC, s.nameKana ASC',
        parameters: [{ name: '@param1', value: testSongData.id }],
      })
    })
  })
  describe('countCharts', () => {
    test('calls items.query()', async () => {
      // Arrange
      const resources = [...Array(19).keys()].flatMap(i =>
        [1, 2].map(playStyle => ({ playStyle, level: i + 1, count: 10 }))
      )
      client.items.fetchAll.mockResolvedValue({ resources })

      // Act
      const repository = new SongRepository(client as unknown as CosmosClient)
      const result = await repository.countCharts()

      // Assert
      expect(result).toStrictEqual(resources)
      expect(client.items.query).toBeCalledWith({
        query:
          'SELECT c.playStyle, c.level, COUNT(1) AS count ' +
          'FROM s JOIN c IN s.charts ' +
          'WHERE NOT (IS_DEFINED(s.deleted) AND s.deleted = true) ' +
          'GROUP BY c.playStyle, c.level',
      })
    })
  })
  describe('upsert', () => {
    test('calls items.upsert()', async () => {
      // Arrange
      const song = {
        ...{
          ...testSongData,
          type: 'song' as const,
          nameIndex: undefined,
          seriesCategory: undefined,
        },
      }
      client.items.upsert.mockResolvedValue({ resource: song })

      // Act
      const repository = new SongRepository(client as unknown as CosmosClient)
      await repository.upsert(song)

      // Assert
      expect(client.items.upsert).toBeCalledWith(song)
    })
  })
})
