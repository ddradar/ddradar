import { isNotification, NotificationSchema } from '../../db/notification'

describe('./db/notification.ts', () => {
  describe('isNotification', () => {
    const notification: NotificationSchema = {
      id: '<Auto Generated>',
      sender: 'SYSTEM',
      pinned: true,
      type: 'is-info',
      icon: 'info',
      title: 'このサイトはベータ版です',
      body: '以下の点にご留意してご利用ください。',
      _ts: 1597028400,
    } as const
    test.each([
      { ...notification, id: 0 },
      { ...notification, sender: 'user' },
      { ...notification, pinned: 'true' },
      { ...notification, type: 'danger' },
      { ...notification, icon: false },
      { ...notification, title: null },
      { ...notification, body: undefined },
      { ...notification, _ts: new Date(1597028400) },
    ])('(%p) returns false', obj => {
      expect(isNotification(obj)).toBe(false)
    })
    test.each([
      notification,
      { ...notification, pinned: false },
      { ...notification, type: 'is-warning' },
      { ...notification, icon: 'calendar' },
      { ...notification, _ts: new Date().valueOf() },
    ])('(%p) returns true', obj => {
      expect(isNotification(obj)).toBe(true)
    })
  })
})
