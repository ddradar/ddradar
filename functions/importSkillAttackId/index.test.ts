import { testSongData } from '@ddradar/core/test/data'
import { fetch } from 'node-fetch-native'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { masterMusicToMap } from '../skill-attack'
import importSkillAttrackId from '.'

vi.mock('node-fetch-native', async () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore mock
  ...(await vi.importActual('node-fetch-native')),
  fetch: vi.fn(),
}))
vi.mock('../skill-attack')

describe('/importSkillAttrackId/index.ts', () => {
  const context = { log: { error: vi.fn(), info: vi.fn() } }
  const uri = 'http://skillattack.com/sa4/data/master_music.txt'
  const mapMock = vi.mocked(masterMusicToMap)
  beforeEach(() => {
    vi.mocked(fetch).mockClear()
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
    expect(vi.mocked(fetch)).not.toBeCalled()
  })

  test('returns [] with error if fetch() returns 404', async () => {
    // Arrange
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: () => Promise.resolve('Error'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    // Act
    const result = await importSkillAttrackId(context, null, [song])

    // Assert
    expect(result).toStrictEqual([])
    expect(vi.mocked(fetch)).toBeCalledWith(uri)
    expect(context.log.error).toBeCalledWith('404: Not Found')
    expect(context.log.error).toBeCalledWith('Error')
  })

  test('returns [] if does not match songId', async () => {
    // Arrange
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1)),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    mapMock.mockReturnValue(new Map())

    // Act
    const result = await importSkillAttrackId(context, null, [song])

    // Assert
    expect(result).toStrictEqual([])
    expect(vi.mocked(fetch)).toBeCalledWith(uri)
    expect(context.log.error).not.toBeCalled()
    expect(context.log.info).toBeCalledWith(
      `Not Found skillAttackId: ${song.name}`
    )
  })

  test('returns [song] if match songId', async () => {
    // Arrange
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1)),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    mapMock.mockReturnValue(new Map([[song.id, 1]]))

    // Act
    const result = await importSkillAttrackId(context, null, [song])

    // Assert
    expect(result).toStrictEqual([{ ...song, skillAttackId: 1 }])
    expect(vi.mocked(fetch)).toBeCalledWith(uri)
    expect(context.log.error).not.toBeCalled()
    expect(context.log.info).toBeCalledWith(
      `Updated: ${song.name} { id: "${song.id}", skillAttackId: 1 }`
    )
  })
})
