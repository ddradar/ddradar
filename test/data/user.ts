import type { User as SessionUser } from '#auth-utils'

/** Test user info (public) */
export const publicUser: UserInfo = {
  id: 'public_user',
  name: 'Public User',
  isPublic: true,
  area: 13,
  ddrCode: 10000000,
}

/** Test user info (private) */
export const privateUser: UserInfo = {
  id: 'private_user',
  name: 'Private User',
  isPublic: false,
  area: 27,
  ddrCode: 20000000,
}

/** Test session user info */
export const sessionUser: SessionUser = {
  provider: 'github',
  providerId: '12345',
  roles: [],
  displayName: 'Auth User',
  avatarUrl: 'https://example.com/avatar.png',
}

/** Test stored API token */
export const apiToken: StoredApiToken = {
  name: 'Test Token',
  hashedToken: 'hashedtoken123',
  createdAt: '2024-01-01T00:00:00.000Z',
  expiresAt: '2024-12-31T23:59:59.999Z',
}
