import { describe, expect, test } from 'vitest'

import {
  type DBNotificationSchema,
  dbNotificationSchema,
} from '../../src/schemas/notification'

describe('/schemas/notification', () => {
  const validNotification: DBNotificationSchema = {
    id: 'test',
    type: 'notification',
    sender: 'SYSTEM',
    pinned: true,
    color: 'yellow',
    icon: 'i-heroicons-exclamation-triangle',
    title: 'Test Notification',
    body: 'This is test notification.',
    timeStamp: 1597028400,
  }

  describe('dbNotificationSchema', () => {
    test.each([
      undefined,
      null,
      true,
      1,
      'foo',
      {},
      { ...validNotification, pinned: undefined },
    ])('safeParse(%o) returns { success: false }', o => {
      expect(dbNotificationSchema.safeParse(o).success).toBe(false)
    })
    test.each([
      validNotification,
      { ...validNotification, type: undefined },
      { ...validNotification, sender: undefined },
    ])('safeParse(%o) returns { success: true }', o => {
      expect(dbNotificationSchema.safeParse(o).success).toBe(true)
    })
  })
})
