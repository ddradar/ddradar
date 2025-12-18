import * as z from 'zod/mini'

import type { TimestampColumn, users } from '~~/server/db/schema'

/** Area enum object */
export const Area = {
  Undefined: 0,
  Australia: 109,
  Canada: 106,
  Europe: 52,
  France: 115,
  Germany: 114,
  HongKong: 48,
  Indonesia: 117,
  Italy: 112,
  Japan: 105,
  Korea: 49,
  NewZealand: 110,
  Philippines: 118,
  Portugal: 116,
  Singapore: 107,
  Spain: 113,
  Taiwan: 50,
  Thailand: 108,
  UK: 111,
  USA: 51,
  Overseas: 53,
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
  Alabama: 55,
  Alaska: 54,
  Arizona: 57,
  Arkansas: 56,
  California: 58,
  Colorado: 59,
  Connecticut: 60,
  Delaware: 61,
  Florida: 62,
  Georgia: 63,
  Hawaii: 64,
  Idaho: 66,
  Illinois: 67,
  Indiana: 68,
  Iowa: 65,
  Kansas: 69,
  Kentucky: 70,
  Louisiana: 71,
  Maine: 74,
  Maryland: 73,
  Massachusetts: 72,
  Michigan: 75,
  Minnesota: 76,
  Mississippi: 78,
  Missouri: 77,
  Montana: 79,
  Nebraska: 80,
  NorthCarolina: 81,
  NorthDakota: 82,
  NewHampshire: 83,
  NewJersey: 84,
  NewMexico: 85,
  NewYork: 87,
  Nevada: 86,
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
  Vermont: 99,
  Virginia: 98,
  Washington: 100,
  WashingtonDC: 104,
  WestVirginia: 102,
  Wisconsin: 101,
  Wyoming: 103,
} as const

/** Zod schema for `User` (excepts system fields) */
export const userSchema = z.object({
  id: z
    .string()
    .check(z.regex(/^[a-zA-Z0-9_-]+$/), z.minLength(3), z.maxLength(32)),
  name: z.string().check(z.minLength(1), z.maxLength(32)),
  isPublic: z.boolean(),
  area: z.enum(Area),
  ddrCode: z.nullish(z.int().check(z.minimum(10000000), z.maximum(99999999))),
}) satisfies z.ZodMiniType<
  Omit<
    typeof users.$inferInsert,
    'provider' | 'providerId' | 'roles' | TimestampColumn
  >
>
export type User = ZodInfer<typeof userSchema>

/**
 * Returns the area that includes the specified area
 * @param area - Area code
 * @returns
 * - Japan Prefectures returns `105`(Japan).
 * - United States returns `51`(USA).
 * - Europe countries returns `52`(Europe).
 * - Overseas countries returns `53`(Overseas).
 * - Other returns `0`(Undefined).
 */
export function findLargerArea(
  area: ValueOf<typeof Area>
): ValueOf<typeof Area> {
  if (area >= Area.北海道 && area <= Area.沖縄県) return Area.Japan // Japan Prefectures(1-47)
  if (area >= Area.Alaska && area <= Area.WashingtonDC) return Area.USA // United States(54-104)
  if (area >= Area.UK && area <= Area.Portugal) return Area.Europe // Europe(111-116)
  // Overseas(48-52, 106-110, 117-118)
  if (!([Area.Undefined, Area.Japan, Area.Overseas] as number[]).includes(area))
    return Area.Overseas
  return Area.Undefined
}
