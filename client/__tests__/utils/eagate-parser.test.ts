import { readFile } from 'fs'
import { join } from 'path'
import { promisify } from 'util'

import { musicDataToScoreList, musicDetailToScore } from '~/utils/eagate-parser'

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
    test('(grade_data_single.html) returns single grades ScoreList', async () => {
      // Arrange
      const source = await readFileAsync(
        join(__dirname, 'eagate', 'grade_data_single.html'),
        { encoding: 'utf8' }
      )

      // Act
      const result = musicDataToScoreList(source)

      // Assert
      expect(result).toStrictEqual({
        b6qOqD9bOQO1O0q8000D6dIdqb80li1b: [],
        '6loIiOd8PP90dPOq16Q6PdPPO0DQDOPP': [],
        '91DOoD99iIq9oIdOi9QqDQ0qlQPQPOii': [
          {
            songId: '91DOoD99iIq9oIdOi9QqDQ0qlQPQPOii',
            songName: '五段',
            playStyle: 1,
            difficulty: 4,
            score: 550000,
            clearLamp: 0,
            rank: 'E',
          },
        ],
        '6bo6ID6l11qd6lolilI6o6q8I6ddo88i': [
          {
            songId: '6bo6ID6l11qd6lolilI6o6q8I6ddo88i',
            songName: '初段',
            playStyle: 1,
            difficulty: 4,
            score: 999360,
            clearLamp: 5,
            rank: 'AAA',
          },
        ],
        d0l89dI9d6Di11DQ9P8D1Pl1d0Db81D9: [
          {
            songId: 'd0l89dI9d6Di11DQ9P8D1Pl1d0Db81D9',
            songName: '二段',
            playStyle: 1,
            difficulty: 4,
            score: 999580,
            clearLamp: 6,
            rank: 'AAA',
          },
        ],
      })
    })
    test('(grade_data_double.html) returns double grades ScoreList', async () => {
      // Arrange
      const source = await readFileAsync(
        join(__dirname, 'eagate', 'grade_data_double.html'),
        { encoding: 'utf8' }
      )

      // Act
      const result = musicDataToScoreList(source)

      // Assert
      expect(result).toStrictEqual({
        '9IliQ1O0dOQPiObPDDDblDO6oliDodlb': [
          {
            songId: '9IliQ1O0dOQPiObPDDDblDO6oliDodlb',
            songName: '初段（A20）',
            playStyle: 2,
            difficulty: 4,
            score: 999320,
            clearLamp: 5,
            rank: 'AAA',
          },
        ],
        IlQodD9Dbld8QiOql68bPPQbd6bll6i1: [],
        dib16I1b0o9OdOd1O90dO1Q6iIO9PQo9: [],
        '8OoDQb16lP0i96qiDQqo90Q6bOP1o89D': [
          {
            songId: '8OoDQb16lP0i96qiDQqo90Q6bOP1o89D',
            songName: '四段（A20）',
            playStyle: 2,
            difficulty: 4,
            score: 992270,
            clearLamp: 2,
            rank: 'AAA',
          },
        ],
      })
    })
  })
  describe('musicDetailToScore', () => {
    const aceForAces = {
      songId: 'ld6P1lbb0bPO9doqbbPOoPb8qoDo8id0',
      songName: 'ACE FOR ACES',
    }
    const raspberryHeart = {
      songId: '60qiDd000qDIobO0QI916i18bbolO919',
      songName: 'Raspberry♡Heart(English version)',
    }
    test.each([
      '',
      'foo',
      '<html></html>',
      '<html>\n<div id="data_tbl" />\n</html>',
    ])('("%s") throws error', source => {
      expect(() => musicDetailToScore(source)).toThrowError()
    })
    test.each([
      [
        'music_detail_sp_beg.html',
        {
          ...aceForAces,
          playStyle: 1,
          difficulty: 0,
          score: 1000000,
          rank: 'AAA',
          clearLamp: 7,
          maxCombo: 116,
          topScore: 1000000,
        } as const,
      ],
      [
        'music_detail_sp_bas.html',
        {
          ...aceForAces,
          playStyle: 1,
          difficulty: 1,
          score: 999990,
          rank: 'AAA',
          clearLamp: 6,
          maxCombo: 311,
          topScore: 1000000,
        } as const,
      ],
      [
        'music_detail_sp_dif.html',
        {
          ...aceForAces,
          playStyle: 1,
          difficulty: 2,
          score: 998600,
          rank: 'AAA',
          clearLamp: 5,
          maxCombo: 467,
          topScore: 1000000,
        } as const,
      ],
      [
        'music_detail_sp_exp.html',
        {
          ...aceForAces,
          playStyle: 1,
          difficulty: 3,
          score: 968760,
          rank: 'AA+',
          clearLamp: 4,
          maxCombo: 658,
          topScore: 999940,
        } as const,
      ],
      [
        'music_detail_sp_cha.html',
        {
          ...aceForAces,
          playStyle: 1,
          difficulty: 4,
          score: 795780,
          rank: 'A-',
          clearLamp: 2,
          maxCombo: 95,
          topScore: 999940,
        } as const,
      ],
      [
        'music_detail_dp_bas.html',
        {
          ...raspberryHeart,
          playStyle: 2,
          difficulty: 1,
          score: 999940,
          rank: 'AAA',
          clearLamp: 6,
          maxCombo: 193,
          topScore: 1000000,
        } as const,
      ],
      [
        'music_detail_dp_dif.html',
        {
          ...raspberryHeart,
          playStyle: 2,
          difficulty: 2,
          score: 999990,
          rank: 'AAA',
          clearLamp: 6,
          maxCombo: 240,
          topScore: 1000000,
        } as const,
      ],
      [
        'music_detail_dp_exp.html',
        {
          ...raspberryHeart,
          playStyle: 2,
          difficulty: 3,
          score: 999890,
          rank: 'AAA',
          clearLamp: 6,
          maxCombo: 295,
          topScore: 1000000,
        } as const,
      ],
      [
        'music_detail_dp_cha.html',
        {
          ...raspberryHeart,
          playStyle: 2,
          difficulty: 4,
          score: 999950,
          rank: 'AAA',
          clearLamp: 6,
          maxCombo: 331,
          topScore: 1000000,
        } as const,
      ],
    ])(
      '(%s) returns %p',
      async (fileName, expected: ReturnType<typeof musicDetailToScore>) => {
        // Arrange
        const source = await readFileAsync(
          join(__dirname, 'eagate', 'music_detail', fileName),
          { encoding: 'utf8' }
        )

        // Act - Assert
        expect(musicDetailToScore(source)).toStrictEqual(expected)
      }
    )
  })
})
