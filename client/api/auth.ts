import type { ClientPrincipal } from '@core/api/auth'
import type { NuxtHTTPInstance } from '@nuxt/http'

type AuthResult = {
  clientPrincipal: ClientPrincipal | null
}

/**
 * Call "Get Credentials" API.
 * @see https://docs.microsoft.com/azure/static-web-apps/user-information
 */
export async function getClientPrincipal(
  $http: Pick<NuxtHTTPInstance, '$get'>
) {
  const { clientPrincipal } = await $http.$get<AuthResult>('/.auth/me')
  return clientPrincipal
}
