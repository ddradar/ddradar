/**
 * Call Azure Static Web Apps built-in GraphQL Query requests.
 * https://learn.microsoft.com/azure/static-web-apps/database-overview
 * @param query GraphQL query
 * @param variables GraphQL variables
 * @returns Result data
 */
export function callGraphQL<T>(query: string, variables: object) {
  const config = useRuntimeConfig()
  return $fetch<{ data: T }>(`${config.public.apiBase}/data-api/graphql`, {
    method: 'POST',
    body: { query, variables },
  })
}
