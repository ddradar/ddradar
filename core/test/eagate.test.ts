// @vitest-environment happy-dom
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { beforeAll, describe, expect, test } from 'vitest'

import type { ScoreData } from '../src/eagate'
import { parsePlayDataList } from '../src/eagate'

const readFileAsync = (folder: string, fileName: string) =>
  readFile(join(__dirname, 'eagate', folder, fileName), {
    encoding: 'utf8',
  })

describe('eagate.ts', () => {
  describe('parsePlayDataList', () => {
    let template: string
    const folder = 'music_data'
    const createSource = async (fileName: string) =>
      template.replace('{{ contents }}', await readFileAsync(folder, fileName))

    beforeAll(async () => {
      template = await readFileAsync(folder, 'template.html')
    })

    test.each([
      '',
      'foo',
      '<html></html>',
      '<html>\n<div id="data_tbl" />\n</html>',
    ])('("%s") throws error', source => {
      expect(() => parsePlayDataList(source)).toThrowError()
    })
    test.each(['invalid_column.html', 'invalid_chart_id.html'])(
      '(%s) throws error',
      async fileName => {
        // Arrange
        const source = await createSource(fileName)

        // Act - Assert
        expect(() => parsePlayDataList(source)).toThrowError()
      }
    )

    const createScoreData = (
      song: Pick<ScoreData, 'songId' | 'songName'>,
      playStyle: ScoreData['playStyle'],
      difficulty: ScoreData['difficulty'],
      score: ScoreData['score'],
      rank: ScoreData['rank'],
      clearLamp: ScoreData['clearLamp'],
      flareRank: ScoreData['flareRank'],
      flareSkill?: ScoreData['flareSkill']
    ): ScoreData => ({
      ...song,
      playStyle,
      difficulty,
      score,
      rank,
      clearLamp,
      flareRank,
      ...(flareSkill !== undefined ? { flareSkill } : {}),
    })

    const hou = { songId: 'QiPiIb8I99loq8loIq91iP6l1OOoq8oq', songName: '鳳' }
    const ume = {
      songId: 'bi9OolI1P9oI8dDPlbQiq01Dl080PQ61',
      songName: '梅雪夜',
    }
    const kakX = {
      songId: 'qIqqdd1Odqi1Iiolq9qqPOi0bPPld8Pb',
      songName: '革命(X-Special)',
    }
    test.each([
      ['empty.html', []],
      [
        'single.html',
        [
          createScoreData(hou, 1, 0, 1000000, 'AAA', 7, 10, 408),
          createScoreData(hou, 1, 1, 999770, 'AAA', 6, 9, 716),
          createScoreData(hou, 1, 2, 980070, 'AA+', 5, 5),
          createScoreData(hou, 1, 3, 848330, 'A', 2, 0, 650),
          createScoreData(hou, 1, 4, 236040, 'E', 0, 0),
          createScoreData(ume, 1, 0, 0, 'D', 2, 1, 180),
          createScoreData(ume, 1, 1, 850000, 'A+', 3, 2, 285),
          createScoreData(ume, 1, 2, 690000, 'B-', 2, 0),
          createScoreData(ume, 1, 3, 920000, 'AA', 4, 4, 713),
          createScoreData(kakX, 1, 4, 550000, 'D+', 1, 0),
        ],
      ],
      [
        'double.html',
        [
          createScoreData(hou, 2, 1, 890000, 'AA-', 2, 8),
          createScoreData(hou, 2, 2, 790000, 'A-', 2, 7),
          createScoreData(hou, 2, 3, 760000, 'B+', 2, 6),
          createScoreData(hou, 2, 4, 744460, 'B', 2, 3),
          createScoreData(ume, 2, 1, 680000, 'C+', 2, 0),
          createScoreData(ume, 2, 2, 620000, 'C', 2, 0),
          createScoreData(ume, 2, 3, 595000, 'C-', 2, 0),
        ],
      ],
    ])('(%s) returns %o', async (fileName, expected) => {
      // Arrange
      const source = await createSource(fileName)

      // Act
      const result = parsePlayDataList(source)

      // Assert
      expect(result).toStrictEqual(expected)
    })
  })
})
