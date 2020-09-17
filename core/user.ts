import { AreaCode, UserSchema } from './db/users'
import {
  hasIntegerProperty,
  hasProperty,
  hasStringProperty,
} from './type-assert'

/**
 * Object type returned by `/api/v1/user`
 * @see https://github.com/ddradar/ddradar/blob/master/api/getCurrentUser/README.md
 */
export type UserInfo = Omit<UserSchema, 'loginId'>

/**
 * Object type returned by `/api/v1/users/{:id}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/getUserInfo/README.md
 */
export type UserListData = Omit<UserSchema, 'loginId' | 'isPublic'>

export const areaCodeList: AreaCode[] = [
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
  31,
  32,
  33,
  34,
  35,
  36,
  37,
  38,
  39,
  40,
  41,
  42,
  43,
  44,
  45,
  46,
  47,
  48,
  49,
  50,
  51,
  52,
  53,
  106,
  107,
  108,
  109,
  110,
  111,
  112,
  113,
  114,
  115,
  116,
  117,
  118,
]

export function isUserInfo(obj: unknown): obj is UserInfo {
  return (
    hasStringProperty(obj, 'id', 'name') &&
    /^[-a-z0-9_]+$/.test(obj.id) &&
    hasIntegerProperty(obj, 'area') &&
    (areaCodeList as number[]).includes(obj.area) &&
    (!hasProperty(obj, 'code') ||
      (hasIntegerProperty(obj, 'code') &&
        obj.code >= 10000000 &&
        obj.code <= 99999999)) &&
    hasProperty(obj, 'isPublic') &&
    typeof obj.isPublic === 'boolean'
  )
}
