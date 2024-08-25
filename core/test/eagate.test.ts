// @vitest-environment happy-dom
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { beforeAll, describe, expect, test } from 'vitest'

import type { ScoreData, ScoreDetailData } from '../src/eagate'
import { parsePlayDataList, parseScoreDetail } from '../src/eagate'
import { Flare, Lamp } from '../src/score'
import { Chart } from '../src/song'

const readFileAsync = (folder: string, fileName: string) =>
  readFile(join(__dirname, 'eagate', folder, fileName), {
    encoding: 'utf8',
  })
const createScore = (
  [playStyle, difficulty]: readonly [
    ScoreData['playStyle'],
    ScoreData['difficulty'],
  ],
  score: ScoreData['score'],
  rank: ScoreData['rank'],
  clearLamp: ScoreData['clearLamp'],
  flareRank: ScoreData['flareRank']
): Omit<ScoreData, 'songId' | 'songName'> => ({
  playStyle,
  difficulty,
  score,
  rank,
  clearLamp,
  flareRank,
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
        expect(() => parsePlayDataList(source)).toThrowError('invalid html')
      }
    )

    const scoreData = (
      song: Pick<ScoreData, 'songId' | 'songName'>,
      chart: readonly [ScoreData['playStyle'], ScoreData['difficulty']],
      score: ScoreData['score'],
      rank: ScoreData['rank'],
      clearLamp: ScoreData['clearLamp'],
      flareRank: ScoreData['flareRank'],
      flareSkill?: ScoreData['flareSkill']
    ): ScoreData => ({
      ...song,
      ...createScore(chart, score, rank, clearLamp, flareRank),
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
          scoreData(hou, Chart.bSP, 1000000, 'AAA', Lamp.MFC, Flare.EX, 408),
          scoreData(hou, Chart.BSP, 999770, 'AAA', Lamp.PFC, Flare.IX, 716),
          scoreData(hou, Chart.DSP, 980070, 'AA+', Lamp.GFC, Flare.V),
          scoreData(hou, Chart.ESP, 848330, 'A', Lamp.Clear, Flare.None, 650),
          scoreData(hou, Chart.CSP, 236040, 'E', Lamp.Failed, Flare.None),
          scoreData(ume, Chart.bSP, 0, 'D', Lamp.Clear, Flare.I, 180),
          scoreData(ume, Chart.BSP, 850000, 'A+', Lamp.Life4, Flare.II, 285),
          scoreData(ume, Chart.DSP, 690000, 'B-', Lamp.Clear, Flare.None),
          scoreData(ume, Chart.ESP, 920000, 'AA', Lamp.FC, Flare.IV, 713),
          scoreData(kakX, Chart.CSP, 550000, 'D+', Lamp.Assisted, Flare.None),
        ],
      ],
      [
        'double.html',
        [
          scoreData(hou, Chart.BDP, 890000, 'AA-', Lamp.Clear, Flare.VIII),
          scoreData(hou, Chart.DDP, 790000, 'A-', Lamp.Clear, Flare.VII),
          scoreData(hou, Chart.EDP, 760000, 'B+', Lamp.Clear, Flare.VI),
          scoreData(hou, Chart.CDP, 744460, 'B', Lamp.Clear, Flare.III),
          scoreData(ume, Chart.BDP, 680000, 'C+', Lamp.Clear, Flare.None),
          scoreData(ume, Chart.DDP, 620000, 'C', Lamp.Clear, Flare.None),
          scoreData(ume, Chart.EDP, 595000, 'C-', Lamp.Clear, Flare.None),
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
  describe('parseScoreDetail', () => {
    test.each([
      '',
      'foo',
      '<html></html>',
      '<html>\n<div id="music_info" />\n</html>',
    ])('("%s") throws error', source => {
      expect(() => parseScoreDetail(source)).toThrowError('invalid html')
    })
    test.each([
      ['invalid_header.html', 'invalid html'],
      ['invalid_content.html', 'invalid html'],
      ['no_select.html', '難易度を選択してください。'],
      ['no_play.html', 'NO PLAY...'],
    ])('(%s) throws "%s" error', async (fileName, err) => {
      // Arrange
      const source = await readFileAsync('music_detail', fileName)

      // Act - Assert
      expect(() => parseScoreDetail(source)).toThrowError(err)
    })
    test.each([
      [
        'sp_beg_mfc_ex.html',
        {
          songId: '0i8iq6bldDo9l0iDi9q9OqIoQOlqld0q',
          songName: 'サインはB -New Arrange Ver.-',
          ...createScore(Chart.bSP, 1000000, 'AAA', Lamp.MFC, Flare.EX),
          maxCombo: 56,
          flareSkill: 248,
          topScore: 1000000,
        },
      ],
      [
        'sp_bas_gfc_ix.html',
        {
          songId: 'OQb96d6qD9bPdD819QO0b88blIllldoi',
          songName: 'One Sided Love',
          ...createScore(Chart.BSP, 992200, 'AAA', Lamp.GFC, Flare.IX),
          maxCombo: 111,
          flareSkill: 315,
          topScore: 1000000,
        },
      ],
      [
        'sp_dif_fc_vii.html',
        {
          songId: 'QiPiIb8I99loq8loIq91iP6l1OOoq8oq',
          songName: '鳳',
          ...createScore(Chart.DSP, 990070, 'AAA', Lamp.FC, Flare.VII),
          maxCombo: 550,
          topScore: 999820,
        },
      ],
      [
        'sp_exp_life4_iv.html',
        {
          songId: '61P0I66id16QIi08Q1918PlldOOiooql',
          songName: 'New York EVOLVED (Type B)',
          ...createScore(Chart.ESP, 974750, 'AA+', Lamp.Life4, Flare.IV),
          maxCombo: 387,
          flareSkill: 768,
          topScore: 999880,
        },
      ],
      [
        'sp_cha_clear_i.html',
        {
          songId: 'bdP0IOiPiQ8OlIbD1QQO8O6dPQqqb1Qb',
          songName: '音楽 (STARDOM Remix)',
          ...createScore(Chart.CSP, 952020, 'AA+', Lamp.Clear, Flare.I),
          maxCombo: 486,
          flareSkill: 673,
          topScore: 999940,
        },
      ],
      [
        'dp_bas_pfc.html',
        {
          songId: 'OiQI998qPiooq60099bPdO886q9bd011',
          songName: 'リスペク風神',
          ...createScore(Chart.BDP, 999960, 'AAA', Lamp.PFC, Flare.None),
          maxCombo: 141,
          topScore: 1000000,
        },
      ],
      [
        'dp_dif_life4_v.html',
        {
          songId: 'bll06Di6q1QOlddDlPDPiQDDI09bOOoP',
          songName: 'Come To m1dy',
          ...createScore(Chart.DDP, 987790, 'AA+', Lamp.Life4, Flare.V),
          maxCombo: 427,
          topScore: 999420,
        },
      ],
      [
        'dp_exp_failed.html',
        {
          songId: 'bIlqP91O9ld1lqlq6qoq9OiPdqIDPP0l',
          songName: 'Lachryma《Re:Queen’M》',
          ...createScore(Chart.EDP, 757410, 'E', Lamp.Failed, Flare.None),
          maxCombo: 283,
          topScore: 930030,
        },
      ],
      [
        'dp_cha_assisted.html',
        {
          songId: '9i0q91lPPiO61b9P891O1i86iOP1I08O',
          songName: 'EGOISM 440',
          ...createScore(Chart.CDP, 478830, 'D', Lamp.Assisted, Flare.None),
          maxCombo: 79,
          topScore: 907120,
        },
      ],
    ] satisfies [string, ScoreDetailData][])(
      '(%s) returns %o',
      async (fileName, expected) => {
        // Arrange
        const source = await readFileAsync('music_detail', fileName)
        // Act - Assert
        expect(parseScoreDetail(source)).toStrictEqual(expected)
      }
    )
  })
})
