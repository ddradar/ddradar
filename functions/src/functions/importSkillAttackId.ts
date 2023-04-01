import type {
  CosmosDBInput,
  CosmosDBOutput,
  InvocationContext,
} from '@azure/functions'
import { app } from '@azure/functions'
import type { SongSchema } from '@ddradar/core'
import { fetch } from 'node-fetch-native'

import { masterMusicToMap } from '../skill-attack'

const input: CosmosDBInput = {
  name: 'songs',
  type: 'cosmosDB',
  connectionStringSetting: 'COSMOS_DB_CONN_READONLY',
  databaseName: 'DDRadar',
  collectionName: 'Songs',
  sqlQuery:
    'SELECT * FROM c WHERE c.nameIndex >= 0 AND NOT IS_DEFINED(c.skillAttackId)',
}
const $return: CosmosDBOutput = {
  name: '$return',
  type: 'cosmosDB',
  connectionStringSetting: 'COSMOS_DB_CONN',
  databaseName: 'DDRadar',
  collectionName: 'Songs',
}
app.timer('importSkillAttackId', {
  schedule: '0 0 2 * * *',
  extraInputs: [input],
  return: $return,
  handler,
})

const masterMusicUri = 'http://skillattack.com/sa4/data/master_music.txt'

/**
 * Import skillAttackId from Skill Attack site.
 * @param _ Timer object (not use)
 * @param ctx Function context
 */
export async function handler(
  _: unknown,
  ctx: InvocationContext
): Promise<SongSchema[]> {
  const songs = ctx.extraInputs.get(input) as SongSchema[]
  if (!songs.length) return []

  const res = await fetch(masterMusicUri)
  if (!res.ok) {
    ctx.error(`${res.status}: ${res.statusText}`)
    ctx.error(await res.text())
    return []
  }

  const map = masterMusicToMap(Buffer.from(await res.arrayBuffer()))

  return songs
    .map(song => {
      const skillAttackId = map.get(song.id)
      if (skillAttackId === undefined) {
        ctx.info(`Not Found skillAttackId: ${song.name}`)
        return
      }
      song.skillAttackId = skillAttackId
      ctx.info(
        `Updated: ${song.name} { id: "${song.id}", skillAttackId: ${skillAttackId} }`
      )
      return song
    })
    .filter((s): s is SongSchema => !!s)
}
