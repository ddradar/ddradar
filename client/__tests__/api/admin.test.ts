import { testSongData } from '@core/__tests__/data'

import { postNotification, postSongInfo } from '~/api/admin'

type NotificationRequest = Parameters<typeof postNotification>[1]

describe('/api/admin.ts', () => {
  const $http = { $post: jest.fn<Promise<any>, [string]>() }
  beforeEach(() => $http.$post.mockClear())

  describe('postNotification()', () => {
    const notification: NotificationRequest = {
      id: 'return-value',
      icon: 'account',
      pinned: true,
      type: 'is-info',
      title: 'Return title',
      body: 'Return message body',
    } as const
    beforeEach(() => $http.$post.mockResolvedValue(notification))
    test('calls POST "/api/v1/admin/notification"', async () => {
      // Arrange
      const body: NotificationRequest = {
        id: 'foo',
        icon: 'account',
        pinned: true,
        type: 'is-info',
        title: 'title',
        body: 'Message body',
      }

      // Act
      const val = await postNotification($http, body)

      // Assert
      expect(val).toBe(notification)
      expect($http.$post).toBeCalledTimes(1)
      expect($http.$post).lastCalledWith('/api/v1/admin/notification', {
        ...body,
        sender: 'SYSTEM',
      })
    })
  })

  describe('postSongInfo()', () => {
    const songInfo = { ...testSongData }
    beforeEach(() => $http.$post.mockResolvedValue(songInfo))
    test('calls POST "/api/v1/admin/songs"', async () => {
      // Arrange
      const body = { ...songInfo, charts: [...songInfo.charts].reverse() }

      // Act
      const val = await postSongInfo($http, body)

      // Assert
      expect(val).toStrictEqual(songInfo)
      expect($http.$post).toBeCalledTimes(1)
      expect($http.$post).lastCalledWith('/api/v1/admin/songs', body)
    })
  })
})
