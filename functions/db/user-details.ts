import { getContainer } from '.'
import type { ScoreSchema } from './scores'
import type { StepChartSchema } from './songs'

export type GrooveRadarSchema = Pick<
  StepChartSchema,
  'playStyle' | 'stream' | 'voltage' | 'air' | 'freeze' | 'chaos'
> & {
  userId: string
  type: 'radar'
}

export type ClearStatusSchema = Pick<
  ScoreSchema,
  'userId' | 'playStyle' | 'level' | 'clearLamp'
> & {
  type: 'clear'
  count: number
}

export type ScoreStatusSchema = Pick<
  ScoreSchema,
  'userId' | 'playStyle' | 'level' | 'rank'
> & {
  type: 'score'
  count: number
}

export async function fetchGrooveRadar(
  userId: string,
  playStyle: 1 | 2
): Promise<(GrooveRadarSchema & { id: string }) | null> {
  const container = getContainer('UserDetails')
  const columns: (keyof GrooveRadarSchema | 'id')[] = [
    'id',
    'userId',
    'type',
    'playStyle',
    'stream',
    'voltage',
    'air',
    'freeze',
    'chaos',
  ]
  const column = columns.map(c => `c.${c}`).join(', ')

  const { resources } = await container.items
    .query<GrooveRadarSchema & { id: string }>({
      query:
        `SELECT ${column} ` +
        'FROM c ' +
        'WHERE c.userId = @id AND c.type = "radar" AND c.playStyle = @playStyle',
      parameters: [
        { name: '@id', value: userId },
        { name: '@playStyle', value: playStyle },
      ],
    })
    .fetchAll()
  return resources[0] ?? null
}
