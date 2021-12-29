/**
 * @jest-environment node
 */
import { testSongData } from '@ddradar/core/__tests__/data'

import {
  getChartTitle,
  getDisplayedBPM,
  getSongInfo,
  postSongInfo,
  searchCharts,
  searchSong,
  shortenSeriesName,
} from '~/api/song'

describe('/api/song.ts', () => {
  describe('shortenSeriesName', () => {
    test.each([
      ['DDR 1st', '1st'],
      ['DDRMAX', 'DDRMAX'],
      ['DanceDanceRevolution (2014)', '2014'],
      ['DanceDanceRevolution A20', 'A20'],
      ['DanceDanceRevolution A20 PLUS', 'A20 PLUS'],
    ])('("%s") returns "%s"', (series, expected) =>
      expect(shortenSeriesName(series)).toBe(expected)
    )
  })

  describe('getChartTitle', () => {
    test.each([
      [1, 0, 1, 'SP-BEGINNER (1)'],
      [2, 1, 5, 'DP-BASIC (5)'],
      [1, 2, 10, 'SP-DIFFICULT (10)'],
      [2, 3, 15, 'DP-EXPERT (15)'],
      [1, 4, 19, 'SP-CHALLENGE (19)'],
    ] as const)(
      '({ playStyle: %i, difficulty: %i, level: %i }) returns "%s"',
      (playStyle, difficulty, level, expected) =>
        expect(getChartTitle({ playStyle, difficulty, level })).toBe(expected)
    )
  })

  describe('getDisplayedBPM', () => {
    test.each([
      [null, null, '???'],
      [100, null, '???'],
      [null, 400, '???'],
      [200, 200, '200'],
      [100, 400, '100-400'],
    ])(
      '({ minBPM: %p, maxBPM: %p }) returns "%s"',
      (minBPM, maxBPM, expected) =>
        expect(getDisplayedBPM({ minBPM, maxBPM })).toBe(expected)
    )
  })

  describe('API caller', () => {
    const $http = {
      $get: jest.fn<Promise<any>, [string, any]>(),
      $post: jest.fn<Promise<any>, [string]>(),
    }
    beforeEach(() => {
      $http.$get.mockReset()
      $http.$post.mockReset()
    })

    describe('getSongInfo', () => {
      const song = { id: '00000000000000000000000000000000' }
      test(`($http, "${song.id}") calls GET "/api/v1/songs/${song.id}"`, async () => {
        // Arrange
        $http.$get.mockResolvedValue(song)

        // Act
        const result = await getSongInfo($http, song.id)

        // Assert
        expect(result).toBe(song)
        expect($http.$get).toBeCalledWith(`/api/v1/songs/${song.id}`)
      })
    })

    describe('searchSong', () => {
      const song = { ...testSongData }
      test.each([
        [undefined, undefined, ''],
        [0, undefined, 'name=0'],
        [undefined, 0, 'series=0'],
        [1, 1, 'name=1&series=1'],
      ])(
        '($http, %p, %p) calls GET "/api/v1/songs?%s"',
        async (name, series, query) => {
          // Arrange
          const songs = [song]
          $http.$get.mockResolvedValue(songs)

          // Act
          const result = await searchSong($http, name, series)

          // Assert
          expect(result).toBe(songs)
          expect($http.$get.mock.calls[0][0]).toBe('/api/v1/songs')
          expect($http.$get.mock.calls[0][1].searchParams.toString()).toBe(
            query
          )
        }
      )
    })

    describe('searchCharts', () => {
      test.each([
        [1, 1, '/api/v1/charts/1/1'] as const,
        [1, 10, '/api/v1/charts/1/10'] as const,
        [1, 19, '/api/v1/charts/1/19'] as const,
        [2, 2, '/api/v1/charts/2/2'] as const,
        [2, 15, '/api/v1/charts/2/15'] as const,
        [2, 18, '/api/v1/charts/2/18'] as const,
      ])('($http, %i, %i) calls GET "%s"', async (playStyle, level, uri) => {
        // Arrange
        const charts = [{ playStyle, difficulty: level }]
        $http.$get.mockResolvedValue(charts)

        // Act
        const result = await searchCharts($http, playStyle, level)

        // Assert
        expect(result).toBe(charts)
        expect($http.$get).toBeCalledWith(uri)
      })
    })

    describe('postSongInfo()', () => {
      const songInfo = { ...testSongData }
      beforeEach(() => $http.$post.mockResolvedValue(songInfo))
      test('calls POST "/api/v1/songs"', async () => {
        // Arrange
        const body = { ...songInfo, charts: [...songInfo.charts].reverse() }

        // Act
        const val = await postSongInfo($http, body)

        // Assert
        expect(val).toStrictEqual(songInfo)
        expect($http.$post).toBeCalledTimes(1)
        expect($http.$post).lastCalledWith('/api/v1/songs', body)
      })
    })
  })
})
