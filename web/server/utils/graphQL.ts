import { $fetch } from 'ofetch'

/**
 * Call Azure Static Web Apps built-in GraphQL Query requests.
 * https://learn.microsoft.com/azure/static-web-apps/database-overview
 * @param query GraphQL query
 * @param variables GraphQL variables
 * @returns Result data
 */
export function callGraphQL<T>(query: string, variables: object) {
  const headers = useRequestHeaders() as Record<string, string>
  return $fetch<{ data: T }>(`/data-api/graphql`, {
    headers,
    method: 'POST',
    body: { query, variables },
  })
}
