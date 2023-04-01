import { describe, expect, test } from 'vitest'

import { isNotificationSchema } from '../src/notification'

describe('notification.ts', () => {
  describe('isNotificationSchema', () => {
    const validBody = {
      sender: 'SYSTEM',
      pinned: true,
      type: 'is-info',
      icon: 'info',
      title: 'このサイトはベータ版です',
      body: 'このWebサイトはベータ版環境です。',
    } as const

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
    ])('(%o) returns false', o => expect(isNotificationSchema(o)).toBe(false))
    test.each([
      validBody,
      { ...validBody, id: 'foo' },
      { ...validBody, type: 'is-dark' },
      { ...validBody, timeStamp: 1597114800 },
    ])('(%o) returns true', o => expect(isNotificationSchema(o)).toBe(true))
  })
})
