import type { H3Event } from 'h3'

export const $graphql = async <T>(
  event: H3Event,
  query: string,
  variables?: object,
  role?: string
) => {
  const { data } = await $fetch<{ data: T }>('/data-api/graphql', {
    method: 'POST',
    body: { query, variables },
    headers: {
      ...getRequestHeaders(event),
      ...(role ? { 'X-MS-API-ROLE': role } : {}),
    } as Record<string, string>,
  })
  return data
}

type QueryListResult<T> = {
  [key: string]:
    | {
        items: T[]
        hasNextPage: true
        endCursor: string
      }
    | {
        items: T[]
        hasNextPage: false
        endCursor: null
      }
}

export const $graphqlList = async <T>(
  event: H3Event,
  query: string,
  schema: string,
  variables?: object,
  role?: string
) => {
  const result: T[] = []
  let queryResult: QueryListResult<T>[string] = {
    items: [],
    endCursor: null,
    hasNextPage: false,
  }
  do {
    queryResult = (
      await $graphql<QueryListResult<T>>(
        event,
        query,
        {
          ...variables,
          cursor: queryResult?.hasNextPage ? queryResult.endCursor : null,
        },
        role
      )
    )[schema]
    result.push(...queryResult.items)
  } while (queryResult.hasNextPage)

  return result
}
