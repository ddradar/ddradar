import { config } from 'dotenv'

// load .env file
config()

import type { Api } from '@ddradar/core'
import { Song } from '@ddradar/core'
import { fetchList } from '@ddradar/db'
import consola from 'consola'
import fetch from 'node-fetch'

import Browser from './modules/browser'
import { fetchScoreDetail, isLoggedIn } from './modules/eagate'

// eslint-disable-next-line node/no-process-env
const { BASE_URI: apiBasePath } = process.env
const series: 'DanceDanceRevolution A3' | 'DanceDanceRevolution A20' =
  'DanceDanceRevolution A20'

const sleep = (msec: number) =>
  new Promise(resolve => setTimeout(resolve, msec))

const style = Song.playStyleMap
const diff = Song.difficultyMap

/** Update World Record from e-AMUSEMENT GATE */
async function main(userId: string, password: string) {
  const browser = await Browser.create()
  const page = await browser.createPage()

  // Login check
  if (!(await isLoggedIn(page))) {
    consola.warn('Please Login e-AMUSEMENT GATE manually')
    await browser.close()
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

  const a3Songs =
    series === 'DanceDanceRevolution A3'
      ? []
      : await fetchList(
          'Songs',
          ['id'],
          [{ condition: 'c.series = @', value: 'DanceDanceRevolution A3' }],
          { nameIndex: 'ASC' }
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
    const songScope = consola.withScope('song')
    const songName = `(${count++}/${total}) ${score[0].songName} (${id})`
    if (
      Song.isDeletedOnGate(id, series) ||
      (series === 'DanceDanceRevolution A20' &&
        (a3Songs.some(s => s.id === id) ||
          id === '01lbO69qQiP691ll6DIiqPbIdd9O806o'))
    ) {
      songScope.info(`${songName} is deleted on e-amusement site. skipped`)
      continue
    }
    songScope.start(songName)

    const scores: Api.ScoreListBody[] = []

    for (const s of score) {
      try {
        const chartScope = songScope.withScope('charts')
        const chart = `${style.get(s.playStyle)}/${diff.get(s.difficulty)}`
        let score: Awaited<ReturnType<typeof fetchScoreDetail>> = null
        const seriesTitle = series?.replace('DanceDanceRevolution ', '')
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
              chartScope.info(`No Play: ${chart} (${seriesTitle})`)
              break
            }
            if (retryCount >= 2) throw e
            chartScope.warn(
              `Retry: ${retryCount + 1} wait 3 seconds... (${seriesTitle})`
            )
            await sleep(3000)
          }
        }
        if (score) {
          if (score.topScore > s.score) {
            scores.push(score)
            logs.push(
              `${s.songName}(${s.songId}) [${chart}] (${s.score} -> ${
                score.topScore
              }) at ${new Date()} (${seriesTitle})`
            )
            chartScope.success(
              `${chart} (${score.topScore}) Loaded from ${seriesTitle}. wait 3 seconds...`
            )
          }
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

    const apiUri = `${apiBasePath}/api/v1/scores/${id}/${userId}`
    const res = await fetch(apiUri, {
      method: 'post',
      body: JSON.stringify({ password, scores }),
      headers: { 'Content-Type': 'application/json' },
    })

    if (!res.ok) {
      const errorText = await res.text()
      songScope.error(
        'API returns %i: %s.\n%s',
        res.status,
        res.statusText,
        errorText
      )
      continue
    }
  }

  for (const log of logs) {
    consola.success(log)
  }

  await browser.close()
}

// yarn start ./update-world-record.ts userId password
main(process.argv[2], process.argv[3]).catch(e => consola.error(e))
