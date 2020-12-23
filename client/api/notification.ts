import type {
  NotificationInfo,
  NotificationListData,
} from '@core/api/notification'
import type { NuxtHTTPInstance } from '@nuxt/http'

/**
 * Call "Get Notification List" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/getNotificationList
 */
export function getNotificationList(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  topOnly?: boolean
) {
  const query = topOnly ? '?scope=top' : ''
  return $http.$get<NotificationListData[]>(`/api/v1/notification${query}`)
}

/**
 * Call "Get Notification Info" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/getNotificationInfo
 */
export function getNotificationInfo(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  id: string
) {
  return $http.$get<NotificationInfo>(`/api/v1/notification/${id}`)
}
