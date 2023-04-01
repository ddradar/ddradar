/**
 * @vitest-environment jsdom
 */
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { beforeAll, describe, expect, test } from 'vitest'

import { musicDataToScoreList, musicDetailToScore } from '../src/eagate'
import type { ClearLamp, DanceLevel } from '../src/score'
import type { Difficulty, PlayStyle } from '../src/song'

const readFileAsync = (folder: string, fileName: string) =>
  readFile(join(__dirname, 'eagate', folder, fileName), {
    encoding: 'utf8',
  })

describe('/eagate.ts', () => {
  describe('musicDataToScoreList', () => {
    let template: string
    const folder = 'music_data'
    beforeAll(async () => {
      template = await readFileAsync(folder, 'template.html')
    })
    const createSource = async (fileName: string) =>
      template.replace('{{ contents }}', await readFileAsync(folder, fileName))

    const createScore = (
      songName: string,
      playStyle: PlayStyle,
      difficulty: Difficulty,
      score: number,
      clearLamp: ClearLamp,
      rank: DanceLevel
    ) => ({ songName, playStyle, difficulty, score, clearLamp, rank })

    test.each([
      '',
      'foo',
      '<html></html>',
      '<html>\n<div id="data_tbl" />\n</html>',
    ])('("%s") throws error', source => {
      expect(() => musicDataToScoreList(source)).toThrowError()
    })
    test.each(['invalid_column.html', 'invalid_chart_id.html'])(
      '(%s) throws error',
      async fileName => {
        // Arrange
        const source = await createSource(fileName)

        // Act - Assert
        expect(() => musicDataToScoreList(source)).toThrowError()
      }
    )
    test.each([
      [
        'music_single.html',
        {
          I96dOqqqQIi9oiqbqDPbQ8I8PQbqOb1o: [
            createScore('朧', 1, 0, 876000, 2, 'A+'),
            createScore('朧', 1, 2, 823000, 2, 'A'),
            createScore('朧', 1, 4, 780000, 2, 'B+'),
          ],
          QIDd80o0OqobODP00ldQ1D9dl81qQi0d: [
            createScore('きゅん×きゅんばっきゅん☆LOVE', 1, 0, 700000, 2, 'B'),
            createScore('きゅん×きゅんばっきゅん☆LOVE', 1, 1, 690000, 2, 'B-'),
            createScore('きゅん×きゅんばっきゅん☆LOVE', 1, 2, 650000, 2, 'C+'),
            createScore('きゅん×きゅんばっきゅん☆LOVE', 1, 3, 620000, 2, 'C'),
          ],
          '8o1iQPiId8P6Db9Iqo1Oo119QDoq8qQ8': [
            createScore('CHAOS', 1, 0, 0, 1, 'D'),
            createScore('CHAOS', 1, 1, 599990, 2, 'C-'),
            createScore('CHAOS', 1, 2, 930000, 5, 'E'),
          ],
        },
      ],
      [
        'music_double.html',
        {
          l9lq19DdiD8qQPoPOlboi1qQii0IQI86: [
            createScore('革命', 2, 1, 1000000, 7, 'AAA'),
            createScore('革命', 2, 2, 999920, 6, 'AAA'),
            createScore('革命', 2, 3, 987600, 5, 'AA+'),
            createScore('革命', 2, 4, 945000, 4, 'AA'),
          ],
          qIqqdd1Odqi1Iiolq9qqPOi0bPPld8Pb: [],
          llo89P08I1PlID9DO8lqdbbq69O8Qiib: [
            createScore('逆さま♥シンデレラパレード', 2, 1, 573000, 2, 'D+'),
            createScore('逆さま♥シンデレラパレード', 2, 2, 498000, 2, 'D'),
            createScore('逆さま♥シンデレラパレード', 2, 3, 45310, 0, 'E'),
          ],
        },
      ],
      [
        'nonstop_single.html',
        {
          qbbOOO1QibO1861bqQII9lqlPiIoqb98: [
            createScore('FIRST', 1, 0, 902500, 4, 'AA'),
            createScore('FIRST', 1, 1, 998380, 2, 'AAA'),
            createScore('FIRST', 1, 2, 860000, 2, 'A+'),
            createScore('FIRST', 1, 3, 599100, 2, 'C-'),
          ],
          '88o8Oq69ldilblP10DI0qqb6b8I0DDi9': [
            createScore('BOUNCE', 1, 0, 1000000, 7, 'AAA'),
            createScore('BOUNCE', 1, 3, 983530, 5, 'AA+'),
            createScore('BOUNCE', 1, 4, 664060, 0, 'E'),
          ],
          DQilQP810dq8D9i11q6Oq0ooDdQQO0lI: [],
        },
      ],
      [
        'nonstop_double.html',
        {
          l1o0olodIDDiqDQ101obOD1qo81q0QOP: [
            createScore('ONE HALF', 2, 1, 999930, 6, 'AAA'),
          ],
          O6Pi0O800b8b6d9dd9P89dD1900I1q80: [],
          dqQD9ilqIIilOQi986Ql6dd1ldiPob88: [
            createScore('☆☆☆☆', 2, 1, 999900, 6, 'AAA'),
            createScore('☆☆☆☆', 2, 2, 999700, 6, 'AAA'),
            createScore('☆☆☆☆', 2, 3, 996000, 4, 'AAA'),
            createScore('☆☆☆☆', 2, 4, 946220, 2, 'AA'),
          ],
          Plld00DiIO9bPqdq190li1iIPDdq6Qlb: [
            createScore('Intelligence', 2, 4, 938020, 2, 'AA'),
          ],
        },
      ],
      [
        'grade_single.html',
        {
          b6qOqD9bOQO1O0q8000D6dIdqb80li1b: [],
          '6loIiOd8PP90dPOq16Q6PdPPO0DQDOPP': [],
          '91DOoD99iIq9oIdOi9QqDQ0qlQPQPOii': [
            createScore('五段', 1, 4, 550000, 0, 'E'),
          ],
          '6bo6ID6l11qd6lolilI6o6q8I6ddo88i': [
            createScore('初段', 1, 4, 999360, 5, 'AAA'),
          ],
          d0l89dI9d6Di11DQ9P8D1Pl1d0Db81D9: [
            createScore('二段', 1, 4, 999580, 6, 'AAA'),
          ],
        },
      ],
      [
        'grade_double.html',
        {
          '9IliQ1O0dOQPiObPDDDblDO6oliDodlb': [
            createScore('初段（A20）', 2, 4, 999320, 5, 'AAA'),
          ],
          IlQodD9Dbld8QiOql68bPPQbd6bll6i1: [],
          dib16I1b0o9OdOd1O90dO1Q6iIO9PQo9: [],
          '8OoDQb16lP0i96qiDQqo90Q6bOP1o89D': [
            createScore('四段（A20）', 2, 4, 992270, 2, 'AAA'),
          ],
        },
      ],
      [
        'music_single_a3.html',
        {
          I96dOqqqQIi9oiqbqDPbQ8I8PQbqOb1o: [
            createScore('朧', 1, 0, 876000, 2, 'A+'),
            createScore('朧', 1, 2, 823000, 2, 'A'),
            createScore('朧', 1, 4, 780000, 2, 'B+'),
          ],
          QIDd80o0OqobODP00ldQ1D9dl81qQi0d: [
            createScore('きゅん×きゅんばっきゅん☆LOVE', 1, 0, 700000, 2, 'B'),
            createScore('きゅん×きゅんばっきゅん☆LOVE', 1, 1, 690000, 2, 'B-'),
            createScore('きゅん×きゅんばっきゅん☆LOVE', 1, 2, 650000, 2, 'C+'),
            createScore('きゅん×きゅんばっきゅん☆LOVE', 1, 3, 620000, 2, 'C'),
          ],
          '8o1iQPiId8P6Db9Iqo1Oo119QDoq8qQ8': [
            createScore('CHAOS', 1, 0, 0, 1, 'D'),
            createScore('CHAOS', 1, 1, 599990, 2, 'C-'),
            createScore('CHAOS', 1, 2, 930000, 5, 'E'),
          ],
        },
      ],
      [
        'music_double_a3.html',
        {
          l9lq19DdiD8qQPoPOlboi1qQii0IQI86: [
            createScore('革命', 2, 1, 1000000, 7, 'AAA'),
            createScore('革命', 2, 2, 999920, 6, 'AAA'),
            createScore('革命', 2, 3, 987600, 5, 'AA+'),
            createScore('革命', 2, 4, 945000, 4, 'AA'),
          ],
          qIqqdd1Odqi1Iiolq9qqPOi0bPPld8Pb: [],
          llo89P08I1PlID9DO8lqdbbq69O8Qiib: [
            createScore('逆さま♥シンデレラパレード', 2, 1, 573000, 2, 'D+'),
            createScore('逆さま♥シンデレラパレード', 2, 2, 498000, 2, 'D'),
            createScore('逆さま♥シンデレラパレード', 2, 3, 45310, 0, 'E'),
          ],
        },
      ],
      [
        'nonstop_single_a3.html',
        {
          '8O8idiPlIl8oQo1liOD6i6bDl8ldqDoP': [
            createScore('KA・TA・KA・NA YEAH!', 1, 0, 902500, 4, 'AA'),
            createScore('KA・TA・KA・NA YEAH!', 1, 1, 998380, 2, 'AAA'),
            createScore('KA・TA・KA・NA YEAH!', 1, 2, 860000, 2, 'A+'),
            createScore('KA・TA・KA・NA YEAH!', 1, 3, 599100, 2, 'C-'),
          ],
          lqQ0d8lPDb60qd01O0o6Ql1oP0D8Pobb: [
            createScore('WITHSTAND', 1, 0, 1000000, 7, 'AAA'),
            createScore('WITHSTAND', 1, 3, 983530, 5, 'AA+'),
            createScore('WITHSTAND', 1, 4, 664060, 0, 'E'),
          ],
          lli8bi6DoQ89i6P9PliooloD68QoDolD: [],
        },
      ],
      [
        'nonstop_double_a3.html',
        {
          l1o0olodIDDiqDQ101obOD1qo81q0QOP: [
            createScore('ONE HALF', 2, 1, 999930, 6, 'AAA'),
          ],
          O6Pi0O800b8b6d9dd9P89dD1900I1q80: [],
          dqQD9ilqIIilOQi986Ql6dd1ldiPob88: [
            createScore('☆☆☆☆', 2, 1, 999900, 6, 'AAA'),
            createScore('☆☆☆☆', 2, 2, 999700, 6, 'AAA'),
            createScore('☆☆☆☆', 2, 3, 996000, 4, 'AAA'),
            createScore('☆☆☆☆', 2, 4, 946220, 2, 'AA'),
          ],
          Plld00DiIO9bPqdq190li1iIPDdq6Qlb: [
            createScore('Intelligence', 2, 4, 938020, 2, 'AA'),
          ],
        },
      ],
    ])('(%s) returns expected ScoreList', async (fileName, expected) => {
      // Arrange
      const source = await createSource(fileName)

      // Act - Assert
      expect(musicDataToScoreList(source)).toStrictEqual(expected)
    })
  })

  describe('musicDetailToScore', () => {
    let template: string
    const folder = 'music_detail'
    beforeAll(async () => {
      template = await readFileAsync(folder, 'template.html')
    })
    const createSource = async (imgSrc: string, fileName: string) =>
      template
        .replace('{{ imgSrc }}', imgSrc)
        .replace('{{ contents }}', await readFileAsync(folder, fileName))

    const createScore = (
      songId: string,
      playStyle: PlayStyle,
      difficulty: Difficulty,
      score: number,
      rank: DanceLevel,
      clearLamp: ClearLamp,
      maxCombo: number,
      topScore: number
    ) => ({
      songId,
      playStyle,
      difficulty,
      score,
      rank,
      clearLamp,
      maxCombo,
      topScore,
    })

    test.each([
      '',
      'foo',
      '<html></html>',
      '<html>\n<div id="data_tbl" />\n</html>',
    ])('("%s") throws error', source => {
      expect(() => musicDetailToScore(source)).toThrowError()
    })

    test.each([
      ['no_play.html', 'NO PLAY...'],
      ['not_select.html', '難易度を選択してください。'],
      ['invalid_title.html', 'Invalid HTML'],
      ['no_play_a3.html', 'NO PLAY...'],
      ['not_select_a3.html', '難易度を選択してください。'],
    ])('(%s) throws "%s" error', async (fileName, message) => {
      // Arrange
      const source = await readFileAsync(folder, fileName)

      // Act - Assert
      expect(() => musicDetailToScore(source)).toThrowError(message)
    })

    const aceForAces = 'ld6P1lbb0bPO9doqbbPOoPb8qoDo8id0'
    const raspberryHeart = '60qiDd000qDIobO0QI916i18bbolO919'
    test.each([
      [
        'diff_0.html',
        createScore(aceForAces, 1, 0, 1000000, 'AAA', 7, 116, 1000000),
      ],
      [
        'diff_1.html',
        createScore(aceForAces, 1, 1, 999990, 'AAA', 6, 311, 1000000),
      ],
      [
        'diff_2.html',
        createScore(aceForAces, 1, 2, 998600, 'AAA', 5, 467, 1000000),
      ],
      [
        'diff_3.html',
        createScore(aceForAces, 1, 3, 968760, 'AA+', 4, 658, 999940),
      ],
      [
        'diff_4.html',
        createScore(aceForAces, 1, 4, 795780, 'A-', 2, 95, 999940),
      ],
      [
        'diff_5.html',
        createScore(raspberryHeart, 2, 1, 999940, 'AAA', 6, 193, 1000000),
      ],
      [
        'diff_6.html',
        createScore(raspberryHeart, 2, 2, 999990, 'AAA', 6, 240, 1000000),
      ],
      [
        'diff_7.html',
        createScore(raspberryHeart, 2, 3, 999890, 'AAA', 6, 295, 1000000),
      ],
      [
        'diff_8.html',
        createScore(raspberryHeart, 2, 4, 900000, 'E', 0, 300, 1000000),
      ],
    ])(
      '(%s) returns %o',
      async (fileName, expected: ReturnType<typeof musicDetailToScore>) => {
        // Arrange
        const source = await createSource(
          `/game/ddr/ddra20/p/images/binary_jk.html?img=${expected.songId}&kind=1`,
          fileName
        )

        // Act - Assert
        expect(musicDetailToScore(source)).toStrictEqual(expected)
      }
    )
    test.each([
      [
        'diff_0_a3.html',
        createScore(aceForAces, 1, 0, 1000000, 'AAA', 7, 116, 999850),
      ],
      [
        'diff_1_a3.html',
        createScore(aceForAces, 1, 1, 999990, 'AAA', 6, 311, 1000000),
      ],
      [
        'diff_2_a3.html',
        createScore(aceForAces, 1, 2, 998600, 'AAA', 5, 467, 1000000),
      ],
      [
        'diff_3_a3.html',
        createScore(aceForAces, 1, 3, 968760, 'AA+', 4, 658, 999940),
      ],
      [
        'diff_4_a3.html',
        createScore(aceForAces, 1, 4, 795780, 'A-', 2, 95, 999940),
      ],
      [
        'diff_5_a3.html',
        createScore(raspberryHeart, 2, 1, 999940, 'AAA', 6, 193, 1000000),
      ],
      [
        'diff_6_a3.html',
        createScore(raspberryHeart, 2, 2, 999990, 'AAA', 6, 240, 1000000),
      ],
      [
        'diff_7_a3.html',
        createScore(raspberryHeart, 2, 3, 999890, 'AAA', 6, 295, 1000000),
      ],
      [
        'diff_8_a3.html',
        createScore(raspberryHeart, 2, 4, 900000, 'E', 0, 300, 1000000),
      ],
    ])(
      '(%s) returns %o',
      async (fileName, expected: ReturnType<typeof musicDetailToScore>) => {
        // Arrange
        const source = await createSource(
          `/game/ddr/ddra3/p/images/binary_jk.html?img=${expected.songId}&kind=1`,
          fileName
        )

        // Act - Assert
        expect(musicDetailToScore(source)).toStrictEqual(expected)
      }
    )

    const gradeId = '19id1DO6q9Pb1681db61D8D8oQi9dlb6'
    const nonstopId = 'qbbOOO1QibO1861bqQII9lqlPiIoqb98'
    test.each([
      [
        'grade.html',
        createScore(gradeId, 1, 4, 999360, 'AAA', 6, 1019, 1000000),
      ],
      [
        'nonstop.html',
        createScore(nonstopId, 1, 0, 999850, 'AAA', 6, 401, 1000000),
      ],
    ])(
      '(%s) returns %o',
      async (fileName, expected: ReturnType<typeof musicDetailToScore>) => {
        // Arrange
        const source = await createSource(
          `/game/ddr/ddra20/p/images/binary_jk_c.html?img=${expected.songId}&kind=1`,
          fileName
        )

        // Act - Assert
        expect(musicDetailToScore(source)).toStrictEqual(expected)
      }
    )

    test.each([
      [
        'nonstop_a3.html',
        createScore(nonstopId, 1, 0, 999850, 'AAA', 6, 401, 1000000),
      ],
    ])(
      '(%s) returns %o',
      async (fileName, expected: ReturnType<typeof musicDetailToScore>) => {
        // Arrange
        const source = await createSource(
          `/game/ddr/ddra3/p/images/binary_jk_c.html?img=${expected.songId}&kind=1`,
          fileName
        )

        // Act - Assert
        expect(musicDetailToScore(source)).toStrictEqual(expected)
      }
    )
  })
})
