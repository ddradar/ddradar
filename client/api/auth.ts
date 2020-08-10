import type { NuxtHTTPInstance } from '@nuxt/http'

// Port from /api/auth.ts

type Role = 'anonymous' | 'authenticated' | 'administrator'

/** User information provided by Azure */
export type ClientPrincipal = {
  /** The name of the identity provider. */
  identityProvider: 'github' | 'twitter'
  /** An Azure Static Web Apps-specific unique identifier for the user. */
  userId: string
  /** User Name (GitHub/Twitter) */
  userDetails: string
  /** An array of the user's assigned roles. */
  userRoles: Role[]
}

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
