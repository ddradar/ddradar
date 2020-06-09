import type { Context } from '@azure/functions'

import { describeIf } from '../__tests__/util'
import { getConnectionString, getContainer } from '../cosmos'
import { SongSchema } from '../song'
import getSongInfo from '.'

describe('/songs/:id', () => {
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
    expect(typeof getSongInfo).toBe('function')
  })

  test('returns "404 Not Found" if `id` is not defined', async () => {
    // Arrange - Act
    await getSongInfo(context)

    // Assert
    expect(context.res.status).toBe(404)
  })

  test('returns "404 Not Found" if `id` does not match pattern', async () => {
    // Arrange
    context.bindingData.id = 'foo'

    // Act
    await getSongInfo(context)

    // Assert
    expect(context.res.status).toBe(404)
    expect(context.res.body).toBe('Please pass a id like "/api/songs/:id"')
  })

  describeIf(() => !!getConnectionString())(
    'Cosmos DB integration test',
    () => {
      const song: SongSchema = {
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

      beforeAll(async () => {
        await getContainer('Songs').items.create(song)
      })

      test('returns "404 Not Found" if no song that matches `id`', async () => {
        // Arrange
        const id = '00000000000000000000000000000000'
        context.bindingData.id = id

        // Act
        await getSongInfo(context)

        // Assert
        expect(context.res.status).toBe(404)
        expect(context.res.body).toBe(`Not found song that id: "${id}"`)
      })

      test('returns "200 OK" with JSON body if found', async () => {
        // Arrange
        context.bindingData.id = song.id

        // Act
        await getSongInfo(context)

        // Assert
        expect(context.res.status).toBe(200)
        expect(context.res.body).toStrictEqual(song)
      })

      afterAll(async () => {
        await getContainer('Songs').item(song.id, song.nameIndex).delete()
      })
    }
  )
})
