import { postNotification, postSongInfo } from '~/api/admin'

type NotificationRequest = Parameters<typeof postNotification>[1]
type SongInfo = Parameters<typeof postSongInfo>[1]

describe('./api/admin.ts', () => {
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
    const songInfo: SongInfo = {
      id: 'i0P1O6lbP1oDd6q6b08iPPoq6iPdI818',
      name: '最終鬼畜妹フランドール・Ｓ',
      nameIndex: 2,
      nameKana: 'さいしゅうきちくいもうとふらんどーる すかーれっと',
      artist: 'ビートまりお(COOL&CREATE)',
      series: 'DanceDanceRevolution A20',
      minBPM: 200,
      maxBPM: 200,
      charts: [
        {
          playStyle: 1,
          difficulty: 0,
          level: 4,
          notes: 175,
          freezeArrow: 26,
          shockArrow: 0,
          stream: 26,
          voltage: 25,
          air: 9,
          freeze: 39,
          chaos: 0,
        },
        {
          playStyle: 2,
          difficulty: 1,
          level: 9,
          notes: 405,
          freezeArrow: 20,
          shockArrow: 0,
          stream: 61,
          voltage: 58,
          air: 27,
          freeze: 28,
          chaos: 8,
        },
      ],
    }
    beforeEach(() => $http.$post.mockResolvedValue(songInfo))
    test('calls POST "/api/v1/admin/songs"', async () => {
      // Arrange
      const body = { ...songInfo, charts: songInfo.charts.reverse() }

      // Act
      const val = await postSongInfo($http, body)

      // Assert
      expect(val).toBe(songInfo)
      expect($http.$post).toBeCalledTimes(1)
      expect($http.$post).lastCalledWith('/api/v1/admin/songs', body)
    })
  })
})
