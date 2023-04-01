import { InvocationContext } from '@azure/functions'
import { testSongData } from '@ddradar/core/test/data'
import { fetch } from 'node-fetch-native'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { handler } from '../../src/functions/importSkillAttackId'
import { masterMusicToMap } from '../../src/skill-attack'

vi.mock('node-fetch-native', async () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore mock
  ...(await vi.importActual('node-fetch-native')),
  fetch: vi.fn(),
}))
vi.mock('../../src/skill-attack')

describe('/functions/importSkillAttrackId.ts', () => {
  const uri = 'http://skillattack.com/sa4/data/master_music.txt'
  const mapMock = vi.mocked(masterMusicToMap)
  beforeEach(() => {
    vi.mocked(fetch).mockClear()
    mapMock.mockClear()
  })

  test('returns [] if songs is empty', async () => {
    // Arrange
    const ctx = new InvocationContext()
    ctx.extraInputs.set('songs', [])

    // Act
    const result = await handler(null, ctx)

    // Assert
    expect(result).toStrictEqual([])
    expect(vi.mocked(fetch)).not.toBeCalled()
  })

  test('returns [] with error if fetch() returns 404', async () => {
    // Arrange
    const ctx = new InvocationContext()
    ctx.extraInputs.set('songs', [testSongData])

    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: () => Promise.resolve('Error'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    // Act
    const result = await handler(null, ctx)

    // Assert
    expect(result).toStrictEqual([])
    expect(vi.mocked(fetch)).toBeCalledWith(uri)
  })

  test('returns [] if does not match songId', async () => {
    // Arrange
    const ctx = new InvocationContext()
    ctx.extraInputs.set('songs', [testSongData])

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1)),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    mapMock.mockReturnValue(new Map())

    // Act
    const result = await handler(null, ctx)

    // Assert
    expect(result).toStrictEqual([])
    expect(vi.mocked(fetch)).toBeCalledWith(uri)
  })

  test('returns [song] if match songId', async () => {
    // Arrange
    const ctx = new InvocationContext()
    ctx.extraInputs.set('songs', [testSongData])

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1)),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    mapMock.mockReturnValue(new Map([[testSongData.id, 1]]))

    // Act
    const result = await handler(null, ctx)

    // Assert
    expect(result).toStrictEqual([{ ...testSongData, skillAttackId: 1 }])
    expect(vi.mocked(fetch)).toBeCalledWith(uri)
  })
})
