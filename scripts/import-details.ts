import { config } from 'dotenv'

// load .env file
config()

import { Song } from '@ddradar/core'
import { fetchList } from '@ddradar/db'
import consola from 'consola'

import { postSongScores } from './modules/api'
import Browser from './modules/browser'
import { fetchUser } from './modules/database'
import { fetchScoreDetail, isLoggedIn } from './modules/eagate'

const sleep = (msec: number) =>
  new Promise(resolve => setTimeout(resolve, msec))

const style = Song.playStyleMap
const diff = Song.difficultyMap

/**
 * Import all scores from e-AMUSEMENT GATE score detail pages.
 * @param ddrCode DDR Code (should be equal with e-AMUSEMENT GATE user)
 */
async function main(ddrCode: string) {
  const code = parseInt(ddrCode, 10)
  if (!Number.isInteger(code) || code < 10000000 || code > 99999999) {
    consola.warn(`Invalid DDR Code (${ddrCode}).`)
    return
  }

  const browser = await Browser.create()
  const page = await browser.createPage()

  // Login check
  if (!(await isLoggedIn(page))) {
    consola.warn('Please Login e-AMUSEMENT GATE manually')
    await browser.close()
    return
  }

  // Fetch user info
  const user = await fetchUser(code)
  if (!user) {
    consola.warn(`Not Found DDR-Code:${code} user.`)
    return
  }
  consola.info(`Found User: ${user.id}: ${user.name}`)

  const resources = await fetchList(
    'Songs',
    ['id', 'name', 'charts'],
    [{ condition: 'c.nameIndex > 0' }],
    { nameIndex: 'ASC', nameKana: 'ASC' }
  )

  let count = 1
  for (const s of resources) {
    const songScope = consola.withScope('song')
    const songName = `(${count++}/${resources.length + 1}) ${s.name} (${s.id})`
    if (Song.isDeletedOnGate(s.id)) {
      songScope.info(`${songName} Deleted on e-AMUSEMENT GATE. skiped.`)
      continue
    }
    songScope.start(songName)

    const scores: Parameters<typeof postSongScores>[3] = []

    for (const c of s.charts) {
      const chartScope = songScope.withScope('chart')
      const chart = `${style.get(c.playStyle)}/${diff.get(c.difficulty)}`

      try {
        const score = await fetchScoreDetail(
          page,
          s.id,
          c.playStyle,
          c.difficulty
        )
        if (score) {
          scores.push(score)
          chartScope.success(`${chart} loaded. wait 3 seconds...`)
        }
      } catch (e) {
        const message: string =
          typeof e === 'string' ? e : (e as Error)?.message
        if (!/NO PLAY/.test(message)) {
          await browser.close()
          throw e
        }
        chartScope.info('NO PLAY. wait 3 seconds...')
      }
      await sleep(3000)
    }

    if (scores.length === 0) {
      songScope.info('No scores. skiped')
      continue
    }

    try {
      await postSongScores(s.id, user.id, user.password, scores)
    } catch (error) {
      songScope.error(error)
      continue
    }

    songScope.success(songName)
  }

  consola.success('Finished')
  await browser.close()
}

// yarn start ./import-details.ts 10000000
main(process.argv[2]).catch(e => consola.error(e))
