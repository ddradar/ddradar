import { Gate } from '@ddradar/core'
import type { Difficulty, PlayStyle, Series } from '@ddradar/db-definitions'
import { config } from 'dotenv'
import { JSDOM } from 'jsdom'
import type { Page } from 'puppeteer-core'

import { isCourse } from './database'

// load .env file
config()

/* eslint-disable node/no-process-env */
const { KONAMI_ID: loginId, KONAMI_PASSWORD: password } = process.env
/* eslint-enable node/no-process-env */

global.DOMParser = new JSDOM().window.DOMParser

export async function isLoggedIn(page: Page): Promise<boolean> {
  const mypageUri = 'https://p.eagate.573.jp/gate/p/mypage/'
  await page.goto(mypageUri, { waitUntil: 'domcontentloaded' })

  if (mypageUri === (await page.evaluate(() => document.location.href))) {
    return true
  }

  if (!loginId || !password) return false

  if (!(await page.$eval('#id_userId', el => (el as HTMLInputElement).value))) {
    await page.type('#id_userId', loginId)
  }
  if (
    !(await page.$eval('#id_password', el => (el as HTMLInputElement).value))
  ) {
    await page.type('#id_password', password)
  }
  await Promise.all([
    page.waitForNavigation({ timeout: 30000, waitUntil: 'domcontentloaded' }),
    page.click('.btn-area p.btn a span', { delay: 500 }),
  ])

  return mypageUri === (await page.evaluate(() => document.location.href))
}

type GateSeries = Series & `DanceDanceRevolution A${number}`
const getUri = (series: GateSeries, file: string, query: string) =>
  `https://p.eagate.573.jp/game/ddr/${
    series === 'DanceDanceRevolution A3' ? 'ddra3' : 'ddra20'
  }/p/playdata/${file}?${query}`

export async function fetchScoreDetail(
  page: Page,
  songId: string,
  playStyle: PlayStyle,
  difficulty: Difficulty,
  series: GateSeries = 'DanceDanceRevolution A3'
): Promise<ReturnType<typeof Gate.musicDetailToScore> | null> {
  const index = (playStyle - 1) * 4 + difficulty
  const detailUri = getUri(
    series,
    `${(await isCourse(songId)) ? 'course' : 'music'}_detail.html`,
    `index=${songId}&diff=${index}`
  )

  const response = await page.goto(detailUri)
  if (!response) return null
  const source = await response.text()

  return Gate.musicDetailToScore(source)
}

export async function fetchScoreList(
  page: Page,
  pageNo: number,
  playStyle: PlayStyle,
  series: GateSeries = 'DanceDanceRevolution A3'
): Promise<ReturnType<typeof Gate.musicDataToScoreList> | null> {
  const style = playStyle === 1 ? 'single' : 'double'
  const detailUri = getUri(
    series,
    `music_data_${style}.html`,
    `offset=${pageNo}`
  )

  const response = await page.goto(detailUri)
  if (!response) return null
  const source = await response.text()

  return Gate.musicDataToScoreList(source)
}

const rivalDataUri = 'https://p.eagate.573.jp/game/ddr/ddra3/p/rival'

export async function fetchRivalScoreDetail(
  page: Page,
  ddrCode: number,
  songId: string,
  playStyle: PlayStyle,
  difficulty: Difficulty
): Promise<ReturnType<typeof Gate.musicDetailToScore> | null> {
  const index = (playStyle - 1) * 4 + difficulty
  const detailUri = `${rivalDataUri}/music_detail.html?index=${songId}&rival_id=${ddrCode}&diff=${index}`

  const response = await page.goto(detailUri)
  if (!response) return null
  const source = await response.text()

  return Gate.musicDetailToScore(source)
}

export async function fetchRivalScoreList(
  page: Page,
  ddrCode: number,
  pageNo: number,
  playStyle: PlayStyle
): Promise<ReturnType<typeof Gate.musicDataToScoreList> | null> {
  const style = playStyle === 1 ? 'single' : 'double'
  const detailUri = `${rivalDataUri}/rival_musicdata_${style}.html?offset=${pageNo}&rival_id=${ddrCode}`

  const response = await page.goto(detailUri)
  if (!response) return null
  const source = await response.text()

  return Gate.musicDataToScoreList(source)
}
