import type { Context } from '@azure/functions'

import { describeIf } from '../__tests__/util'
import { getConnectionString, getContainer } from '../cosmos'
import type { SongSchema } from '../db'
import searchSong from '.'

describe('GET /api/v1/songs/name', () => {
  let context: Pick<Context, 'bindingData'>
  beforeEach(() => {
    context = { bindingData: {} }
  })

  test.each([NaN, 0.1, -1, 100])(
    '/%s returns "404 Not Found"',
    async (name: unknown) => {
      // Arrange
      context.bindingData.name = name

      // Act
      const result = await searchSong(context, { query: {} })

      // Assert
      expect(result.status).toBe(404)
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
        await Promise.all(songs.map(s => container.items.create(s)))
      })

      test('/0?series=0 returns "404 Not Found"', async () => {
        // Arrange
        context.bindingData.name = {} // if param is 0, passed object. (bug?)

        // Act
        const result = await searchSong(context, { query: { series: '0' } })

        // Assert
        expect(result.status).toBe(404)
        expect(result.body).toBe(
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
          const result = await searchSong(context, { query: { series } })

          // Assert
          expect(result.status).toBe(200)
          expect(result.body).toStrictEqual(expected)
        }
      )

      afterAll(async () => {
        const container = getContainer('Songs')
        await Promise.all(
          songs.map(s => container.item(s.id, s.nameIndex).delete())
        )
      })
    }
  )
})
