import {
  getDifficultyName,
  getPlayStyleName,
  getSongInfo,
  searchCharts,
  searchSongByName,
  searchSongBySeries,
  shortenSeriesName,
} from '~/api/song'

describe('./api/song.ts', () => {
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

  describe('getDifficultyName', () => {
    test.each([
      [NaN, 'UNKNOWN'],
      [-1, 'UNKNOWN'],
      [1.5, 'UNKNOWN'],
      [5, 'UNKNOWN'],
      [Infinity, 'UNKNOWN'],
      [-Infinity, 'UNKNOWN'],
      [0, 'BEGINNER'],
      [1, 'BASIC'],
      [2, 'DIFFICULT'],
      [3, 'EXPERT'],
      [4, 'CHALLENGE'],
    ])('(%d) returns "%s"', (difficulty, expected) =>
      expect(getDifficultyName(difficulty)).toBe(expected)
    )
  })

  describe('getPlayStyleName', () => {
    test.each([
      [NaN, 'UNKNOWN'],
      [0, 'UNKNOWN'],
      [-1, 'UNKNOWN'],
      [1.5, 'UNKNOWN'],
      [3, 'UNKNOWN'],
      [1, 'SINGLE'],
      [2, 'DOUBLE'],
    ])('(%d) returns "%s"', (playStyle, expected) =>
      expect(getPlayStyleName(playStyle)).toBe(expected)
    )
  })

  describe('API caller', () => {
    const $http = { $get: jest.fn<Promise<any>, [string]>() }
    beforeEach(() => $http.$get.mockClear())

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

    describe('searchSongByName', () => {
      const song = { nameIndex: 10 }
      test(`($http, ${song.nameIndex}) calls GET "/api/v1/songs/name/${song.nameIndex}"`, async () => {
        // Arrange
        const songs = [song]
        $http.$get.mockResolvedValue(songs)

        // Act
        const result = await searchSongByName($http, song.nameIndex)

        // Assert
        expect(result).toBe(songs)
        expect($http.$get).toBeCalledWith('/api/v1/songs/name/10')
      })
    })

    describe('searchSongBySeries', () => {
      const song = { series: 10 }
      test(`($http, ${song.series}) calls GET "/api/v1/songs/${song.series}"`, async () => {
        // Arrange
        const $http = { $get: jest.fn<Promise<any>, [string]>() }
        const songs = [song]
        $http.$get.mockResolvedValue(songs)

        // Act
        const result = await searchSongBySeries($http, song.series)

        // Assert
        expect(result).toBe(songs)
        expect($http.$get).toBeCalledWith('/api/v1/songs/series/10')
      })
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
  })
})
