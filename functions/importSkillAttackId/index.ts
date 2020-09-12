import { CosmosClient } from '@azure/cosmos'
import type { Context } from '@azure/functions'
import fetch from 'node-fetch'

import { SongSchema } from '../db/songs'
import { masterMusicToMap } from '../skill-attack'

const masterMusicUri = 'http://skillattack.com/sa4/data/master_music.txt'

// eslint-disable-next-line node/no-process-env
const connectionString = process.env.COSMOS_DB_CONN
if (!connectionString) throw new Error('COSMOS_DB_CONN is undefined.')

const client = new CosmosClient(connectionString)
const container = client.database('DDRadar').container('Songs')

/** Import skillAttackId from Skill Attack site. */
export default async function (context: Context): Promise<void> {
  const songs: SongSchema[] = context.bindings.documents
  if (!songs.length) return

  const res = await fetch(masterMusicUri)
  const map = masterMusicToMap(Buffer.from(await res.arrayBuffer()))

  for (const song of songs) {
    const skillAttackId = map.get(song.id)
    if (!skillAttackId) return
    song.skillAttackId = parseInt(skillAttackId, 10)
    await container.items.upsert(song)
    context.log.info(
      `Updated: ${song.name} { id: "${song.id}", skillAttackId: ${skillAttackId} }`
    )
  }
}
