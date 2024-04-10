import { InvocationContext } from '@azure/functions'
import { testSongData } from '@ddradar/core/test/data'
import { ofetch } from 'ofetch'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { handler } from '../../src/functions/importSkillAttackId'
import { masterMusicToMap } from '../../src/skill-attack'

vi.mock('ofetch')
vi.mock('../../src/skill-attack')

describe('/functions/importSkillAttrackId.ts', () => {
  const uri = 'http://skillattack.com/sa4/data/master_music.txt'
  beforeEach(() => {
    vi.mocked(ofetch).mockClear()
    vi.mocked(masterMusicToMap).mockClear()
  })

  test('returns [] if songs is empty', async () => {
    // Arrange
    const ctx = new InvocationContext()
    ctx.extraInputs.set('songs', [])

    // Act
    const result = await handler(null, ctx)

    // Assert
    expect(result).toStrictEqual([])
    expect(vi.mocked(ofetch)).not.toBeCalled()
  })

  test('returns [] with error if ofetch() returns error', async () => {
    // Arrange
    const ctx = new InvocationContext()
    ctx.extraInputs.set('songs', [testSongData])

    vi.mocked(ofetch).mockRejectedValue('Error')

    // Act - Assert
    await expect(handler(null, ctx)).rejects.toThrowError()
    expect(vi.mocked(ofetch)).toBeCalledWith(uri, {
      responseType: 'arrayBuffer',
    })
  })

  test('returns [] if does not match songId', async () => {
    // Arrange
    const ctx = new InvocationContext()
    ctx.extraInputs.set('songs', [testSongData])

    vi.mocked(ofetch).mockResolvedValue(new ArrayBuffer(1))
    vi.mocked(masterMusicToMap).mockReturnValue(new Map())

    // Act
    const result = await handler(null, ctx)

    // Assert
    expect(result).toStrictEqual([])
    expect(vi.mocked(ofetch)).toBeCalledWith(uri, {
      responseType: 'arrayBuffer',
    })
  })

  test('returns [song] if match songId', async () => {
    // Arrange
    const ctx = new InvocationContext()
    ctx.extraInputs.set('songs', [testSongData])

    vi.mocked(ofetch).mockResolvedValue(new ArrayBuffer(1))
    vi.mocked(masterMusicToMap).mockReturnValue(new Map([[testSongData.id, 1]]))

    // Act
    const result = await handler(null, ctx)

    // Assert
    expect(result).toStrictEqual([{ ...testSongData, skillAttackId: 1 }])
    expect(vi.mocked(ofetch)).toBeCalledWith(uri, {
      responseType: 'arrayBuffer',
    })
  })
})
