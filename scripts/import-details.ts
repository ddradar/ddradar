/* eslint-disable no-console */
/* eslint-disable node/no-process-env */
import { ScoreListBody } from '@ddradar/core/api/score'
import { difficultyMap, playStyleMap, SongSchema } from '@ddradar/core/db/songs'
import fetch from 'node-fetch'
import * as puppetter from 'puppeteer-core'

import { getContainer } from './modules/cosmos'
import { fetchScoreDetail, isLoggedIn } from './modules/eagate'

// Google Chrome env (Windows)
const executablePath = `${process.env['ProgramFiles(x86)']}\\Google\\Chrome\\Application\\chrome.exe`
const userDataDir = `${process.env['LOCALAPPDATA']}\\Google\\Chrome\\User Data`

const apiBasePath = ''

const sleep = (msec: number) =>
  new Promise(resolve => setTimeout(resolve, msec))

async function main(userId: string, password: string) {
  const browser = await puppetter.launch({
    headless: false,
    executablePath,
    userDataDir,
    slowMo: 50,
  })

  const page = (await browser.pages())[0] || (await browser.newPage())

  if (!(await isLoggedIn(page))) {
    console.warn('Need Login e-AMUSEMENT GATE')
    await browser.close()
    return
  }

  const container = getContainer('Songs')
  const { resources } = await container.items
    .query<Pick<SongSchema, 'id' | 'name' | 'charts'>>({
      query:
        'SELECT s.id, s.name, s.charts FROM s WHERE s.nameIndex > 10 AND s.series = @series ORDER BY s.nameIndex, s.nameKana',
      parameters: [{ name: '@series', value: 'DDR 1st' }],
    })
    .fetchAll()

  for (const s of resources) {
    console.info(`[Song] ${s.name} START`)
    const scores: ScoreListBody[] = []
    for (const c of s.charts) {
      const chart = `${playStyleMap.get(c.playStyle)}/${difficultyMap.get(
        c.difficulty
      )}`
      console.log(`  (${chart}) fetch start`)

      const score = await fetchScoreDetail(
        page,
        s.id,
        c.playStyle,
        c.difficulty
      )
      if (score) scores.push(score)

      console.log(`  (${chart}) fetch end. wait 3 seconds...`)
      await sleep(3000)
    }

    console.log(`  Call API start`)
    const apiUri = `${apiBasePath}/api/v1/scores/${s.id}/${userId}`
    const response = await fetch(apiUri, {
      method: 'post',
      body: JSON.stringify({ password, scores }),
      headers: { 'Content-Type': 'application/json' },
    })
    console.log(`  API returns ${response.statusText}`)

    console.info(`[Song] ${s.name} END`)
  }

  await browser.close()
}

main(process.argv[2], process.argv[3]).catch(e => console.error(e))
