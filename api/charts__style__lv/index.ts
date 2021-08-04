import type { Api } from '@ddradar/core'

import { ErrorResult, SuccessResult } from '../function'

type ChartInfo = Api.ChartInfo

/**
 * Get charts that match the specified conditions.
 * @description
 * - No need Authentication.
 * - `GET /api/v1/charts/:style/:lv`
 *   - `style`: {@link ChartInfo.playStyle}
 *   - `lv`: {@link ChartInfo.level}
 * @param _context Azure Functions context (unused)
 * @param _req HTTP Request (unused)
 * @param documents Chart data (from Cosmos DB binding)
 * @returns
 * - Returns `404 Not Found` if no chart that matches conditions.
 * - Returns `200 OK` with JSON body if found.
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
export default async function (
  _context: unknown,
  _req: unknown,
  documents: ChartInfo[]
): Promise<ErrorResult<404> | SuccessResult<ChartInfo[]>> {
  if (documents.length === 0) {
    return new ErrorResult(404)
  }
  return new SuccessResult(documents)
}
