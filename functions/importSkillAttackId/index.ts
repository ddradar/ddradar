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
  context.log.verbose(`Found ${songs.length} Songs.`)
  if (!songs.length) return

  context.log.verbose(`Get master_music from ${masterMusicUri}`)
  const res = await fetch(masterMusicUri)
  if (!res.ok) {
    context.log.error(`${res.status}: ${res.statusText}`)
    context.log.error(await res.text())
    return
  }

  context.log.verbose('Convert master_music to Map')
  const map = masterMusicToMap(Buffer.from(await res.arrayBuffer()))

  context.log.verbose('Update start')
  for (const song of songs) {
    const skillAttackId = map.get(song.id)
    if (skillAttackId === undefined) {
      context.log.info(`Not Found skillAttackId: ${song.name}`)
      continue
    }
    song.skillAttackId = skillAttackId
    await container.items.upsert(song)
    context.log.info(
      `Updated: ${song.name} { id: "${song.id}", skillAttackId: ${skillAttackId} }`
    )
  }
  context.log.verbose('Update end')
}
