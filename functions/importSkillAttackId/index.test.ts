import fetchMock from 'jest-fetch-mock'
import { mocked } from 'ts-jest/utils'

import type { SongSchema } from '../db/songs'
import { masterMusicToMap } from '../skill-attack'
import importSkillAttrackId from '.'

jest.mock('../skill-attack')

describe('/importSkillAttrackId/index.ts', () => {
  const context = { log: { error: jest.fn(), info: jest.fn() } }
  const uri = 'http://skillattack.com/sa4/data/master_music.txt'
  const mapMock = mocked(masterMusicToMap)
  beforeEach(() => {
    fetchMock.mockClear()
    mapMock.mockClear()
    context.log.error.mockClear()
    context.log.info.mockClear()
  })
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
      {
        playStyle: 1,
        difficulty: 1,
        level: 8,
        notes: 264,
        freezeArrow: 0,
        shockArrow: 0,
        stream: 56,
        voltage: 44,
        air: 18,
        freeze: 0,
        chaos: 4,
      },
    ],
  }

  test('returns [] if songs is empty', async () => {
    // Arrange - Act
    const result = await importSkillAttrackId(context, null, [])

    // Assert
    expect(result).toStrictEqual([])
    expect(fetchMock).not.toBeCalled()
  })

  test('returns [] with error if fetch() returns 404', async () => {
    // Arrange
    fetchMock.mockResponse('Error', { status: 404, statusText: 'Not Found' })

    // Act
    const result = await importSkillAttrackId(context, null, [song])

    // Assert
    expect(result).toStrictEqual([])
    expect(fetchMock).toBeCalledWith(uri)
    expect(context.log.error).toBeCalledWith('404: Not Found')
    expect(context.log.error).toBeCalledWith('Error')
  })

  test('returns [] if does not match songId', async () => {
    // Arrange
    fetchMock.mockResponse('Success', { status: 200 })
    mapMock.mockReturnValue(new Map())

    // Act
    const result = await importSkillAttrackId(context, null, [song])

    // Assert
    expect(result).toStrictEqual([])
    expect(fetchMock).toBeCalledWith(uri)
    expect(context.log.error).not.toBeCalled()
    expect(context.log.info).toBeCalledWith(
      `Not Found skillAttackId: ${song.name}`
    )
  })

  test('returns [song] if match songId', async () => {
    // Arrange
    fetchMock.mockResponse('Success', { status: 200 })
    mapMock.mockReturnValue(new Map([[song.id, 1]]))

    // Act
    const result = await importSkillAttrackId(context, null, [song])

    // Assert
    expect(result).toStrictEqual([{ ...song, skillAttackId: 1 }])
    expect(fetchMock).toBeCalledWith(uri)
    expect(context.log.error).not.toBeCalled()
    expect(context.log.info).toBeCalledWith(
      `Updated: ${song.name} { id: "${song.id}", skillAttackId: 1 }`
    )
  })
})
