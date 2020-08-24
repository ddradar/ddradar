import type { NuxtHTTPInstance } from '@nuxt/http'

import type { Notification } from '~/api/notification'
import type { SongInfo } from '~/api/song'

type NotificationRequest = Omit<Notification, 'id' | 'sender' | 'timeStamp'> & {
  id?: string
  timeStamp?: number
}

/**
 * Call "Post Notification" API. (Admin only)
 * @see https://github.com/ddradar/ddradar/tree/master/api/postNotification
 */
export function postNotification(
  $http: Pick<NuxtHTTPInstance, '$post'>,
  body: NotificationRequest
) {
  return $http.$post<NotificationRequest>('/api/v1/admin/notification', {
    ...body,
    sender: 'SYSTEM',
  })
}

/**
 * Call "Post Song Information" API. (Admin only)
 * @see https://github.com/ddradar/ddradar/tree/master/api/postSongInfo
 */
export function postSongInfo(
  $http: Pick<NuxtHTTPInstance, '$post'>,
  body: SongInfo
) {
  return $http.$post<SongInfo>('/api/v1/admin/songs', body)
}
