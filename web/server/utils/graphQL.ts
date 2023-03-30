/**
 * Call Azure Static Web Apps built-in GraphQL Query requests.
 * https://learn.microsoft.com/azure/static-web-apps/database-overview
 * @param query GraphQL query
 * @param variables GraphQL variables
 * @returns Result data
 * @summary **Note: This method only uses on client side.**
 */
export function callGraphQL<T>(query: string, variables: object) {
  return $fetch<{ data: T }>(`/data-api/graphql`, {
    method: 'POST',
    body: { query, variables },
  })
}
