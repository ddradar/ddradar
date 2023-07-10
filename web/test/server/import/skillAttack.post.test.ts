// @vitest-environment node
import {
  areaHiddenUser,
  privateUser,
  publicUser,
  testScores,
  testSongData,
} from '@ddradar/core/test/data'
import { fetchList, fetchOne, getContainer } from '@ddradar/db'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import importSkillAttack from '~~/server/api/v1/import/skillAttack.post'
import { getLoginUserInfo } from '~~/server/utils/auth'
import { sendNullWithError } from '~~/server/utils/http'
import { upsertScore } from '~~/server/utils/score'
import { createEvent } from '~~/test/test-utils-server'

vi.mock('@ddradar/db')
vi.mock('~~/server/utils/auth')
vi.mock('~~/server/utils/http')
vi.mock('~~/server/utils/score')

describe('POST /api/v1/import/skillAttack', () => {
  const mockedContainer = { items: { batch: vi.fn() } }
  beforeAll(() => {
    vi.mocked(sendNullWithError).mockReturnValue(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getContainer).mockReturnValue(mockedContainer as any)
  })
  beforeEach(() => {
    vi.mocked(fetchList).mockClear()
    vi.mocked(fetchOne).mockClear()
    vi.mocked(sendNullWithError).mockClear()
    mockedContainer.items.batch.mockClear()
    vi.mocked(upsertScore).mockClear()
  })

  test('(user: <anonymous>) returns 401', async () => {
    // Arrange
    vi.mocked(getLoginUserInfo).mockResolvedValue(null)
    const event = createEvent()

    // Act
    const userScores = await importSkillAttack(event)

    // Assert
    expect(userScores).toBeNull()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 401)
    expect(vi.mocked(fetchOne)).not.toBeCalled()
    expect(vi.mocked(fetchList)).not.toBeCalled()
  })

  test('(user: { code: undefined }) returns 400', async () => {
    // Arrange
    vi.mocked(getLoginUserInfo).mockResolvedValue({
      ...publicUser,
      code: undefined,
    })
    const event = createEvent()

    // Act
    const userScores = await importSkillAttack(event)

    // Assert
    expect(userScores).toBeNull()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(
      event,
      400,
      'Import operation needs DDR-CODE.'
    )
    expect(vi.mocked(fetchOne)).not.toBeCalled()
    expect(vi.mocked(fetchList)).not.toBeCalled()
  })

  test('returns 404 if not resistered on Skill Attack', async () => {
    // Arrange
    vi.mocked(getLoginUserInfo).mockResolvedValue({ ...publicUser })
    const event = createEvent()
    const raw = vi.fn()
    raw.mockResolvedValue({ ok: false })
    $fetch.raw = raw

    // Act
    const userScores = await importSkillAttack(event)

    // Assert
    expect(userScores).toBeNull()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(event, 404)
    expect(vi.mocked(fetchOne)).not.toBeCalled()
    expect(vi.mocked(fetchList)).not.toBeCalled()
  })
})
