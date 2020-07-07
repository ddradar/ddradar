import type { SqlParameter } from '@azure/cosmos'
import type { Context, HttpRequest } from '@azure/functions'

import { getClientPrincipal } from '../auth'
import { getContainer } from '../cosmos'
import type { ScoreSchema, UserSchema } from '../db'
import type { NotFoundResult, SuccessResult } from '../function'

type Score = Omit<ScoreSchema, 'id' | 'isPublic'>
type Scope = 'medium' | 'full'

/** Get course and orders information that match the specified ID. */
export default async function (
  context: Pick<Context, 'bindingData'>,
  req: Pick<HttpRequest, 'headers' | 'query'>
): Promise<NotFoundResult | SuccessResult<Score[]>> {
  const clientPrincipal = getClientPrincipal(req)

  const songId: string = context.bindingData.songId
  const playStyle: number = context.bindingData.playStyle
  const difficulty: number =
    typeof context.bindingData.difficulty === 'number'
      ? context.bindingData.difficulty
      : 0 // if param is 0, passed object. (bug?)
  const scope: Scope = ['medium', 'full'].includes(req.query.scope)
    ? (req.query.scope as Scope)
    : 'medium'

  // In Azure Functions, this function will only be invoked if a valid route.
  // So this check is only used to unit tests.
  if (
    !songId ||
    !/^[01689bdiloqDIOPQ]{32}$/.test(songId) ||
    (playStyle !== 1 && playStyle !== 2) ||
    ![0, 1, 2, 3, 4].includes(difficulty)
  ) {
    return { status: 404 }
  }

  // Create where condition dynamically
  const conditions: string[] = [
    'c.songId = @songId',
    'c.playStyle = @playStyle',
    'c.difficulty = @difficulty',
  ]
  const parameters: SqlParameter[] = [
    { name: '@songId', value: songId },
    { name: '@playStyle', value: playStyle },
    { name: '@difficulty', value: difficulty },
  ]

  // Get login user info
  let foundUser = false
  if (clientPrincipal) {
    const container = getContainer('Users', true)
    const { resources } = await container.items
      .query<UserSchema>({
        query: 'SELECT * FROM c WHERE c.loginId = @loginId',
        parameters: [{ name: '@loginId', value: clientPrincipal.userId }],
      })
      .fetchAll()
    if (resources.length !== 0) {
      foundUser = true
      if (scope === 'medium') {
        conditions.push('ARRAY_CONTAINS(@ids, c.userId)')
      } else {
        conditions.push('(c.isPublic = true OR ARRAY_CONTAINS(@ids, c.userId))')
      }
      parameters.push({
        name: '@ids',
        value: [resources[0].id, '0', `${resources[0].area}`],
      })
    }
  }

  if (!foundUser) {
    conditions.push('c.isPublic = true')
    if (scope === 'medium') conditions.push("c.userId = '0'") // Only top score
  }

  const container = getContainer('Scores', true)
  const columns: (keyof Score)[] = [
    'userId',
    'userName',
    'songId',
    'songName',
    'playStyle',
    'difficulty',
    'clearLamp',
    'score',
    'rank',
    'exScore',
    'maxCombo',
  ]
  const { resources } = await container.items
    .query<Score>({
      query:
        `SELECT ${columns.map(col => `c.${col}`).join(', ')} ` +
        'FROM c ' +
        `WHERE ${conditions.join(' AND ')} ` +
        'ORDER BY c.score DESC, c.clearLamp DESC, c._ts',
      parameters,
    })
    .fetchAll()

  if (resources.length === 0) {
    return {
      status: 404,
      body: `Not found scores that { songId: "${songId}", playStyle: ${playStyle}, difficulty: ${difficulty} } `,
    }
  }

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: resources,
  }
}
