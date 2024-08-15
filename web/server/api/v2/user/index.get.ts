/**
 * Get information about the currently logged in user.
 * @description
 * - Need Authentication.
 * - GET `/api/v2/user`
 * @returns
 * - Returns `401 Unauthorized` if you are not logged in.
 * - Returns `404 Not Found` if user registration is not completed.
 * - Returns `200 OK` with JSON body if found.
 * @example
 * ```json
 * {
 *   "id": "afro0001",
 *   "name": "AFRO",
 *   "area": 13,
 *   "code": 10000000,
 *   "isPublic": false
 * }
 * ```
 */
export default defineEventHandler(async event => {
  return await getLoginUserInfo(event)
})
