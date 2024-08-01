import type {
  CosmosDBInput,
  CosmosDBOutput,
  InvocationContext,
} from '@azure/functions'
import { app } from '@azure/functions'
import { databaseName, type DBSongSchema, songContainer } from '@ddradar/db'
import { ofetch } from 'ofetch'

import { connection, connectionReadOnly } from '../constants.js'
import { masterMusicToMap } from '../skill-attack.js'

const input: CosmosDBInput = {
  name: 'songs',
  type: 'cosmosDB',
  connection: connectionReadOnly,
  databaseName,
  containerName: songContainer,
  sqlQuery:
    'SELECT * FROM c WHERE c.type = "song" AND NOT IS_DEFINED(c.skillAttackId)',
}
const $return: CosmosDBOutput = {
  name: '$return',
  type: 'cosmosDB',
  connection,
  databaseName,
  containerName: songContainer,
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
): Promise<DBSongSchema[]> {
  const songs = ctx.extraInputs.get(input) as DBSongSchema[]
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
    .filter(s => !!s)
}
