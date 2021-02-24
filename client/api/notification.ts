import type {
  NotificationBody,
  NotificationInfo,
  NotificationListData,
} from '@ddradar/core/api/notification'
import type { NuxtHTTPInstance } from '@nuxt/http'

import { apiPrefix } from '~/api'

/**
 * Call "Get Notification List" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/notification/
 */
export function getNotificationList(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  topOnly?: boolean
) {
  const query = topOnly ? '?scope=top' : ''
  return $http.$get<NotificationListData[]>(`${apiPrefix}/notification${query}`)
}

/**
 * Call "Get Notification Info" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/notification__id/
 */
export function getNotificationInfo(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  id: string
) {
  return $http.$get<NotificationInfo>(`${apiPrefix}/notification/${id}`)
}

/**
 * Call "Post Notification" API. (Admin only)
 * @see https://github.com/ddradar/ddradar/tree/master/api/notification--post/
 */
export function postNotification(
  $http: Pick<NuxtHTTPInstance, '$post'>,
  body: Omit<NotificationBody, 'sender'>
) {
  return $http.$post<NotificationBody>(`${apiPrefix}/notification`, {
    ...body,
    sender: 'SYSTEM',
  })
}
