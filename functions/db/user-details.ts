import { getContainer } from '.'
import type { ScoreSchema } from './scores'
import type { StepChartSchema } from './songs'

export type GrooveRadarSchema = Pick<
  StepChartSchema,
  'playStyle' | 'stream' | 'voltage' | 'air' | 'freeze' | 'chaos'
> & {
  id?: string
  userId: string
  type: 'radar'
}

export type ClearStatusSchema = Pick<
  ScoreSchema,
  'userId' | 'playStyle' | 'level' | 'clearLamp'
> & {
  id?: string
  type: 'clear'
  count: number
}

export type ScoreStatusSchema = Pick<
  ScoreSchema,
  'userId' | 'playStyle' | 'level' | 'rank'
> & {
  id?: string
  type: 'score'
  count: number
}

export async function generateGrooveRadar(
  userId: string,
  playStyle: 1 | 2
): Promise<GrooveRadarSchema> {
  const container = getContainer('Scores')
  const columns: (keyof GrooveRadarSchema)[] = [
    'stream',
    'voltage',
    'air',
    'freeze',
    'chaos',
  ]
  const column = columns.map(c => `MAX(c.radar.${c}) AS ${c}`).join(', ')
  const { resources } = await container.items
    .query<GrooveRadarSchema>({
      query:
        `SELECT c.userId, "radar" AS type, c.playStyle, ${column} ` +
        'FROM c ' +
        'WHERE c.userId = @id ' +
        'AND c.playStyle = @playStyle ' +
        'AND IS_DEFINED(c.radar) ' +
        'AND ((NOT IS_DEFINED(c.ttl)) OR c.ttl = -1 OR c.ttl = null) ' +
        'GROUP BY c.userId, c.playStyle',
      parameters: [
        { name: '@id', value: userId },
        { name: '@playStyle', value: playStyle },
      ],
    })
    .fetchAll()
  const result = resources[0] ?? {
    userId,
    type: 'radar',
    playStyle,
    stream: 0,
    voltage: 0,
    air: 0,
    freeze: 0,
    chaos: 0,
  }
  result.id = `radar-${userId}-${playStyle}`
  return result
}

export async function fetchClearAndScoreStatus(
  userId: string
): Promise<(ClearStatusSchema | ScoreStatusSchema)[]> {
  const container = getContainer('UserDetails')
  const { resources } = await container.items
    .query<ClearStatusSchema | ScoreStatusSchema>({
      query:
        'SELECT * FROM c ' +
        'WHERE c.userId = @id ' +
        'AND c.type = "clear" OR c.type = "score"',
      parameters: [{ name: '@id', value: userId }],
    })
    .fetchAll()
  return resources
}
