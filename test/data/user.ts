import type { User as SessionUser } from '#auth-utils'

export const publicUser: UserInfo = {
  id: 'public_user',
  name: 'Public User',
  isPublic: true,
  area: 13,
  ddrCode: 10000000,
}

export const privateUser: UserInfo = {
  id: 'private_user',
  name: 'Private User',
  isPublic: false,
  area: 27,
  ddrCode: 20000000,
}

export const sessionUser: SessionUser = {
  provider: 'github',
  providerId: '12345',
  roles: [],
  displayName: 'Auth User',
  avatarUrl: 'https://example.com/avatar.png',
}
