/**
 * Authentication-related user information that be provided Azure Static Web Apps.
 * @see https://docs.microsoft.com/azure/static-web-apps/user-information#client-principal-data
 */
export type ClientPrincipal = {
  /** The name of the identity provider. */
  identityProvider: AuthorizationProvider
  /**
   * An Azure Static Web Apps-specific unique identifier for the user.
   * - The value is unique on a per-app basis.
   *   For instance, the same user returns a different `userId` value on a different Static Web Apps resource.
   * - The value persists for the lifetime of a user.
   *   If you delete and add the same user back to the app, a new `userId` is generated.
   */
  userId: string
  /**
   * Username or email address of the user.
   * Some providers return the user's email address, while others send the user handle.
   */
  userDetails: string
  /** An array of the user's assigned roles. */
  userRoles: UserRole[]
}

type AuthorizationProvider = 'github' | 'twitter'

type UserRole = 'anonymous' | 'authenticated' | 'administrator'
