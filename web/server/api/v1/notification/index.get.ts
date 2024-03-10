import type { NotificationListData } from '~/schemas/notification'
import { getListQuerySchema as schema } from '~/schemas/notification'

/**
 * Get system notification list.
 * @description
 * - No need Authentication.
 * - GET `api/v1/notification?scope=:scope`
 *   - `scope`(optional): `top`: only pinne} notification, other: all notification
 * @returns `200 OK` with JSON body.
 * @example
 * ```json
 * [
 *   {
 *     "id": "<Auto Generated>",
 *     "type": "is-info",
 *     "icon": "info",
 *     "title": "このサイトはベータ版です",
 *     "body": "このWebサイトはベータ版環境です。以下の点にご留意してご利用ください。",
 *     "timeStamp": 1597028400
 *   }
 * ]
 * ```
 */
export default defineEventHandler(async event => {
  const { scope } = await getValidatedQuery(event, schema.parse)

  const query = /* GraphQL */ `
  query(
    ${scope === 'top' ? '$pinned: Boolean!' : ''}
    $cursor: String
  ) {
    notifications(
      filter: {
        and: [
          { sender: { eq: "SYSTEM" } }
          ${scope === 'top' ? '{ pinned: { eq: $pinned } }' : ''}
        ]
      }
      after: $cursor
      orderBy: { pinned: DESC, timeStamp: DESC }
    ) {
      items {
        id
        type
        icon
        title
        body
        timeStamp
      }
      hasNextPage
      endCursor
    }
  }
  `

  return await $graphqlList<NotificationListData>(
    event,
    query,
    'notifications',
    { ...(scope === 'top' ? { pinned: true } : {}) }
  )
})
