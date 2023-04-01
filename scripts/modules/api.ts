// eslint-disable-next-line node/no-extraneous-import
import type { ScoreListBody } from '@ddradar/functions/postSongScores'
import { config } from 'dotenv'
import { fetch } from 'node-fetch-native'

// load .env file
config()

// eslint-disable-next-line node/no-process-env
const { BASE_URI: apiBasePath } = process.env

/** Call POST `/api/v1/scores/:songId/:userId` API. */
export async function postSongScores(
  songId: string,
  userId: string,
  password: string,
  scores: ScoreListBody[]
) {
  const apiUri = `${apiBasePath}/api/v1/scores/${songId}/${userId}`
  const res = await fetch(apiUri, {
    method: 'post',
    body: JSON.stringify({ password, scores }),
    headers: { 'Content-Type': 'application/json' },
  })

  if (!res.ok) {
    throw new Error(
      `API returns ${res.status}: ${res.statusText}\n${await res.text()}`
    )
  }
}
