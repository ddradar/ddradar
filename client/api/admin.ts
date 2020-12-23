import type { NotificationBody } from '@core/api/notification'
import type { SongInfo } from '@core/api/song'
import type { NuxtHTTPInstance } from '@nuxt/http'

/**
 * Call "Post Notification" API. (Admin only)
 * @see https://github.com/ddradar/ddradar/tree/master/api/postNotification
 */
export function postNotification(
  $http: Pick<NuxtHTTPInstance, '$post'>,
  body: Omit<NotificationBody, 'sender'>
) {
  return $http.$post<NotificationBody>('/api/v1/admin/notification', {
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
