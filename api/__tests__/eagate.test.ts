import { readFile } from 'fs'
import { join } from 'path'
import { promisify } from 'util'

import { musicDataToScoreList } from '../eagate'

const readFileAsync = promisify(readFile)

describe('./eagate.ts', () => {
  describe('musicDataToScoreList', () => {
    test.each(['', 'foo', '<html></html>'])('("%s") throws error', source => {
      expect(() => musicDataToScoreList(source)).toThrowError()
    })
    test('(music_data_invalid.html) throws error', async () => {
      // Arrange
      const source = await readFileAsync(
        join(__dirname, 'eagate', 'music_data_invalid.html'),
        { encoding: 'utf8' }
      )

      // Act - Assert
      expect(() => musicDataToScoreList(source)).toThrowError()
    })
    test('(music_data_single.html) returns single ScoreList', async () => {
      // Arrange
      const source = await readFileAsync(
        join(__dirname, 'eagate', 'music_data_single.html'),
        { encoding: 'utf8' }
      )

      // Act
      const result = musicDataToScoreList(source)

      // Assert
      expect(result).toStrictEqual([
        {
          songId: 'I96dOqqqQIi9oiqbqDPbQ8I8PQbqOb1o',
          songName: '朧',
          playStyle: 1,
          difficulty: 0,
          score: 876000,
          clearLamp: 2,
          rank: 'A+',
        },
        {
          songId: 'I96dOqqqQIi9oiqbqDPbQ8I8PQbqOb1o',
          songName: '朧',
          playStyle: 1,
          difficulty: 2,
          score: 823000,
          clearLamp: 2,
          rank: 'A',
        },
        {
          songId: 'I96dOqqqQIi9oiqbqDPbQ8I8PQbqOb1o',
          songName: '朧',
          playStyle: 1,
          difficulty: 3,
          score: 798000,
          clearLamp: 2,
          rank: 'A-',
        },
        {
          songId: 'I96dOqqqQIi9oiqbqDPbQ8I8PQbqOb1o',
          songName: '朧',
          playStyle: 1,
          difficulty: 4,
          score: 780000,
          clearLamp: 2,
          rank: 'B+',
        },
        {
          songId: 'QIDd80o0OqobODP00ldQ1D9dl81qQi0d',
          songName: 'きゅん×きゅんばっきゅん☆LOVE',
          playStyle: 1,
          difficulty: 0,
          score: 700000,
          clearLamp: 2,
          rank: 'B',
        },
        {
          songId: 'QIDd80o0OqobODP00ldQ1D9dl81qQi0d',
          songName: 'きゅん×きゅんばっきゅん☆LOVE',
          playStyle: 1,
          difficulty: 1,
          score: 690000,
          clearLamp: 2,
          rank: 'B-',
        },
        {
          songId: 'QIDd80o0OqobODP00ldQ1D9dl81qQi0d',
          songName: 'きゅん×きゅんばっきゅん☆LOVE',
          playStyle: 1,
          difficulty: 2,
          score: 650000,
          clearLamp: 2,
          rank: 'C+',
        },
        {
          songId: 'QIDd80o0OqobODP00ldQ1D9dl81qQi0d',
          songName: 'きゅん×きゅんばっきゅん☆LOVE',
          playStyle: 1,
          difficulty: 3,
          score: 620000,
          clearLamp: 2,
          rank: 'C',
        },
        {
          songId: '8o1iQPiId8P6Db9Iqo1Oo119QDoq8qQ8',
          songName: 'CHAOS',
          playStyle: 1,
          difficulty: 0,
          score: 0,
          clearLamp: 1,
          rank: 'D',
        },
        {
          songId: '8o1iQPiId8P6Db9Iqo1Oo119QDoq8qQ8',
          songName: 'CHAOS',
          playStyle: 1,
          difficulty: 1,
          score: 599990,
          clearLamp: 2,
          rank: 'C-',
        },
        {
          songId: '8o1iQPiId8P6Db9Iqo1Oo119QDoq8qQ8',
          songName: 'CHAOS',
          playStyle: 1,
          difficulty: 2,
          score: 930000,
          clearLamp: 5,
          rank: 'E',
        },
      ])
    })
    test('(music_data_double.html) returns double ScoreList', async () => {
      // Arrange
      const source = await readFileAsync(
        join(__dirname, 'eagate', 'music_data_double.html'),
        { encoding: 'utf8' }
      )

      // Act
      const result = musicDataToScoreList(source)

      // Assert
      expect(result).toStrictEqual([
        {
          songId: 'l9lq19DdiD8qQPoPOlboi1qQii0IQI86',
          songName: '革命',
          playStyle: 2,
          difficulty: 1,
          score: 1000000,
          clearLamp: 7,
          rank: 'AAA',
        },
        {
          songId: 'l9lq19DdiD8qQPoPOlboi1qQii0IQI86',
          songName: '革命',
          playStyle: 2,
          difficulty: 2,
          score: 999920,
          clearLamp: 6,
          rank: 'AAA',
        },
        {
          songId: 'l9lq19DdiD8qQPoPOlboi1qQii0IQI86',
          songName: '革命',
          playStyle: 2,
          difficulty: 3,
          score: 987600,
          clearLamp: 5,
          rank: 'AA+',
        },
        {
          songId: 'l9lq19DdiD8qQPoPOlboi1qQii0IQI86',
          songName: '革命',
          playStyle: 2,
          difficulty: 4,
          score: 945000,
          clearLamp: 4,
          rank: 'AA',
        },
        {
          songId: 'qIqqdd1Odqi1Iiolq9qqPOi0bPPld8Pb',
          songName: '革命(X-Special)',
          playStyle: 2,
          difficulty: 4,
          score: 898000,
          clearLamp: 2,
          rank: 'AA-',
        },
        {
          songId: 'llo89P08I1PlID9DO8lqdbbq69O8Qiib',
          songName: '逆さま♥シンデレラパレード',
          playStyle: 2,
          difficulty: 1,
          score: 573000,
          clearLamp: 2,
          rank: 'D+',
        },
        {
          songId: 'llo89P08I1PlID9DO8lqdbbq69O8Qiib',
          songName: '逆さま♥シンデレラパレード',
          playStyle: 2,
          difficulty: 2,
          score: 498000,
          clearLamp: 2,
          rank: 'D',
        },
        {
          songId: 'llo89P08I1PlID9DO8lqdbbq69O8Qiib',
          songName: '逆さま♥シンデレラパレード',
          playStyle: 2,
          difficulty: 3,
          score: 45310,
          clearLamp: 0,
          rank: 'E',
        },
      ])
    })
  })
})
