// @vitest-environment node
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { publicUser } from '@ddradar/core/test/data'
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

  test('returns 200 with imported score', async () => {
    // Arrange
    vi.mocked(getLoginUserInfo).mockResolvedValue({ ...publicUser })
    vi.mocked(fetchOne).mockImplementation((_1, _2, condition) =>
      Promise.resolve(
        condition.value === 700
          ? {
              id: 'o068b00O6QD8lo9O1i9PbQlqO6IQOidD',
              name: 'New Century',
              charts: [
                { playStyle: 1, difficulty: 0 },
                { playStyle: 1, difficulty: 1 },
                { playStyle: 1, difficulty: 2 },
                { playStyle: 1, difficulty: 3 },
                { playStyle: 1, difficulty: 4 },
              ],
            }
          : condition.value === 455
            ? {
                id: 'lo6bOoq86d9od6qQ9PiPibOioOQb96lP',
                name: 'TWINKLE♥HEART',
                charts: [{ playStyle: 2, difficulty: 1 }],
              }
            : condition.value === '700'
              ? {
                  id: '80PdqQ0iiOQb9i91lIliodiO9PI8O609',
                  name: 'エキサイティング！！も・ちゃ・ちゃ☆',
                  charts: [{ playStyle: 1, difficulty: 0 }],
                }
              : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (null as any)
      )
    )
    const event = createEvent()
    const raw = vi.fn()
    const arrayBuffer = async () =>
      (await readFile(resolve(__dirname, 'score_10000000.txt'))).buffer
    raw.mockResolvedValue({ ok: true, arrayBuffer })
    $fetch.raw = raw

    // Act
    const userScores = await importSkillAttack(event)

    // Assert
    expect(userScores).not.toBeNull()
    expect(vi.mocked(sendNullWithError)).not.toBeCalled()
    expect(vi.mocked(upsertScore)).toBeCalled()
    expect(mockedContainer.items.batch).toBeCalled()
  })
})
