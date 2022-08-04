import { config } from 'dotenv'

// load .env file
config()

import puppeteer from 'puppeteer-core'

/* eslint-disable node/no-process-env */
const { CHROME_EXE_PATH: executablePath, CHROME_USER_PATH: userDataDir } =
  process.env
/* eslint-enable node/no-process-env */

export default class Browser {
  private browser!: puppeteer.Browser

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  static async create(): Promise<Browser> {
    const browser = new Browser()
    browser.browser = await puppeteer.launch({ executablePath, userDataDir })
    return browser
  }

  async createPage(): Promise<puppeteer.Page> {
    const page =
      (await this.browser.pages())[0] || (await this.browser.newPage())

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
    )
    await page.setRequestInterception(true)
    page.on('request', req => {
      if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
        req.abort()
      } else {
        req.continue()
      }
    })

    return page
  }

  async close(): Promise<void> {
    await this.browser.close()
  }
}
