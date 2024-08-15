import { publicUser } from '@ddradar/core/test/data'
import { describe, expect, test } from 'vitest'

import { type DBUserSchema, dbUserSchema } from '../../src/schemas/userData'

describe('/schemas/userData', () => {
  describe('dbUserSchema', () => {
    const validUser: DBUserSchema = {
      ...publicUser,
      type: 'user',
      uid: publicUser.id,
      loginId: 'xxxx-xxxx-xxxx-xxxx',
    }

    test.each([undefined, null, true, 1, 'foo', {}, publicUser])(
      'safeParse(%o) returns { success: false }',
      o => {
        expect(dbUserSchema.safeParse(o).success).toBe(false)
      }
    )
    test.each([
      validUser,
      { ...validUser, type: undefined },
      { ...validUser, isAdmin: true },
      { ...validUser, isAdmin: false },
    ])('safeParse(%o) returns { success: true }', o => {
      expect(dbUserSchema.safeParse(o).success).toBe(true)
    })
  })
})
