import type { NotificationBody } from '@core/api/notification'
import type { SongInfo } from '@core/api/song'
import type { NuxtHTTPInstance } from '@nuxt/http'

import { apiPrefix } from '~/api'

/**
 * Call "Post Notification" API. (Admin only)
 * @see https://github.com/ddradar/ddradar/tree/master/api/admin__notification--post/
 */
export function postNotification(
  $http: Pick<NuxtHTTPInstance, '$post'>,
  body: Omit<NotificationBody, 'sender'>
) {
  return $http.$post<NotificationBody>(`${apiPrefix}/admin/notification`, {
    ...body,
    sender: 'SYSTEM',
  })
}

/**
 * Call "Post Song Information" API. (Admin only)
 * @see https://github.com/ddradar/ddradar/tree/master/api/admin__songs--post/
 */
export function postSongInfo(
  $http: Pick<NuxtHTTPInstance, '$post'>,
  body: SongInfo
) {
  return $http.$post<SongInfo>(`${apiPrefix}/admin/songs`, body)
}
