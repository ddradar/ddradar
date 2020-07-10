import type { Context } from '@azure/functions'

import { describeIf } from '../__tests__/util'
import { getConnectionString, getContainer } from '../cosmos'
import type { SongSchema } from '../db'
import getSongInfo from '.'

describe('GET /api/v1/songs', () => {
  let context: Pick<Context, 'bindingData'>
  beforeEach(() => {
    context = { bindingData: {} }
  })

  test('/ returns "404 Not Found"', async () => {
    // Arrange - Act
    const result = await getSongInfo(context)

    // Assert
    expect(result.status).toBe(404)
  })

  test('/foo returns "404 Not Found"', async () => {
    // Arrange
    context.bindingData.id = 'foo'

    // Act
    const result = await getSongInfo(context)

    // Assert
    expect(result.status).toBe(404)
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

      test('/00000000000000000000000000000000 returns "404 Not Found"', async () => {
        // Arrange
        const id = '00000000000000000000000000000000'
        context.bindingData.id = id

        // Act
        const result = await getSongInfo(context)

        // Assert
        expect(result.status).toBe(404)
        expect(result.body).toBe(`Not found song that id: "${id}"`)
      })

      test('/06loOQ0DQb0DqbOibl6qO81qlIdoP9DI returns "200 OK" with JSON body', async () => {
        // Arrange
        context.bindingData.id = song.id

        // Act
        const result = await getSongInfo(context)

        // Assert
        expect(result.status).toBe(200)
        expect(result.body).toStrictEqual(song)
      })

      afterAll(async () => {
        await getContainer('Songs').item(song.id, song.nameIndex).delete()
      })
    }
  )
})
