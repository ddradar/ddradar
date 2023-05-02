import { config } from 'dotenv'

// load .env file
config()

import { difficultyMap, isPageDeletedOnGate, playStyleMap } from '@ddradar/core'
import { fetchList } from '@ddradar/db'
import { consola } from 'consola'

import { postSongScores } from './modules/api'
import Browser from './modules/browser'
import { fetchUser } from './modules/database'
import { fetchScoreDetail, isLoggedIn } from './modules/eagate'

const series = 'DanceDanceRevolution A3'

const sleep = (msec: number) =>
  new Promise(resolve => setTimeout(resolve, msec))

const code = 11173996

/** Update World Record from e-AMUSEMENT GATE. */
async function main() {
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
  if (!user || !user.password) {
    return
  }

  // Load no MFCed top score from DDRadar DB
  const resources = await fetchList(
    'Scores',
    ['songId', 'songName', 'playStyle', 'difficulty', 'score'],
    [
      { condition: 'c.userId = "0"' },
      { condition: 'c.clearLamp != 7' },
      { condition: '(NOT IS_DEFINED(c.deleted))' },
      { condition: '(NOT IS_DEFINED(c.ttl))' },
    ],
    { songName: 'ASC' }
  )

  // Grouped by song
  const scores = resources.reduce((prev, score) => {
    if (prev[score.songId]) {
      prev[score.songId].push(score)
    } else {
      prev[score.songId] = [score]
    }
    return prev
  }, {} as Record<string, typeof resources>)

  const total = Object.keys(scores).length
  let count = 1
  const logs: string[] = []

  for (const [id, score] of Object.entries(scores)) {
    const songScope = consola.withTag('song')
    const songName = `(${count++}/${total}) ${score[0].songName} (${id})`
    if (isPageDeletedOnGate(id, series)) {
      songScope.info(`${songName} is deleted on e-amusement site. skipped`)
      continue
    }
    songScope.start(songName)

    const scores: Parameters<typeof postSongScores>[3] = []

    for (const s of score) {
      try {
        const chartScope = songScope.withTag('charts')
        const chart = `${playStyleMap.get(s.playStyle)}/${difficultyMap.get(
          s.difficulty
        )}`
        let score: Awaited<ReturnType<typeof fetchScoreDetail>> = null

        for (let retryCount = 0; retryCount < 3; retryCount++) {
          try {
            score = await fetchScoreDetail(
              page,
              s.songId,
              s.playStyle,
              s.difficulty,
              series
            )
            break
          } catch (e: unknown) {
            const message: string =
              typeof e === 'string' ? e : (e as Error)?.message
            if (/NO PLAY/.test(message)) {
              chartScope.info(`No Play: ${chart}`)
              break
            }
            if (retryCount >= 2) throw e
            chartScope.warn(`Retry: ${retryCount + 1} wait 3 seconds...`)
            await sleep(3000)
          }
        }
        if (score && score.topScore > s.score) {
          scores.push(score)
          logs.push(
            `${s.songName}(${s.songId}) [${chart}] (${s.score} -> ${
              score.topScore
            }) at ${new Date()}`
          )
          chartScope.success(
            `${chart} (${score.topScore}) Loaded. wait 3 seconds...`
          )
        }
      } catch (e: unknown) {
        for (const log of logs) {
          consola.success(log)
        }
        await browser.close()
        throw e
      }
      await sleep(3000)
    }

    if (scores.length === 0) {
      songScope.info('No scores. skiped')
      continue
    }

    try {
      await postSongScores(id, user.id, user.password, scores)
    } catch (error) {
      songScope.error(error)
    }
  }

  for (const log of logs) {
    consola.success(log)
  }

  await browser.close()
}

// yarn start ./update-world-record.ts
main().catch(e => consola.error(e))
