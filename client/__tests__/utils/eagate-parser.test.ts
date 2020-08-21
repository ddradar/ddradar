import { readFile } from 'fs'
import { join } from 'path'
import { promisify } from 'util'

import { musicDataToScoreList } from '~/utils/eagate-parser'

const readFileAsync = promisify(readFile)

describe('/utils/eagate-parser.ts', () => {
  describe('musicDataToScoreList', () => {
    test.each([
      '',
      'foo',
      '<html></html>',
      '<html>\n<div id="data_tbl" />\n</html>',
    ])('("%s") throws error', source => {
      expect(() => musicDataToScoreList(source)).toThrowError()
    })
    test('(music_data_invalid_column.html) throws error', async () => {
      // Arrange
      const source = await readFileAsync(
        join(__dirname, 'eagate', 'music_data_invalid_column.html'),
        { encoding: 'utf8' }
      )

      // Act - Assert
      expect(() => musicDataToScoreList(source)).toThrowError()
    })
    test('(music_data_invalid_chart_id.html) throws error', async () => {
      // Arrange
      const source = await readFileAsync(
        join(__dirname, 'eagate', 'music_data_invalid_chart_id.html'),
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
      expect(result).toStrictEqual({
        I96dOqqqQIi9oiqbqDPbQ8I8PQbqOb1o: [
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
        ],
        QIDd80o0OqobODP00ldQ1D9dl81qQi0d: [
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
        ],
        '8o1iQPiId8P6Db9Iqo1Oo119QDoq8qQ8': [
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
        ],
      })
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
      expect(result).toStrictEqual({
        l9lq19DdiD8qQPoPOlboi1qQii0IQI86: [
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
        ],
        qIqqdd1Odqi1Iiolq9qqPOi0bPPld8Pb: [],
        llo89P08I1PlID9DO8lqdbbq69O8Qiib: [
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
        ],
      })
    })
    test('(nonstop_data_single.html) returns single courses ScoreList', async () => {
      // Arrange
      const source = await readFileAsync(
        join(__dirname, 'eagate', 'nonstop_data_single.html'),
        { encoding: 'utf8' }
      )

      // Act
      const result = musicDataToScoreList(source)

      // Assert
      expect(result).toStrictEqual({
        qbbOOO1QibO1861bqQII9lqlPiIoqb98: [
          {
            songId: 'qbbOOO1QibO1861bqQII9lqlPiIoqb98',
            songName: 'FIRST',
            playStyle: 1,
            difficulty: 0,
            score: 902500,
            clearLamp: 4,
            rank: 'AA',
          },
          {
            songId: 'qbbOOO1QibO1861bqQII9lqlPiIoqb98',
            songName: 'FIRST',
            playStyle: 1,
            difficulty: 1,
            score: 998380,
            clearLamp: 2,
            rank: 'AAA',
          },
          {
            songId: 'qbbOOO1QibO1861bqQII9lqlPiIoqb98',
            songName: 'FIRST',
            playStyle: 1,
            difficulty: 2,
            score: 860000,
            clearLamp: 2,
            rank: 'A+',
          },
          {
            songId: 'qbbOOO1QibO1861bqQII9lqlPiIoqb98',
            songName: 'FIRST',
            playStyle: 1,
            difficulty: 3,
            score: 599100,
            clearLamp: 2,
            rank: 'C-',
          },
        ],
        '88o8Oq69ldilblP10DI0qqb6b8I0DDi9': [
          {
            songId: '88o8Oq69ldilblP10DI0qqb6b8I0DDi9',
            songName: 'BOUNCE',
            playStyle: 1,
            difficulty: 0,
            score: 1000000,
            clearLamp: 7,
            rank: 'AAA',
          },
          {
            songId: '88o8Oq69ldilblP10DI0qqb6b8I0DDi9',
            songName: 'BOUNCE',
            playStyle: 1,
            difficulty: 3,
            score: 983530,
            clearLamp: 5,
            rank: 'AA+',
          },
          {
            songId: '88o8Oq69ldilblP10DI0qqb6b8I0DDi9',
            songName: 'BOUNCE',
            playStyle: 1,
            difficulty: 4,
            score: 664060,
            clearLamp: 0,
            rank: 'E',
          },
        ],
        DQilQP810dq8D9i11q6Oq0ooDdQQO0lI: [],
      })
    })
    test('(nonstop_data_double.html) returns single courses ScoreList', async () => {
      // Arrange
      const source = await readFileAsync(
        join(__dirname, 'eagate', 'nonstop_data_double.html'),
        { encoding: 'utf8' }
      )

      // Act
      const result = musicDataToScoreList(source)

      // Assert
      expect(result).toStrictEqual({
        l1o0olodIDDiqDQ101obOD1qo81q0QOP: [
          {
            songId: 'l1o0olodIDDiqDQ101obOD1qo81q0QOP',
            songName: 'ONE HALF',
            playStyle: 2,
            difficulty: 1,
            score: 999930,
            clearLamp: 6,
            rank: 'AAA',
          },
        ],
        O6Pi0O800b8b6d9dd9P89dD1900I1q80: [],
        dqQD9ilqIIilOQi986Ql6dd1ldiPob88: [
          {
            songId: 'dqQD9ilqIIilOQi986Ql6dd1ldiPob88',
            songName: '☆☆☆☆',
            playStyle: 2,
            difficulty: 1,
            score: 999900,
            clearLamp: 6,
            rank: 'AAA',
          },
          {
            songId: 'dqQD9ilqIIilOQi986Ql6dd1ldiPob88',
            songName: '☆☆☆☆',
            playStyle: 2,
            difficulty: 2,
            score: 999700,
            clearLamp: 6,
            rank: 'AAA',
          },
          {
            songId: 'dqQD9ilqIIilOQi986Ql6dd1ldiPob88',
            songName: '☆☆☆☆',
            playStyle: 2,
            difficulty: 3,
            score: 996000,
            clearLamp: 4,
            rank: 'AAA',
          },
          {
            songId: 'dqQD9ilqIIilOQi986Ql6dd1ldiPob88',
            songName: '☆☆☆☆',
            playStyle: 2,
            difficulty: 4,
            score: 946220,
            clearLamp: 2,
            rank: 'AA',
          },
        ],
        Plld00DiIO9bPqdq190li1iIPDdq6Qlb: [
          {
            songId: 'Plld00DiIO9bPqdq190li1iIPDdq6Qlb',
            songName: 'Intelligence',
            playStyle: 2,
            difficulty: 4,
            score: 938020,
            clearLamp: 2,
            rank: 'AA',
          },
        ],
      })
    })
  })
})
