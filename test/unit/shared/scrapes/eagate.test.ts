// @vitest-environment happy-dom
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { describe, expect, test } from 'vitest'

import { ClearLamp, FlareRank } from '#shared/schemas/score'
import { Chart } from '#shared/schemas/step-chart'
import { parsePlayDataList, parseScoreDetail } from '#shared/scrapes/eagate'

type EAGateScoreRecord = ReturnType<typeof parsePlayDataList>[number]
type EAGateScoreRecordWithRivals = ReturnType<typeof parseScoreDetail>

const readFileAsync = (folder: string, fileName: string) =>
  readFile(join(__dirname, '../../../data/eagate', folder, fileName), {
    encoding: 'utf8',
  })
const createScore = (
  [playStyle, difficulty]: readonly [
    EAGateScoreRecord['playStyle'],
    EAGateScoreRecord['difficulty'],
  ],
  normalScore: EAGateScoreRecord['normalScore'],
  rank: EAGateScoreRecord['rank'],
  clearLamp: EAGateScoreRecord['clearLamp'],
  flareRank: EAGateScoreRecord['flareRank']
): Omit<EAGateScoreRecord, 'songId' | 'name'> => ({
  playStyle,
  difficulty,
  normalScore,
  rank,
  clearLamp,
  flareRank,
  maxCombo: null,
  flareSkill: null,
})

