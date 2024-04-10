import type {
  CosmosDBInput,
  CosmosDBOutput,
  InvocationContext,
} from '@azure/functions'
import { app } from '@azure/functions'
import type { SongSchema } from '@ddradar/core'
import { ofetch } from 'ofetch'

import { masterMusicToMap } from '../skill-attack'

const input: CosmosDBInput = {
  name: 'songs',
  type: 'cosmosDB',
  connection: 'COSMOS_DB_CONN_READONLY',
  databaseName: 'DDRadar',
  containerName: 'Songs',
  sqlQuery:
    'SELECT * FROM c WHERE c.nameIndex >= 0 AND NOT IS_DEFINED(c.skillAttackId)',
}
const $return: CosmosDBOutput = {
  name: '$return',
  type: 'cosmosDB',
  connection: 'COSMOS_DB_CONN',
  databaseName: 'DDRadar',
  containerName: 'Songs',
}
app.timer('importSkillAttackId', {
  schedule: '0 0 2 * * *',
  extraInputs: [input],
  return: $return,
  handler,
})

const masterMusicUri =
  process.env.MASTER_MUSIC_URL ??
  'http://skillattack.com/sa4/data/master_music.txt'

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

  const map = masterMusicToMap(
    Buffer.from(await ofetch(masterMusicUri, { responseType: 'arrayBuffer' }))
  )

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
