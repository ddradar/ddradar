import { testSongData } from '@ddradar/core/__tests__/data'
import fetchMock from 'jest-fetch-mock'
import { mocked } from 'ts-jest/utils'

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
  const song = { ...testSongData }

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
