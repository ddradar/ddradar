import {
  getDifficultyName,
  getPlayStyleName,
  shortenSeriesName,
} from '~/types/api/song'

describe('./types/api/song.ts', () => {
  describe('shortenSeriesName', () => {
    test.each([
      ['DDR 1st', '1st'],
      ['DDRMAX', 'DDRMAX'],
      ['DanceDanceRevolution (2014)', '2014'],
      ['DanceDanceRevolution A20', 'A20'],
      ['DanceDanceRevolution A20 PLUS', 'A20 PLUS'],
    ])('("%s") returns "%s"', (series, expected) => {
      // Arrange - Act
      const result = shortenSeriesName(series)

      // Assert
      expect(result).toBe(expected)
    })
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
    ])('(%d) returns "%s"', (difficulty, expected) => {
      // Arrange - Act
      const result = getDifficultyName(difficulty)

      // Assert
      expect(result).toBe(expected)
    })
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
    ])('(%d) returns "%s"', (playStyle, expected) => {
      // Arrange - Act
      const result = getPlayStyleName(playStyle)

      // Assert
      expect(result).toBe(expected)
    })
  })
})
