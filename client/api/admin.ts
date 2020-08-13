import type { NuxtHTTPInstance } from '@nuxt/http'

import type { Notification } from '~/api/notification'

type NotificationRequest = Omit<Notification, 'id' | 'sender' | '_ts'> & {
  id?: string
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
