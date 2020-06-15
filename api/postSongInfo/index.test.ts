import type { Context } from '@azure/functions'

import { describeIf } from '../__tests__/util'
import { getConnectionString, getContainer } from '../cosmos'
import { SongSchema } from '../song'
import postSongInfo from '.'

describe('POST /api/admin/songs', () => {
  let context: Context

  beforeEach(() => {
    context = {} as Context
  })

  test.each([undefined, null, true, 1, 'foo', {}])(
    'returns "400 Bad Request" if body is %p',
    async (body: unknown) => {
      // Arrange
      const req = { body }

      // Act
      await postSongInfo(context, req)

      // Assert
      expect(context.res?.status).toBe(400)
      expect(context.res?.body).toBe('Body is not SongSchema')
    }
  )

  describeIf(() => !!getConnectionString())(
    'Cosmos DB integration test',
    () => {
      const songToBeCreated: SongSchema = {
        id: '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
        name: 'PARANOiA',
        nameKana: 'PARANOIA',
        nameIndex: 25,
        artist: '180',
        series: 'DDR 1st',
        minBPM: 180,
        maxBPM: 180,
        charts: [
          {
            playStyle: 1,
            difficulty: 0,
            level: 4,
            notes: 138,
            freezeArrow: 0,
            shockArrow: 0,
            stream: 29,
            voltage: 22,
            air: 5,
            freeze: 0,
            chaos: 0,
          },
        ],
      }
      const songToBeUpdated: SongSchema = {
        id: '8Il6980di8P89lil1PDIqqIbiq1QO8lQ',
        name: 'MAKE IT BETTER',
        nameKana: 'MAKE IT BETTER',
        nameIndex: 22,
        artist: 'mitsu-O!',
        series: '1st',
        minBPM: 119,
        maxBPM: 119,
        charts: [
          {
            playStyle: 1,
            difficulty: 0,
            level: 3,
            notes: 67,
            freezeArrow: 0,
            shockArrow: 0,
            stream: 14,
            voltage: 14,
            air: 9,
            freeze: 0,
            chaos: 0,
          },
        ],
      }

      beforeAll(
        async () => await getContainer('Songs').items.create(songToBeUpdated)
      )

      test('returns "200 OK" with JSON body (Create)', async () => {
        // Arrange - Act
        await postSongInfo(context, { body: songToBeCreated })

        // Assert
        expect(context.res?.status).toBe(200)
        expect(context.res?.body).toStrictEqual(songToBeCreated)
      })

      test('returns "200 OK" with JSON body (Update)', async () => {
        // Arrange
        const body = { ...songToBeUpdated, name: 'foo' }

        // Act
        await postSongInfo(context, { body })

        // Assert
        expect(context.res?.status).toBe(200)
        expect(context.res?.body).toStrictEqual(body)
      })

      afterAll(async () => {
        await getContainer('Songs')
          .item(songToBeCreated.id, songToBeCreated.nameIndex)
          .delete()
        await getContainer('Songs')
          .item(songToBeUpdated.id, songToBeUpdated.nameIndex)
          .delete()
      })
    }
  )
})
