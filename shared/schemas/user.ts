import * as z from 'zod/mini'

import type { TimestampColumn, users } from '~~/server/db/schema'
import { range } from '~~/shared/utils'

/** Area enum object */
export const Area = {
  Undefined: 0,
  // #region Japan Prefectures
  北海道: 1,
  青森県: 2,
  岩手県: 3,
  宮城県: 4,
  秋田県: 5,
  山形県: 6,
  福島県: 7,
  茨城県: 8,
  栃木県: 9,
  群馬県: 10,
  埼玉県: 11,
  千葉県: 12,
  東京都: 13,
  神奈川県: 14,
  新潟県: 15,
  富山県: 16,
  石川県: 17,
  福井県: 18,
  山梨県: 19,
  長野県: 20,
  岐阜県: 21,
  静岡県: 22,
  愛知県: 23,
  三重県: 24,
  滋賀県: 25,
  京都府: 26,
  大阪府: 27,
  兵庫県: 28,
  奈良県: 29,
  和歌山県: 30,
  鳥取県: 31,
  島根県: 32,
  岡山県: 33,
  広島県: 34,
  山口県: 35,
  徳島県: 36,
  香川県: 37,
  愛媛県: 38,
  高知県: 39,
  福岡県: 40,
  佐賀県: 41,
  長崎県: 42,
  熊本県: 43,
  大分県: 44,
  宮崎県: 45,
  鹿児島県: 46,
  沖縄県: 47,
  // #endregion Japan Prefectures
  HongKong: 48,
  Korea: 49,
  Taiwan: 50,
  USA: 51,
  Europe: 52,
  Overseas: 53,
  // #region United States
  Alaska: 54,
  Alabama: 55,
  Arkansas: 56,
  Arizona: 57,
  California: 58,
  Colorado: 59,
  Connecticut: 60,
  Delaware: 61,
  Florida: 62,
  Georgia: 63,
  Hawaii: 64,
  Iowa: 65,
  Idaho: 66,
  Illinois: 67,
  Indiana: 68,
  Kansas: 69,
  Kentucky: 70,
  Louisiana: 71,
  Massachusetts: 72,
  Maryland: 73,
  Maine: 74,
  Michigan: 75,
  Minnesota: 76,
  Missouri: 77,
  Mississippi: 78,
  Montana: 79,
  Nebraska: 80,
  NorthCarolina: 81,
  NorthDakota: 82,
  NewHampshire: 83,
  NewJersey: 84,
  NewMexico: 85,
  Nevada: 86,
  NewYork: 87,
  Ohio: 88,
  Oklahoma: 89,
  Oregon: 90,
  Pennsylvania: 91,
  RhodeIsland: 92,
  SouthCarolina: 93,
  SouthDakot: 94,
  Tennessee: 95,
  Texas: 96,
  Utah: 97,
  Virginia: 98,
  Vermont: 99,
  Washington: 100,
  Wisconsin: 101,
  WestVirginia: 102,
  Wyoming: 103,
  WashingtonDC: 104,
  // #endregion United States
  Japan: 105,
  Canada: 106,
  Singapore: 107,
  Thailand: 108,
  Australia: 109,
  NewZealand: 110,
  UK: 111,
  Italy: 112,
  Spain: 113,
  Germany: 114,
  France: 115,
  Portugal: 116,
  Indonesia: 117,
  Philippines: 118,
} as const

/** Zod schema for `User` (excepts system fields) */
export const userSchema = z.object({
  /** User ID (3-32 characters) */
  id: z
    .string()
    .check(z.regex(/^[a-zA-Z0-9_-]+$/), z.minLength(3), z.maxLength(32)),
  /** Display name (1-32 characters) */
  name: z.string().check(z.minLength(1), z.maxLength(32)),
  /** Profile visibility. if `false`, user profile and scores are not visible to others. */
  isPublic: z.boolean(),
  /** Area code depend on official site. */
  area: z.enum(Area),
  /** DDR code (8 digits) */
  ddrCode: z.nullish(z.int().check(z.minimum(10000000), z.maximum(99999999))),
}) satisfies z.ZodMiniType<
  Omit<
    typeof users.$inferInsert,
    'provider' | 'providerId' | 'roles' | TimestampColumn
  >
>

/**
 * Returns the areas that are included in the specified area
 * @param area - Area code
 * @returns
 * - `Area.Japan` returns all 47 prefectures codes.
 * - `Area.USA` returns all 51 states codes.
 * - `Area.Europe` returns all 6 countries codes.
 * - `Area.Overseas` returns all area codes except Japan.
 * - Other area returns an empty array.
 */
export function getNarrowedArea(
  area: ValueOf<typeof Area>
): ValueOf<typeof Area>[] {
  switch (area) {
    case Area.Japan:
      return range(Area.北海道, Area.沖縄県)
    case Area.USA:
      return range(Area.Alaska, Area.WashingtonDC)
    case Area.Europe:
      return range(Area.UK, Area.Portugal)
    case Area.Overseas:
      return [
        ...range(Area.HongKong, Area.Europe),
        ...range(Area.Alaska, Area.WashingtonDC),
        ...range(Area.Canada, Area.Philippines),
      ]
  }
  return []
}

export const apiTokenSchema = z.object({
  /** Token ID */
  id: z.string().check(z.regex(/^[A-Za-z0-9_-]{21}$/)),
  /** Token name */
  name: z.string().check(z.minLength(1), z.maxLength(50)),
  /** Token creation date (ISO 8601 format) */
  createdAt: z.string().check(z.iso.datetime()),
  /** Token expiration date (ISO 8601 format) */
  expiresAt: z.string().check(z.iso.datetime()),
})
