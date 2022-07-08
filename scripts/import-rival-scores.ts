import { fetchOne } from '@ddradar/db'
import consola from 'consola'

import { postSongScores } from './modules/api'
import Browser from './modules/browser'
import { fetchRivalScoreList, isLoggedIn } from './modules/eagate'

const pageOffset = 21

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
  const user = await fetchOne('Users', ['id', 'name', 'password'], {
    condition: 'c.code = @',
    value: code,
  })
  if (!user) {
    consola.warn(`Not Found DDR-Code:${code} user.`)
    return
  }
  consola.info(`Found User: ${user.id}: ${user.name}`)

  for (let offset = 0; offset < pageOffset; offset++) {
    consola.start(`Song List ${offset + 1}/${pageOffset}`)

    const singleScores =
      (await fetchRivalScoreList(page, code, offset, 1)) ?? {}
    const doubleScores =
      (await fetchRivalScoreList(page, code, offset, 2)) ?? {}
    Object.entries(doubleScores).reduce((prev, [id, scores]) => {
      if (prev && prev[id]) {
        prev[id] = [...prev[id], ...scores]
      } else {
        prev[id] = scores
      }
      return prev
    }, singleScores)

    for (const [id, scores] of Object.entries(singleScores)) {
      const songScope = consola.withScope('Song')
      if (scores.length === 0) {
        songScope.info('No scores. skiped')
        continue
      }

      try {
        await postSongScores(id, user.id, user.password ?? "", scores)
      } catch (error) {
        songScope.error(error)
        continue
      }
      songScope.success(`${scores[0].songName} (${id})`)
    }

    consola.success(`End Song List ${offset + 1}/${pageOffset}`)
  }

  consola.info(`Done.`)
  await browser.close()
}

// yarn start ./import-rival-scores.ts 10000000
main(process.argv[2]).catch(e => consola.error(e))
