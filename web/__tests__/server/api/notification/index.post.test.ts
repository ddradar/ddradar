import { getContainer } from '@ddradar/db'
import { useBody } from 'h3'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import { createEvent } from '~/__tests__/server/test-util'
import postNotification, {
  NotificationBody,
} from '~/server/api/v1/notification/index.post'
import { sendNullWithError } from '~/server/utils'

vi.mock('@ddradar/db')
vi.mock('h3')
vi.mock('~/server/utils')

const timeStamp = 1597114800
Date.now = vi.fn(() => timeStamp * 1000)

describe('POST /api/v1/songs', () => {
  const validBody: NotificationBody = {
    sender: 'SYSTEM',
    pinned: true,
    type: 'is-info',
    icon: 'info',
    title: 'このサイトはベータ版です',
    body: 'このWebサイトはベータ版環境です。',
  }
  const mockedContainer = { items: { upsert: vi.fn() } }
  beforeAll(() => {
    vi.mocked(sendNullWithError).mockReturnValue(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(getContainer).mockReturnValue(mockedContainer as any)
  })
  beforeEach(() => {
    vi.mocked(sendNullWithError).mockClear()
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
    { ...validBody, type: 'is-dark' },
    { ...validBody, icon: false },
    { ...validBody, title: 1 },
    { ...validBody, body: [] },
    { ...validBody, timeStamp: [] },
  ])('(%p) returns "400 Bad Request"', async (body: unknown) => {
    // Arrange
    const event = createEvent()
    vi.mocked(useBody).mockResolvedValue(body)

    // Arrange - Act
    const notification = await postNotification(event)

    // Assert
    expect(notification).toBeNull()
    expect(vi.mocked(sendNullWithError)).toBeCalledWith(
      event,
      400,
      'Invalid Body'
    )
  })

  test.each([
    [validBody, { ...validBody, timeStamp }],
    [
      { ...validBody, id: 'foo' },
      { ...validBody, id: 'foo', timeStamp },
    ],
    [
      { ...validBody, timeStamp },
      { ...validBody, timeStamp },
    ],
  ])('(%p) returns "200 OK" with JSON body %p', async (body, expected) => {
    // Arrange
    const event = createEvent()
    vi.mocked(useBody).mockResolvedValue(body)

    // Arrange - Act
    const notification = await postNotification(event)

    // Assert
    expect(vi.mocked(sendNullWithError)).not.toBeCalled()
    expect(notification).toStrictEqual(expected)
    expect(mockedContainer.items.upsert).toBeCalledWith(expected)
  })
})
