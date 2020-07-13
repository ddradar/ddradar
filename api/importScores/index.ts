import type { HttpRequest } from '@azure/functions'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { getContainer } from '../cosmos'
import type { ScoreSchema, UserSchema } from '../db'
import { musicDataToScoreList } from '../eagate'
import type {
  BadRequestResult,
  NotFoundResult,
  SuccessResult,
  UnauthenticatedResult,
} from '../function'
import { mergeScore, Score } from '../score'
import { hasStringProperty } from '../type-assert'

type ImportRequest = {
  type: 'eagate_music_data'
  body: string
}

type ChartScore = Omit<ScoreSchema, 'id' | 'userId' | 'userName' | 'isPublic'>

function isImportRequest(obj: unknown): obj is ImportRequest {
  return (
    hasStringProperty(obj, 'type', 'body') && obj.type === 'eagate_music_data'
  )
}

/**
 * Add or update extracted score information from HTML source of official site.
 * - https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_data_single.html
 * - https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_data_double.html
 */
export default async function (
  _context: unknown,
  req: Pick<HttpRequest, 'headers' | 'body'>
): Promise<
  | BadRequestResult
  | NotFoundResult
  | UnauthenticatedResult
  | SuccessResult<{ count: number }>
> {
  const clientPrincipal = getClientPrincipal(req)
  if (!clientPrincipal) return { status: 401 }

  if (!isImportRequest(req.body)) {
    return { status: 400, body: 'body is not ImportRequest' }
  }

  let scores: ChartScore[]
  try {
    scores = musicDataToScoreList(req.body.body)
  } catch (error) {
    return { status: 400, body: error }
  }

  const user = await getLoginUserInfo(clientPrincipal)
  if (!user) {
    return {
      status: 404,
      body: `Unregistered user: { platform: ${clientPrincipal.identityProvider}, id: ${clientPrincipal.userDetails} }`,
    }
  }

  let count = 0
  for (const score of scores) {
    if (user.isPublic) {
      // World Record
      await upsertScore({ id: '0', name: '0', isPublic: false }, score)
      if (user.area) {
        // Area Top
        await upsertScore(
          { id: `${user.area}`, name: `${user.area}`, isPublic: false },
          score
        )
      }
    }
    await upsertScore(user, score)
    count++
  }

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: { count },
  }
}

async function upsertScore(
  {
    id: userId,
    name: userName,
    isPublic,
  }: Pick<UserSchema, 'id' | 'name' | 'isPublic'>,
  newScore: ChartScore
) {
  const container = getContainer('Scores')

  // Get previous score
  const id = `${userId}-${newScore.songId}-${newScore.playStyle}-${newScore.difficulty}`
  const { resource } = await container.item(id, userId).read<ScoreSchema>()
  const oldScore: Score = resource ?? {
    score: 0,
    rank: 'E',
    clearLamp: 0,
  }

  const mergedScore = {
    ...newScore,
    ...mergeScore(oldScore, newScore),
    id,
    userId,
    userName,
    isPublic,
  }
  if (
    mergedScore.score !== oldScore.score ||
    mergedScore.clearLamp !== oldScore.clearLamp ||
    mergedScore.exScore !== oldScore.exScore ||
    mergedScore.maxCombo !== oldScore.maxCombo ||
    mergedScore.rank !== oldScore.rank
  ) {
    await container.items.upsert<ScoreSchema>(mergedScore)
  }
}
