import { describe, expect, test } from 'vitest'

import type { Notification } from '../src/notification'
import { notificationSchema } from '../src/notification'

describe('notification.ts', () => {
  describe('notificationSchema', () => {
    const validBody: Notification = {
      id: 'foo',
      color: 'yellow',
      icon: 'i-heroicons-exclamation-triangle',
      title: 'このサイトはベータ版です',
      body: 'このWebサイトはベータ版環境です。',
      timeStamp: 1597114800,
    }

    test.each([
      undefined,
      null,
      true,
      1,
      'foo',
      {},
      { ...validBody, id: undefined },
      { ...validBody, color: 'foo' },
      { ...validBody, icon: false },
      { ...validBody, icon: 'foo' },
      { ...validBody, title: 1 },
      { ...validBody, body: [] },
      { ...validBody, timeStamp: [] },
    ])('safeParse(%o) returns { success: false }', o =>
      expect(notificationSchema.safeParse(o).success).toBe(false)
    )
    test.each([validBody, { ...validBody, color: 'blue' }])(
      '(%o) returns { success: true }',
      o => expect(notificationSchema.safeParse(o).success).toBe(true)
    )
  })
})
