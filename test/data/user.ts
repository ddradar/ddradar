export const publicUser: User = {
  id: 'public_user',
  name: 'Public User',
  isPublic: true,
  area: 13,
  ddrCode: 10000000,
}

export const privateUser: User = {
  id: 'private_user',
  name: 'Private User',
  isPublic: false,
  area: 27,
  ddrCode: 20000000,
}

export const sessionUser = {
  id: 'auth_user',
  provider: 'github',
  providerId: '12345',
  roles: [],
  displayName: 'Auth User',
}
