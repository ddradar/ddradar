import type { NotificationSchema } from '@core/db/notification'
import type { NuxtHTTPInstance } from '@nuxt/http'

/**
 * Call "Get Notification List" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/getNotificationList
 */
export function getNotificationList(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  topOnly?: boolean
) {
  type SystemNotification = Omit<NotificationSchema, 'sender' | 'pinned'>
  const query = topOnly ? '?scope=top' : ''
  return $http.$get<SystemNotification[]>(`/api/v1/notification${query}`)
}

/**
 * Call "Get Notification Info" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/getNotificationInfo
 */
export function getNotificationInfo(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  id: string
) {
  return $http.$get<NotificationSchema>(`/api/v1/notification/${id}`)
}
