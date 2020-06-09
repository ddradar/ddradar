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

  test.each([undefined, null, 'foo', 0.1, -1, 100])(
    'returns "404 Not Found" if bindingData.series is "%s"',
    async (series: unknown) => {
      // Arrange
      context.bindingData.series = series

      // Act
      await searchSong(context, { query: {} })

      // Assert
      expect(context.res.status).toBe(404)
      expect(context.res.body).toBe(
        '"series" and "name" are not defined or are invalid values'
      )
    }
  )

  test.each([undefined, null, 'foo', 0.1, -1, 100])(
    'returns "404 Not Found" if bindingData.name is "%s"',
    async (name: unknown) => {
      // Arrange
      context.bindingData.name = name

      // Act
      await searchSong(context)

      // Assert
      expect(context.res.status).toBe(404)
      expect(context.res.body).toBe(
        '"series" and "name" are not defined or are invalid values'
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

      test('/songs/series/0?name=0 returns "404 Not Found"', async () => {
        // Arrange
        context.bindingData.series = 0
        // Act
        await searchSong(context, { query: { name: '0' } })

        // Assert
        expect(context.res.status).toBe(404)
        expect(context.res.body).toBe(
          'Not found song that {series: "DDR 1st" nameIndex: 0}'
        )
      })

      test('/songs/name/0?series=0 returns "404 Not Found"', async () => {
        // Arrange
        context.bindingData.name = 0
        // Act
        await searchSong(context, { query: { series: '0' } })

        // Assert
        expect(context.res.status).toBe(404)
        expect(context.res.body).toBe(
          'Not found song that {series: "DDR 1st" nameIndex: 0}'
        )
      })

      test.each([
        [0, '', [songs[0]]],
        [0, '25', [songs[0]]],
        [10, '25', [songs[1]]],
        [10, '28', [songs[2]]],
        [10, '', [songs[1], songs[2]]],
      ])(
        '/songs/series/%i?name=%s returns "200 OK" with JSON body',
        async (series, name, expected) => {
          // Arrange
          context.bindingData.series = series

          // Act
          await searchSong(context, { query: { name } })

          // Assert
          expect(context.res.status).toBe(200)
          expect(context.res.body).toStrictEqual(expected)
        }
      )

      test.each([
        [25, '0', [songs[0]]],
        [25, '10', [songs[1]]],
        [28, '', [songs[2]]],
        [28, '10', [songs[2]]],
        [25, '', [songs[0], songs[1]]],
      ])(
        '/songs/name/%i?series=%s returns "200 OK" with JSON body',
        async (name, series, expected) => {
          // Arrange
          context.bindingData.name = name

          // Act
          await searchSong(context, { query: { series } })

          // Assert
          expect(context.res.status).toBe(200)
          expect(context.res.body).toStrictEqual(expected)
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
