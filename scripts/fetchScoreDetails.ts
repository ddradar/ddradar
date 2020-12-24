/* eslint-disable no-console */
/* eslint-disable node/no-process-env */
import type { Difficulty, PlayStyle } from '@ddradar/core/db/songs'
import { musicDetailToScore } from '@ddradar/core/eagate-parser'
import { JSDOM } from 'jsdom'
import * as puppetter from 'puppeteer-core'

global.DOMParser = new JSDOM().window.DOMParser

// Windows
const executablePath = `${process.env['ProgramFiles(x86)']}\\Google\\Chrome\\Application\\chrome.exe`
const userDataDir = `${process.env['LOCALAPPDATA']}\\Google\\Chrome\\User Data`
const apiBasePath = 'https://ddradar-staging.azurewebsites.net' // develop
// const apiBasePath = 'https://api.ddradar.app' // production

async function main(
  userId: string,
  songId: string,
  playStyle: PlayStyle,
  difficulty: Difficulty
) {
  const index = (playStyle - 1) * 4 + difficulty
  const detailUri = `https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_detail.html?index=${songId}&diff=${index}`

  const browser = await puppetter.launch({
    headless: false,
    executablePath,
    userDataDir,
    slowMo: 50,
  })

  const page = (await browser.pages())[0] || (await browser.newPage())

  if (!(await isLoggedInEagate(page))) {
    console.warn('Need Login')
    await browser.close()
    return
  }

  const response = await page.goto(detailUri)
  if (!response) {
    console.error('something wrong')
    await browser.close()
    return
  }
  const source = await response.text()

  const score = musicDetailToScore(source)
  console.log(score)

  await page.setRequestInterception(true)
  page.on('request', i => {
    i.continue({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      postData: JSON.stringify({
        password: 'password', // need change
        scores: [score],
      }),
    })
  })
  const post = await page.goto(
    `${apiBasePath}/api/v1/scores/${songId}/${userId}`
  )

  console.log(post?.statusText())

  await browser.close()
}

async function isLoggedInEagate(page: puppetter.Page) {
  const mypageUri = 'https://p.eagate.573.jp/gate/p/mypage/'
  await page.goto(mypageUri)

  const currentUri = await page.evaluate(() => document.location.href)
  return mypageUri === currentUri
}

main('nogic_admin', 'QPd01OQqbOIiDoO1dbdo1IIbb60bqPdl', 2, 1).catch(e =>
  console.error(e)
)
