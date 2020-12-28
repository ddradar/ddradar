import type { Difficulty, PlayStyle } from '@ddradar/core/db/songs'
import {
  musicDataToScoreList,
  musicDetailToScore,
} from '@ddradar/core/eagate-parser'
import { JSDOM } from 'jsdom'
import type { Page } from 'puppeteer-core'

global.DOMParser = new JSDOM().window.DOMParser

export async function isLoggedIn(page: Page): Promise<boolean> {
  const mypageUri = 'https://p.eagate.573.jp/gate/p/mypage/'
  await page.goto(mypageUri)

  const currentUri = await page.evaluate(() => document.location.href)
  return mypageUri === currentUri
}

const playDataUri = 'https://p.eagate.573.jp/game/ddr/ddra20/p/playdata'

export async function fetchScoreDetail(
  page: Page,
  songId: string,
  playStyle: PlayStyle,
  difficulty: Difficulty
): Promise<ReturnType<typeof musicDetailToScore> | null> {
  const index = (playStyle - 1) * 4 + difficulty
  const detailUri = `${playDataUri}/music_detail.html?index=${songId}&diff=${index}`

  const response = await page.goto(detailUri)
  if (!response) return null
  const source = await response.text()

  return musicDetailToScore(source)
}

export async function fetchScoreList(
  page: Page,
  pageNo: number,
  playStyle: PlayStyle
): Promise<ReturnType<typeof musicDataToScoreList> | null> {
  const style = playStyle === 1 ? 'single' : 'double'
  const detailUri = `${playDataUri}/music_data_${style}.html?offset=${pageNo}`

  const response = await page.goto(detailUri)
  if (!response) return null
  const source = await response.text()

  return musicDataToScoreList(source)
}

const rivalDataUri = 'https://p.eagate.573.jp/game/ddr/ddra20/p/rival'

export async function fetchRivalScoreDetail(
  page: Page,
  ddrCode: number,
  songId: string,
  playStyle: PlayStyle,
  difficulty: Difficulty
): Promise<ReturnType<typeof musicDetailToScore> | null> {
  const index = (playStyle - 1) * 4 + difficulty
  const detailUri = `${rivalDataUri}/music_detail.html?index=${songId}&rival_id=${ddrCode}&diff=${index}`

  const response = await page.goto(detailUri)
  if (!response) return null
  const source = await response.text()

  return musicDetailToScore(source)
}

export async function fetchRivalScoreList(
  page: Page,
  ddrCode: number,
  pageNo: number,
  playStyle: PlayStyle
): Promise<ReturnType<typeof musicDataToScoreList> | null> {
  const style = playStyle === 1 ? 'single' : 'double'
  const detailUri = `${rivalDataUri}/rival_musicdata_${style}.html?offset=${pageNo}&rival_id=${ddrCode}`

  const response = await page.goto(detailUri)
  if (!response) return null
  const source = await response.text()

  return musicDataToScoreList(source)
}
