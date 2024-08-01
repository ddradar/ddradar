import { getRouterParamsSchema as schema } from '~~/schemas/charts'

/**
 * Get charts that match the specified conditions.
 * @description
 * - No need Authentication.
 * - GET `/api/v2/charts/[style]/[level]`
 *   - `style`: PlayStyle
 *   - `level`: Level
 * @returns
 * - Returns `200 OK` with JSON body.
 * @example
 * ```json
 * [
 *   {
 *     "id": "61oIP0QIlO90d18ObDP1Dii6PoIQoOD8",
 *     "name": "イーディーエム・ジャンパーズ",
 *     "series": "DanceDanceRevolution A",
 *     "playStyle": 1,
 *     "difficulty": 3,
 *     "level": 12
 *   }
 * ]
 * ```
 */
export default defineEventHandler(async event => {
  const { style, level } = await getValidatedRouterParams(event, schema.parse)

  return await getSongRepository(event).listCharts([
    { condition: 'c.playStyle = @', value: style },
    { condition: 'c.level = @', value: level },
  ])
})
