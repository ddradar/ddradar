// @vitest-environment node
import { getContainer } from '@ddradar/db'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import postNotification from '~~/server/api/v1/notification/index.post'
import { createEvent } from '~~/server/test/utils'

vi.mock('@ddradar/db')

const timeStamp = 1597114800
Date.now = vi.fn(() => timeStamp * 1000)

describe('POST /api/v1/notification', () => {
  const validBody = {
    sender: 'SYSTEM',
    pinned: true,
    color: 'yellow',
    icon: 'i-heroicons-exclamation-triangle',
    title: 'このサイトはベータ版です',
    body: 'このWebサイトはベータ版環境です。',
  }
  const mockedContainer = { items: { upsert: vi.fn() } }
  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getContainer).mockReturnValue(mockedContainer as any)
  })
  beforeEach(() => {
    mockedContainer.items.upsert.mockClear()
  })

  test.each([
    undefined,
    null,
    true,
    1,
    'foo',
    {},
    { ...validBody, sender: 'USER' },
    { ...validBody, pinned: 'false' },
    { ...validBody, icon: false },
    { ...validBody, title: 1 },
    { ...validBody, body: [] },
    { ...validBody, timeStamp: [] },
  ])('(%o) returns 400', async (body: unknown) => {
    // Arrange
    const event = createEvent(undefined, undefined, body)

    // Act - Assert
    await expect(postNotification(event)).rejects.toThrowError()
  })

  test.each([
    [validBody, { ...validBody, timeStamp }],
    [
      { ...validBody, color: 'green' },
      { ...validBody, color: 'green', timeStamp },
    ],
    [
      { ...validBody, id: 'foo' },
      { ...validBody, id: 'foo', timeStamp },
    ],
    [
      { ...validBody, timeStamp },
      { ...validBody, timeStamp },
    ],
  ])('(%o) returns 200 with %o', async (body, expected) => {
    // Arrange
    const event = createEvent(undefined, undefined, body)

    // Arrange - Act
    const notification = await postNotification(event)

    // Assert
    expect(notification).toStrictEqual(expected)
    expect(mockedContainer.items.upsert).toBeCalledWith(expected)
  })
})