describe('/shared/scrapes/eagate', () => {
  describe('parsePlayDataList', async () => {
    const folder = 'music_data'
    const template = await readFileAsync(folder, 'template.html')

    /** Create source HTML. */
    const createSource = async (fileName: string) =>
      template.replace('{{ contents }}', await readFileAsync(folder, fileName))

    /** Generate score data. */
    const scoreData = (
      song: Pick<EAGateScoreRecord, 'songId' | 'name'>,
      chart: readonly [
        EAGateScoreRecord['playStyle'],
        EAGateScoreRecord['difficulty'],
      ],
      normalScore: EAGateScoreRecord['normalScore'],
      rank: EAGateScoreRecord['rank'],
      clearLamp: EAGateScoreRecord['clearLamp'],
      flareRank: EAGateScoreRecord['flareRank'],
      flareSkill?: EAGateScoreRecord['flareSkill']
    ): EAGateScoreRecord => ({
      ...song,
      ...createScore(chart, normalScore, rank, clearLamp, flareRank),
      ...(flareSkill !== undefined ? { flareSkill } : {}),
    })

    /** 鳳 */
    const hou = { songId: 'QiPiIb8I99loq8loIq91iP6l1OOoq8oq', name: '鳳' }
    /** 梅雪夜 */
    const ume = {
      songId: 'bi9OolI1P9oI8dDPlbQiq01Dl080PQ61',
      name: '梅雪夜',
    }
    /** 革命(X-Special) */
    const kakX = {
      songId: 'qIqqdd1Odqi1Iiolq9qqPOi0bPPld8Pb',
      name: '革命(X-Special)',
    }

    test.each([
      '',
      'foo',
      '<html></html>',
      '<html>\n<div id="data_tbl" />\n</html>',
    ])('("%s") throws error', source => {
      const document = new DOMParser().parseFromString(source, 'text/html')
      expect(() => parsePlayDataList(document)).toThrowError('invalid html')
    })

    test.each(['invalid_column.html', 'invalid_chart_id.html'])(
      '(%s) throws error',
      async fileName => {
        // Arrange
        const source = await createSource(fileName)
        const document = new DOMParser().parseFromString(source, 'text/html')

        // Act - Assert
        expect(() => parsePlayDataList(document)).toThrowError('invalid html')
      }
    )

    test.each([
      ['empty.html', []],
      [
        'single.html',
        [
          scoreData(
            hou,
            Chart.bSP,
            1000000,
            'AAA',
            ClearLamp.MFC,
            FlareRank.EX,
            408
          ),
          scoreData(
            hou,
            Chart.BSP,
            999770,
            'AAA',
            ClearLamp.PFC,
            FlareRank.IX,
            716
          ),
          scoreData(hou, Chart.DSP, 980070, 'AA+', ClearLamp.GFC, FlareRank.V),
          scoreData(
            hou,
            Chart.ESP,
            848330,
            'A',
            ClearLamp.Clear,
            FlareRank.None,
            650
          ),
          scoreData(
            hou,
            Chart.CSP,
            236040,
            'E',
            ClearLamp.Failed,
            FlareRank.None
          ),
          scoreData(ume, Chart.bSP, 0, 'D', ClearLamp.Clear, FlareRank.I, 180),
          scoreData(
            ume,
            Chart.BSP,
            850000,
            'A+',
            ClearLamp.Life4,
            FlareRank.II,
            285
          ),
          scoreData(
            ume,
            Chart.DSP,
            690000,
            'B-',
            ClearLamp.Clear,
            FlareRank.None
          ),
          scoreData(
            ume,
            Chart.ESP,
            920000,
            'AA',
            ClearLamp.FC,
            FlareRank.IV,
            713
          ),
          scoreData(
            kakX,
            Chart.CSP,
            550000,
            'D+',
            ClearLamp.Assisted,
            FlareRank.None
          ),
        ],
      ],
      [
        'double.html',
        [
          scoreData(
            hou,
            Chart.BDP,
            890000,
            'AA-',
            ClearLamp.Clear,
            FlareRank.VIII
          ),
          scoreData(
            hou,
            Chart.DDP,
            790000,
            'A-',
            ClearLamp.Clear,
            FlareRank.VII
          ),
          scoreData(
            hou,
            Chart.EDP,
            760000,
            'B+',
            ClearLamp.Clear,
            FlareRank.VI
          ),
          scoreData(
            hou,
            Chart.CDP,
            744460,
            'B',
            ClearLamp.Clear,
            FlareRank.III
          ),
          scoreData(
            ume,
            Chart.BDP,
            680000,
            'C+',
            ClearLamp.Clear,
            FlareRank.None
          ),
          scoreData(
            ume,
            Chart.DDP,
            620000,
            'C',
            ClearLamp.Clear,
            FlareRank.None
          ),
          scoreData(
            ume,
            Chart.EDP,
            595000,
            'C-',
            ClearLamp.Clear,
            FlareRank.None
          ),
        ],
      ],
    ])('(%s) returns %o', async (fileName, expected) => {
      // Arrange
      const source = await createSource(fileName)
      const document = new DOMParser().parseFromString(source, 'text/html')

      // Act
      const result = parsePlayDataList(document)

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
      const document = new DOMParser().parseFromString(source, 'text/html')
      expect(() => parseScoreDetail(document)).toThrowError('invalid html')
    })

    test.each([
      ['invalid_header.html', 'invalid html'],
      ['invalid_content.html', 'invalid html'],
      ['no_select.html', '難易度を選択してください。'],
      ['no_play.html', 'NO PLAY...'],
    ])('(%s) throws "%s" error', async (fileName, err) => {
      // Arrange
      const source = await readFileAsync('music_detail', fileName)
      const document = new DOMParser().parseFromString(source, 'text/html')

      // Act - Assert
      expect(() => parseScoreDetail(document)).toThrowError(err)
    })

    test.each([
      [
        'sp_beg_mfc_ex.html',
        {
          songId: '0i8iq6bldDo9l0iDi9q9OqIoQOlqld0q',
          name: 'サインはB -New Arrange Ver.-',
          ...createScore(
            Chart.bSP,
            1000000,
            'AAA',
            ClearLamp.MFC,
            FlareRank.EX
          ),
          maxCombo: 56,
          flareSkill: 248,
          rivalScores: [{ name: 'XXXXXX / XXXXX', normalScore: 1000000 }],
        },
      ],
      [
        'sp_bas_gfc_ix.html',
        {
          songId: 'OQb96d6qD9bPdD819QO0b88blIllldoi',
          name: 'One Sided Love',
          ...createScore(Chart.BSP, 992200, 'AAA', ClearLamp.GFC, FlareRank.IX),
          maxCombo: 111,
          flareSkill: 315,
          rivalScores: [{ name: 'XXXXXX / XXXXX', normalScore: 1000000 }],
        },
      ],
      [
        'sp_dif_fc_vii.html',
        {
          songId: 'QiPiIb8I99loq8loIq91iP6l1OOoq8oq',
          name: '鳳',
          ...createScore(Chart.DSP, 990070, 'AAA', ClearLamp.FC, FlareRank.VII),
          maxCombo: 550,
          rivalScores: [{ name: 'XXXXXX / XXXXX', normalScore: 999820 }],
        },
      ],
      [
        'sp_exp_life4_iv.html',
        {
          songId: '61P0I66id16QIi08Q1918PlldOOiooql',
          name: 'New York EVOLVED (Type B)',
          ...createScore(
            Chart.ESP,
            974750,
            'AA+',
            ClearLamp.Clear, // Life4 Clear ignored
            FlareRank.IV
          ),
          maxCombo: 387,
          flareSkill: 768,
          rivalScores: [{ name: 'XXXXXX / XXXXX', normalScore: 999880 }],
        },
      ],
      [
        'sp_cha_clear_i.html',
        {
          songId: 'bdP0IOiPiQ8OlIbD1QQO8O6dPQqqb1Qb',
          name: '音楽 (STARDOM Remix)',
          ...createScore(
            Chart.CSP,
            952020,
            'AA+',
            ClearLamp.Clear,
            FlareRank.I
          ),
          maxCombo: 486,
          flareSkill: 673,
          rivalScores: [{ name: 'XXXXXX / XXXXX', normalScore: 999940 }],
        },
      ],
      [
        'dp_bas_pfc.html',
        {
          songId: 'OiQI998qPiooq60099bPdO886q9bd011',
          name: 'リスペク風神',
          ...createScore(
            Chart.BDP,
            999960,
            'AAA',
            ClearLamp.PFC,
            FlareRank.None
          ),
          maxCombo: 141,
          rivalScores: [
            { name: 'XXXXXX / XXXXX', normalScore: 1000000 },
            {
              name: 'RIVAL1',
              normalScore: 999750,
              flareRank: FlareRank.None,
              rank: 'AAA',
            },
          ],
        },
      ],
      [
        'dp_dif_life4_v.html',
        {
          songId: 'bll06Di6q1QOlddDlPDPiQDDI09bOOoP',
          name: 'Come To m1dy',
          ...createScore(
            Chart.DDP,
            987790,
            'AA+',
            ClearLamp.Clear, // Life4 Clear ignored
            FlareRank.V
          ),
          maxCombo: 427,
          rivalScores: [{ name: 'XXXXXX / XXXXX', normalScore: 999420 }],
        },
      ],
      [
        'dp_exp_failed.html',
        {
          songId: 'bIlqP91O9ld1lqlq6qoq9OiPdqIDPP0l',
          name: 'Lachryma《Re:Queen’M》',
          ...createScore(
            Chart.EDP,
            757410,
            'E',
            ClearLamp.Failed,
            FlareRank.None
          ),
          maxCombo: 283,
          rivalScores: [{ name: 'XXXXXX / XXXXX', normalScore: 930030 }],
        },
      ],
      [
        'dp_cha_assisted.html',
        {
          songId: '9i0q91lPPiO61b9P891O1i86iOP1I08O',
          name: 'EGOISM 440',
          ...createScore(
            Chart.CDP,
            478830,
            'D',
            ClearLamp.Assisted,
            FlareRank.None
          ),
          maxCombo: 79,
          rivalScores: [
            { name: 'XXXXXX / XXXXX', normalScore: 907120 },
            {
              name: 'RIVAL1',
              normalScore: 150000,
              rank: 'E',
              flareRank: FlareRank.None,
            },
            {
              name: 'RIVAL2',
              normalScore: 920000,
              rank: 'AA',
              flareRank: FlareRank.II,
            },
            {
              name: 'RIVAL3',
              normalScore: 900000,
              rank: 'AA',
              flareRank: FlareRank.I,
            },
          ],
        },
      ],
    ] satisfies [string, EAGateScoreRecordWithRivals][])(
      '(%s) returns %o',
      async (fileName, expected) => {
        // Arrange
        const source = await readFileAsync('music_detail', fileName)
        const document = new DOMParser().parseFromString(source, 'text/html')
        // Act - Assert
        expect(parseScoreDetail(document)).toStrictEqual(expected)
      }
    )
  })
})
