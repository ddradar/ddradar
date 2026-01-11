// @vitest-environment happy-dom
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { describe, expect, test } from 'vitest'

import { Chart, PlayStyle } from '#shared/schemas/step-chart'
import { scrapeGrooveRadar, scrapeSongNotes } from '#shared/scrapes/bemani-wiki'

const readFileAsync = (fileName: string) =>
  readFile(join(__dirname, '../../../data/bemani-wiki', fileName), {
    encoding: 'utf8',
  })

describe('shared/scrapes/bemani-wiki', () => {
  describe('scrapeSongNotes', () => {
    test('(total_notes.html) returns expected Map', async () => {
      // Arrange
      const source = await readFileAsync('total_notes.html')
      const document = new DOMParser().parseFromString(source, 'text/html')

      // Act
      const result = scrapeSongNotes(document)

      // Assert
      const expected = [
        // AM-3P is ignored due to missing all chart data
        [
          'GENOM SCREAMS',
          [
            [...Chart.bSP, 84, 0, 0],
            [...Chart.BSP, 169, 0, 0],
            [...Chart.DSP, 205, 0, 0],
            [...Chart.ESP, 238, 0, 0],
            [...Chart.BDP, 195, 0, 0],
            [...Chart.DDP, 225, 0, 0],
            [...Chart.EDP, 272, 7, 0],
          ],
        ],
        [
          'MAKE IT BETTER (So-REAL Mix)',
          [
            [...Chart.bSP, 90, 0, 0],
            [...Chart.BSP, 159, 0, 0],
            [...Chart.DSP, 191, 0, 0],
            [...Chart.ESP, 208, 0, 0],
            [...Chart.CSP, 237, 10, 29],
            [...Chart.BDP, 135, 0, 0],
            [...Chart.DDP, 185, 0, 0],
            [...Chart.EDP, 237, 0, 0],
            [...Chart.CDP, 192, 22, 29],
          ],
        ],
      ] as const
      expect(result).toStrictEqual(
        new Map(
          expected.map(([songName, chart]) => [
            songName,
            chart.map(([playStyle, difficulty, notes, freezes, shocks]) => ({
              playStyle,
              difficulty,
              notes,
              freezes,
              shocks,
            })),
          ])
        )
      )
    })
  })

  describe('scrapeGrooveRadar', () => {
    test.each([
      [
        'groove_radar_sp.html',
        PlayStyle.SINGLE,
        [
          [
            '愛氏AIされ',
            [
              [...Chart.bSP, 16, 11, 5, 12, 0],
              [...Chart.BSP, 32, 23, 20, 22, 0],
              [...Chart.DSP, 61, 46, 7, 14, 26],
              [...Chart.ESP, 107, 81, 5, 4, 105],
            ],
          ],
          [
            '混乱少女♥そふらんちゃん!!',
            [
              [...Chart.bSP, 14, 27, 7, 22, 4],
              [...Chart.BSP, 42, 75, 34, 33, 35],
              [...Chart.DSP, 67, 105, 36, 35, 101],
              [...Chart.ESP, 98, 119, 56, 34, 111],
              [...Chart.CSP, 143, 132, 89, 30, 127],
            ],
          ],
          [
            'ロマンシングエスケープ',
            [
              [...Chart.bSP, 14, 16, 0, 41, 0],
              [...Chart.BSP, 30, 22, 3, 57, 0],
              [...Chart.DSP, 48, 38, 9, 52, 11],
              [...Chart.ESP, 67, 55, 12, 43, 45],
              // CHALLENGE chart is ignored due to missing data
            ],
          ],
          // 地方創生☆チクワクティクス is ignored due to missing all chart data
          ['MAKE IT BETTER', [[...Chart.CSP, 83, 79, 43, 16, 104]]],
        ],
      ],
      [
        'groove_radar_dp.html',
        PlayStyle.DOUBLE,
        [
          [
            '愛氏AIされ',
            [
              [...Chart.BDP, 32, 23, 20, 22, 0],
              [...Chart.DDP, 60, 46, 9, 15, 25],
              [...Chart.EDP, 103, 75, 3, 4, 105],
            ],
          ],
          [
            'ロマンシングエスケープ',
            [
              [...Chart.BDP, 30, 22, 3, 57, 0],
              [...Chart.DDP, 46, 38, 5, 53, 10],
              [...Chart.EDP, 62, 55, 10, 44, 34],
              // CHALLENGE chart is ignored due to missing data
            ],
          ],
          // 地方創生☆チクワクティクス is ignored due to missing all chart data
          ['MAKE IT BETTER', [[...Chart.CDP, 79, 79, 36, 19, 103]]],
        ],
      ],
    ] satisfies [string, StepChart['playStyle'], [string, number[][]][]][])(
      '(%s, %o) returns expected Map',
      async (file, playStyle, expected) => {
        const source = await readFileAsync(file)
        const document = new DOMParser().parseFromString(source, 'text/html')

        const result = scrapeGrooveRadar(document, playStyle)

        expect(result).toStrictEqual(
          new Map(
            expected.map(([songName, chart]) => [
              songName,
              chart.map(
                ([
                  playStyle,
                  difficulty,
                  stream,
                  voltage,
                  air,
                  freeze,
                  chaos,
                ]) => ({
                  playStyle,
                  difficulty,
                  radar: {
                    stream,
                    voltage,
                    air,
                    freeze,
                    chaos,
                  },
                })
              ),
            ])
          )
        )
      }
    )
  })
})
