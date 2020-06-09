import type { Context } from '@azure/functions'

import { getConnectionString, getContainer } from '../cosmos'
import searchSong from '../searchSong'
import { SongSchema } from '../song'
import { describeIf } from './util'

describe('/songs', () => {
  let context: Context

  beforeEach(() => {
    context = {
      log: ({
        error: jest.fn(),
      } as unknown) as typeof context.log,
      bindingData: {},
    } as Context
  })

  test('exports function', () => {
    expect(typeof searchSong).toBe('function')
  })

  test('returns "404 Not Found" if query is not defined', async () => {
    // Arrange - Act
    await searchSong(context, { query: {} })

    // Assert
    expect(context.res.status).toBe(400)
    expect(context.res.body).toBe(
      '"series" and "name" querys are not defined or are invalid values'
    )
  })

  test.each([
    ['foo', 'bar'],
    ['0.1', '0.2'],
    ['-1', '-2'],
    ['100', '200'],
  ])(
    'returns "404 Not Found" if query is { series: "%s", name: "%s" }',
    async (series: string, name: string) => {
      // Arrange - Act
      await searchSong(context, { query: { series, name } })

      // Assert
      expect(context.res.status).toBe(400)
      expect(context.res.body).toBe(
        '"series" and "name" querys are not defined or are invalid values'
      )
    }
  )

  describeIf(() => !!getConnectionString())(
    'Cosmos DB integration test',
    () => {
      const songs: Omit<SongSchema, 'charts'>[] = [
        {
          id: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
          name: 'PARANOiA',
          nameKana: 'PARANOIA',
          nameIndex: 25,
          artist: '180',
          series: 'DDR 1st',
          minBPM: 180,
          maxBPM: 180,
        },
        {
          id: 'I8bQ8ilD9l1Qi9Q9iI0q6qqqiolo01QP',
          name: 'PARANOiA(X-Special)',
          nameKana: 'PARANOIA X SPECIAL',
          nameIndex: 25,
          artist: '180',
          series: 'DDR X',
          minBPM: 180,
          maxBPM: 180,
        },
        {
          id: 'dDO8ili1081QQIb86POQ8qd0P111011o',
          name: 'SP-TRIP MACHINE～JUNGLE MIX～(X-Special)',
          nameKana: 'SP TRIP MACHINE JUNGLE MIX X SPECIAL',
          nameIndex: 28,
          artist: 'DE-SIRE',
          series: 'DDR X',
          minBPM: 160,
          maxBPM: 160,
        },
      ]

      beforeAll(async () => {
        const container = getContainer('Songs')
        for (const song of songs) {
          await container.items.create(song)
        }
      })

      test('returns "404 Not Found" if no song that matches series and nameIndex', async () => {
        // Arrange - Act
        await searchSong(context, { query: { series: '0', name: '0' } })

        // Assert
        expect(context.res.status).toBe(404)
        expect(context.res.body).toBe(
          'Not found song that {series: "DDR 1st" nameIndex: 0}'
        )
      })

      test.each([
        ['', '0', 0],
        ['25', '0', 0],
        ['25', '10', 1],
        ['28', '', 2],
        ['28', '10', 2],
      ])(
        'returns "200 OK" with JSON body if found (single)',
        async (name, series, expectedIndex) => {
          // Arrange - Act
          await searchSong(context, { query: { name, series } })

          // Assert
          expect(context.res.status).toBe(200)
          expect(context.res.body).toStrictEqual([songs[expectedIndex]])
        }
      )

      test.each([
        ['25', '', 0, 1],
        ['', '10', 1, 2],
      ])(
        'returns "200 OK" with JSON body if found (multiple)',
        async (name, series, expectedIndex1, expectedIndex2) => {
          // Arrange - Act
          await searchSong(context, { query: { name, series } })

          // Assert
          expect(context.res.status).toBe(200)
          expect(context.res.body).toStrictEqual([
            songs[expectedIndex1],
            songs[expectedIndex2],
          ])
        }
      )

      afterAll(async () => {
        const container = getContainer('Songs')
        for (const song of songs) {
          await container.item(song.id, song.nameIndex).delete()
        }
      })
    }
  )
})
