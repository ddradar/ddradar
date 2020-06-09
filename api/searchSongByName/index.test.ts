import type { Context } from '@azure/functions'

import { describeIf } from '../__tests__/util'
import { getConnectionString, getContainer } from '../cosmos'
import { SongSchema } from '../song'
import searchSong from '.'

describe('GET /api/songs/name', () => {
  let context: Context

  beforeEach(() => {
    context = {
      bindingData: {},
    } as Context
  })

  test.each([NaN, 0.1, -1, 100])(
    '/%s returns "404 Not Found"',
    async (name: unknown) => {
      // Arrange
      context.bindingData.name = name

      // Act
      await searchSong(context, { query: {} })

      // Assert
      expect(context.res.status).toBe(404)
      expect(context.res.body).toBe(
        `"name" is undefined or invalid value :${name}`
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

      test('/0?series=0 returns "404 Not Found"', async () => {
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
        [25, '0', [songs[0]]],
        [25, '10', [songs[1]]],
        [28, '', [songs[2]]],
        [28, '0.1', [songs[2]]],
        [28, '-1', [songs[2]]],
        [28, '10', [songs[2]]],
        [25, '', [songs[0], songs[1]]],
      ])(
        '/%i?series=%s returns "200 OK" with JSON body',
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
