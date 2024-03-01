import { describe, expect, test } from 'vitest'

import { notificationSchema } from '../src/notification'

describe('notification.ts', () => {
  describe('notificationSchema', () => {
    const validBody = {
      sender: 'SYSTEM',
      pinned: true,
      type: 'is-info',
      icon: 'info',
      title: 'このサイトはベータ版です',
      body: 'このWebサイトはベータ版環境です。',
      timeStamp: 1597114800,
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
    ])('safeParse(%o) returns { success: false }', o =>
      expect(notificationSchema.safeParse(o).success).toBe(false)
    )
    test.each([
      validBody,
      { ...validBody, id: 'foo' },
      { ...validBody, type: 'is-dark' },
    ])('(%o) returns { success: true }', o =>
      expect(notificationSchema.safeParse(o).success).toBe(true)
    )
  })
})
