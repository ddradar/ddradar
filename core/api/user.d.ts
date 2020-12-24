import type { UserSchema } from '../db/users'

/**
 * Object type returned by `/api/v1/user`
 * @see https://github.com/ddradar/ddradar/blob/master/api/getCurrentUser/README.md
 */
export type CurrentUserInfo = Omit<UserSchema, 'loginId'>

/**
 * Object type returned by `/api/v1/users` and `/api/v1/users/{:id}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/users__id/
 * @see https://github.com/ddradar/ddradar/blob/master/api/users/
 */
export type UserInfo = Omit<UserSchema, 'loginId' | 'isPublic'>

/**
 * Object type returned by `/api/v1/users/exists/{:id}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/existsUser/README.md
 */
export type ExistsUser = Pick<UserSchema, 'id'> & { exists: boolean }
