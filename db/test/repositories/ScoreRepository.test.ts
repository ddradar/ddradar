import type { CosmosClient } from '@azure/cosmos'
import { isValidScore, type ScoreRecord } from '@ddradar/core'
import { publicUser, testScores, testSongData } from '@ddradar/core/test/data'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { ScoreRepository } from '../../src/repositories/ScoreRepository'

vi.mock('@ddradar/core', async actual => ({
  ...((await actual()) as object),
  isValidScore: vi.fn(),
}))

describe('/repositories/ScoreRepository', () => {
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
    delete: vi.fn(),
  }
  beforeEach(() => {
    client.items.query.mockClear()
    client.items.fetchNext.mockClear()
    client.items.fetchAll.mockClear()
    client.items.upsert.mockClear()
    client.item.mockClear()
    client.delete.mockClear()
    vi.mocked(isValidScore).mockClear()
  })

  describe('get', () => {
    test('calls query().fetchNext()', async () => {
      // Arrange
      const score: ScoreRecord = {
        score: testScores[0].score,
        exScore: testScores[0].exScore,
        clearLamp: testScores[0].clearLamp,
        rank: testScores[0].rank,
        maxCombo: testScores[0].maxCombo,
      }
      const { songId, playStyle, difficulty, userId } = testScores[0]
      client.items.fetchNext.mockResolvedValueOnce({ resources: [score] })

      // Act
      const repo = new ScoreRepository(client as unknown as CosmosClient)
      const result = await repo.get(songId, playStyle, difficulty, userId)

      // Assert
      expect(result).toStrictEqual(score)
      expect(client.items.query).toBeCalledWith(
        {
          query:
            `SELECT TOP 1 c.score, c.clearLamp, c.rank, c.exScore, c.maxCombo, c.flareRank, c.flareSkill ` +
            `FROM c WHERE c.id = @id AND c.song.id = @songId AND c.type = "score"`,
          parameters: [
            {
              name: '@id',
              value: `${songId}/${playStyle}/${difficulty}/${userId}`,
            },
            { name: '@songId', value: testScores[0].songId },
          ],
        },
        { maxItemCount: 1 }
      )
    })
  })
  describe('list', () => {
    test('calls query().fetchAll()', async () => {
      // Arrange
      client.items.fetchAll.mockResolvedValueOnce({ resources: testScores })

      // Act
      const repo = new ScoreRepository(client as unknown as CosmosClient)
      const result = await repo.list([
        { condition: 'c.user.id = @', value: testScores[0].userId },
      ])

      // Assert
      expect(result).toStrictEqual(testScores)
      expect(client.items.query).toBeCalledWith(
        {
          query:
            `SELECT c.user.id AS userId, c.user.name AS userName, c.song.id AS songId, ` +
            `c.song.name AS songName, c.chart.playStyle AS playStyle, c.chart.difficulty AS difficulty, ` +
            `c.chart.level AS level, c.score, c.clearLamp, c.rank, c.exScore, c.maxCombo, c.flareRank, c.flareSkill ` +
            `FROM c WHERE (c.type = "score") AND (c.user.id = @param1) ` +
            'ORDER BY c.score DESC, c.clearLamp DESC, c._ts ASC',
          parameters: [{ name: '@param1', value: testScores[0].userId }],
        },
        undefined
      )
      expect(client.items.fetchAll).toBeCalled()
    })
  })
  describe('listFlareSkills', () => {
    test('calls query().fetchNext()', async () => {
      // Arrange
      client.items.fetchNext.mockResolvedValueOnce({ resources: testScores })
      const { playStyle, userId } = testScores[0]

      // Act
      const repo = new ScoreRepository(client as unknown as CosmosClient)
      const result = await repo.listFlareSkills(userId, 'CLASSIC', playStyle)

      // Assert
      expect(result).toStrictEqual(testScores)
      expect(client.items.query).toBeCalledWith(
        {
          query:
            'SELECT c.user.id AS userId, c.user.name AS userName, c.song.id AS songId, ' +
            'c.song.name AS songName, c.chart.playStyle AS playStyle, c.chart.difficulty AS difficulty, ' +
            'c.chart.level AS level, c.score, c.clearLamp, c.rank, c.exScore, c.maxCombo, c.flareRank, c.flareSkill ' +
            'FROM c WHERE (c.type = "score") AND (c.user.id = @param1) AND (c.song.seriesCategory = @param2) ' +
            'AND (c.chart.playStyle = @param3) AND (IS_DEFINED(c.flareSkill)) ' +
            'ORDER BY c.flareSkill DESC, c._ts ASC',
          parameters: [
            { name: '@param1', value: userId },
            { name: '@param2', value: 'CLASSIC' },
            { name: '@param3', value: playStyle },
          ],
        },
        { maxItemCount: 30 }
      )
      expect(client.items.fetchNext).toBeCalled()
    })
  })
  describe('count', () => {
    test.each([
      [undefined, ['0']],
      [publicUser, ['0', publicUser.id, `${publicUser.area}`]],
    ])('calls query().fetchAll()', async (user, value) => {
      // Arrange
      const resources = [
        { clearLamp: testScores[0].clearLamp, count: testScores.length },
      ]
      client.items.fetchAll.mockResolvedValueOnce({ resources })

      // Act
      const repo = new ScoreRepository(client as unknown as CosmosClient)
      const result = await repo.count<(typeof resources)[number]>(
        ['c.clearLamp'],
        [{ condition: 'c.user.id = @', value: publicUser.id }],
        user
      )

      // Assert
      expect(result).toStrictEqual(resources)
      expect(client.items.query).toBeCalledWith({
        query:
          'SELECT c.clearLamp, COUNT(1) AS count ' +
          'FROM c WHERE (c.type = "score") AND (c.user.isPublic OR ARRAY_CONTAINS(@param1, c.user.id)) ' +
          'AND (c.user.id = @param2) ' +
          'GROUP BY c.clearLamp',
        parameters: [
          { name: '@param1', value },
          { name: '@param2', value: publicUser.id },
        ],
      })
      expect(client.items.fetchAll).toBeCalled()
    })
  })
  describe('upsert', () => {
    const { id: songId } = testSongData
    const { playStyle, difficulty } = testSongData.charts[0]
    const songAndChart = {
      id: songId,
      name: testSongData.name,
      seriesCategory: testSongData.seriesCategory,
      deleted: testSongData.deleted,
      level: testSongData.charts[0].level,
      notes: testSongData.charts[0].notes,
      freezeArrow: testSongData.charts[0].freezeArrow,
      shockArrow: testSongData.charts[0].shockArrow,
    }
    const score: ScoreRecord = {
      score: testScores[0].score,
      exScore: testScores[0].exScore,
      clearLamp: testScores[0].clearLamp,
      rank: testScores[0].rank,
      maxCombo: testScores[0].maxCombo,
    }

    test('throws Error when not found song', async () => {
      // Arrange
      client.items.fetchNext.mockResolvedValueOnce({ resources: [] })
      client.items.upsert.mockImplementationOnce(resourse =>
        Promise.resolve({ resourse })
      )
      vi.mocked(isValidScore).mockReturnValue(false)

      // Act
      const repo = new ScoreRepository(client as unknown as CosmosClient)
      await expect(
        repo.upsert(publicUser, songId, playStyle, difficulty, score)
      ).rejects.toThrow(
        expect.objectContaining({ message: 'Song or StepChart not found' })
      )

      // Assert
      expect(client.items.query).toBeCalledWith(
        {
          query:
            'SELECT s.id, s.name, s.cp_seriesCategory AS seriesCategory, s.deleted, ' +
            'c.level, c.notes, c.freezeArrow, c.shockArrow ' +
            'FROM s JOIN c IN s.charts WHERE (s.id = @param0) AND (c.playStyle = @param1) AND (c.difficulty = @param2)',
          parameters: [
            { name: '@param0', value: songId },
            { name: '@param1', value: playStyle },
            { name: '@param2', value: difficulty },
          ],
        },
        { maxItemCount: 1 }
      )
      expect(client.items.fetchNext).toBeCalled()
      expect(vi.mocked(isValidScore)).not.toBeCalled()
      expect(client.items.upsert).not.toBeCalled()
    })
    test('throws Error when isValidScore() returns false', async () => {
      // Arrange
      client.items.fetchNext.mockResolvedValueOnce({
        resources: [songAndChart],
      })
      client.items.upsert.mockImplementationOnce(resourse =>
        Promise.resolve({ resourse })
      )
      vi.mocked(isValidScore).mockReturnValue(false)

      // Act
      const repo = new ScoreRepository(client as unknown as CosmosClient)
      await expect(
        repo.upsert(publicUser, songId, playStyle, difficulty, score)
      ).rejects.toThrow(expect.objectContaining({ message: 'Invalid score' }))

      // Assert
      expect(client.items.query).toBeCalledWith(
        {
          query:
            'SELECT s.id, s.name, s.cp_seriesCategory AS seriesCategory, s.deleted, ' +
            'c.level, c.notes, c.freezeArrow, c.shockArrow ' +
            'FROM s JOIN c IN s.charts WHERE (s.id = @param0) AND (c.playStyle = @param1) AND (c.difficulty = @param2)',
          parameters: [
            { name: '@param0', value: songId },
            { name: '@param1', value: playStyle },
            { name: '@param2', value: difficulty },
          ],
        },
        { maxItemCount: 1 }
      )
      expect(client.items.fetchNext).toBeCalled()
      expect(vi.mocked(isValidScore)).toBeCalledWith(songAndChart, score)
      expect(client.items.upsert).not.toBeCalled()
    })
    test('calls items.query() and items.upsert()', async () => {
      // Arrange
      const { id: userId } = publicUser
      client.items.fetchNext.mockResolvedValueOnce({
        resources: [songAndChart],
      })
      client.items.upsert.mockImplementationOnce(resourse =>
        Promise.resolve({ resourse })
      )
      vi.mocked(isValidScore).mockReturnValue(true)

      // Act
      const repo = new ScoreRepository(client as unknown as CosmosClient)
      await repo.upsert(publicUser, songId, playStyle, difficulty, score)

      // Assert
      expect(client.items.query).toBeCalledWith(
        {
          query:
            'SELECT s.id, s.name, s.cp_seriesCategory AS seriesCategory, s.deleted, ' +
            'c.level, c.notes, c.freezeArrow, c.shockArrow ' +
            'FROM s JOIN c IN s.charts WHERE (s.id = @param0) AND (c.playStyle = @param1) AND (c.difficulty = @param2)',
          parameters: [
            { name: '@param0', value: songId },
            { name: '@param1', value: playStyle },
            { name: '@param2', value: difficulty },
          ],
        },
        { maxItemCount: 1 }
      )
      expect(client.items.fetchNext).toBeCalled()
      expect(vi.mocked(isValidScore)).toBeCalledWith(songAndChart, score)
      expect(client.items.upsert).toBeCalledWith({
        id: `${songId}/${playStyle}/${difficulty}/${userId}`,
        type: 'score',
        song: {
          id: songId,
          name: songAndChart.name,
          seriesCategory: songAndChart.seriesCategory,
          deleted: songAndChart.deleted,
        },
        chart: { playStyle, difficulty, level: songAndChart.level },
        user: {
          id: userId,
          name: publicUser.name,
          isPublic: true,
          area: publicUser.area,
        },
        score: score.score,
        clearLamp: score.clearLamp,
        rank: score.rank,
        exScore: score.exScore,
        maxCombo: score.maxCombo,
        flareRank: score.flareRank,
      })
    })
  })
  describe('delete', () => {
    test('calls delete()', async () => {
      // Arrange
      const { songId, playStyle, difficulty, userId } = testScores[0]

      // Act
      const repo = new ScoreRepository(client as unknown as CosmosClient)
      await repo.delete(userId, songId, playStyle, difficulty)

      // Assert
      expect(client.item).toBeCalledWith(
        `${songId}/${playStyle}/${difficulty}/${userId}`,
        songId
      )
      expect(client.delete).toBeCalled()
    })
  })
})
