import type { NuxtHTTPInstance } from '@nuxt/http'

/**
 * Port from ../../api/db/notification.d.ts
 * @see https://github.com/ddradar/ddradar/blob/master/docs/db/notification.md
 */
export type Notification = {
  id: string
  sender: string
  pinned: boolean
  type: string
  icon: string
  title: string
  body: string
  timeStamp: number
}

/**
 * Call "Get Notification List" API.
 * @see https://github.com/ddradar/ddradar/tree/master/api/getNotificationList
 */
export function getNotificationList(
  $http: Pick<NuxtHTTPInstance, '$get'>,
  topOnly?: boolean
) {
  type SystemNotification = Omit<Notification, 'sender' | 'pinned'>
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
  return $http.$get<Notification>(`/api/v1/notification/${id}`)
}
