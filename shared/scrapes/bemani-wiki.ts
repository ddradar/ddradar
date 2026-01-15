/** Scraper for BEMANIWiki 2nd. */
import he from 'he'

import { Chart, Difficulty } from '#shared/schemas/step-chart'
import { getNumberContent, getTextContent } from '#shared/scrapes/utils'

/**
 * Scrape song notes data from BEMANIWiki 2nd document.
 * @param document DOM of BEMANIWiki 2nd "Total Notes List" page.
 * - https://bemaniwiki.com/?DanceDanceRevolution+WORLD/%C1%B4%B6%CA%C1%ED%A5%CE%A1%BC%A5%C4%BF%F4%A5%EA%A5%B9%A5%C8
 * @returns Map of song name to array of note data (notes, freezes, shocks) per chart
 */
export function scrapeSongNotes(
  document: Document
): Map<string, Required<Omit<StepChart, 'bpm' | 'level' | 'radar'>>[]> {
  const map: ReturnType<typeof scrapeSongNotes> = new Map()
  for (const table of document.querySelectorAll('table')) {
    // Total notes table has 2+ header rows (style, difficulties); skip others
    if (table.querySelectorAll('thead tr').length <= 1) continue

    const rows = table.querySelectorAll('tbody tr')
    for (const row of rows) {
      const cells = row.querySelectorAll('td')
      if (cells.length < 2) continue // Series title row

      let songName = getTextContent(cells[0])
      if (!songName) continue
      songName = decodeHtmlEntities(songName)

      const chartDataList: Required<
        Omit<StepChart, 'bpm' | 'level' | 'radar'>
      >[] = []
      // Parse all note data columns (skip first column which is song name)
      // Collect all valid chart data, filtering out dashes and invalid data
      const charts: Pick<StepChart, 'playStyle' | 'difficulty'>[] = [
        Chart.bSP,
        Chart.BSP,
        Chart.DSP,
        Chart.ESP,
        Chart.CSP,
        Chart.BDP,
        Chart.DDP,
        Chart.EDP,
        Chart.CDP,
      ].map(([playStyle, difficulty]) => ({ playStyle, difficulty }))
      for (let i = 1; i < cells.length; i++) {
        // Parse notes data format: "notes/freezes" or "notes/freezes(shocks)"
        const notesMatch = getTextContent(cells[i]).match(
          /^(\d+)\/(\d+)(?:\((\d+)\))?/
        )
        if (!notesMatch) continue

        const notes = parseInt(notesMatch[1]!, 10)
        const freezes = parseInt(notesMatch[2]!, 10)
        const shocks = notesMatch[3] ? parseInt(notesMatch[3]!, 10) : 0

        chartDataList.push({ ...charts[i - 1]!, notes, freezes, shocks })
      }

      if (chartDataList.length > 0) map.set(songName, chartDataList)
    }
  }
  return map
}

/**
 * Scrape groove radar data from BEMANIWiki 2nd document.
 * @param document DOM of BEMANIWiki 2nd "Groove Radar List (SP/DP)" page.
 * - https://bemaniwiki.com/?DanceDanceRevolution+GRAND+PRIX/%C1%B4%B6%CA%A5%B0%A5%EB%A1%BC%A5%F4%A5%EC%A1%BC%A5%C0%A1%BC%C3%CD%A5%EA%A5%B9%A5%C8%28SP%29
 * - https://bemaniwiki.com/?DanceDanceRevolution+GRAND+PRIX/%C1%B4%B6%CA%A5%B0%A5%EB%A1%BC%A5%F4%A5%EC%A1%BC%A5%C0%A1%BC%C3%CD%A5%EA%A5%B9%A5%C8%28DP%29
 * - https://bemaniwiki.com/?DanceDanceRevolution+A3/%B5%EC%B6%CA%A5%B0%A5%EB%A1%BC%A5%F4%A5%EC%A1%BC%A5%C0%A1%BC%C3%CD%A5%EA%A5%B9%A5%C8%28SP%29
 * - https://bemaniwiki.com/?DanceDanceRevolution+A3/%B5%EC%B6%CA%A5%B0%A5%EB%A1%BC%A5%F4%A5%EC%A1%BC%A5%C0%A1%BC%C3%CD%A5%EA%A5%B9%A5%C8%28DP%29
 * - https://bemaniwiki.com/?DanceDanceRevolution+A3/%BF%B7%B6%CA%A5%B0%A5%EB%A1%BC%A5%F4%A5%EC%A1%BC%A5%C0%A1%BC%C3%CD%A5%EA%A5%B9%A5%C8%28SP%29
 * - https://bemaniwiki.com/?DanceDanceRevolution+A3/%BF%B7%B6%CA%A5%B0%A5%EB%A1%BC%A5%F4%A5%EC%A1%BC%A5%C0%A1%BC%C3%CD%A5%EA%A5%B9%A5%C8%28DP%29
 * @param playStyle Play style of the charts to scrape (SP/DP).
 * @returns Map of song name to array of groove radar data per chart
 */
export function scrapeGrooveRadar(
  document: Document,
  playStyle: StepChart['playStyle']
): Map<
  string,
  Required<Pick<StepChart, 'playStyle' | 'difficulty' | 'radar'>>[]
> {
  const map: ReturnType<typeof scrapeGrooveRadar> = new Map()

  // Parse all tables in the document
  const tables = document.querySelectorAll('table')

  for (const table of tables) {
    // Total notes table has 2 header rows (header, groove radar properties); skip others
    if (table.querySelectorAll('thead tr').length <= 1) continue

    const rows = table.querySelectorAll('tbody tr')
    let songName = ''

    for (const row of rows) {
      const cells = row.querySelectorAll('td')
      if (cells.length < 2) continue

      // Check if first cell has rowspan (indicates song name row)
      const firstCell = cells[0]
      const hasRowspan = firstCell?.getAttribute('rowspan')

      let cellIndex = 0
      let difficulty: StepChart['difficulty'] | undefined

      // Case 1: rowspan present -> first cell is song name
      if (hasRowspan) {
        songName = decodeHtmlEntities(getTextContent(cells[cellIndex++]))
        const difficultyText = getTextContent(cells[cellIndex++]).toUpperCase()
        difficulty = Difficulty[difficultyText as keyof typeof Difficulty]
      } else {
        // Case 2: no rowspan. If the first cell is a difficulty label, reuse current song.
        // If it's not a difficulty label, treat it as song name (1-chart songs with no rowspan).
        const firstText = getTextContent(cells[cellIndex++])
        const firstDifficulty =
          Difficulty[firstText.toUpperCase() as keyof typeof Difficulty]

        if (firstDifficulty !== undefined) {
          difficulty = firstDifficulty
        } else {
          // New song without rowspan; difficulty is the next cell
          songName = decodeHtmlEntities(firstText)
          const difficultyText = getTextContent(
            cells[cellIndex++]
          ).toUpperCase()
          difficulty = Difficulty[difficultyText as keyof typeof Difficulty]
        }
      }
      // Skip level cell
      cellIndex++

      if (!songName || difficulty === undefined) continue

      // Extract radar values (5 values: Stream, Voltage, Air, Freeze, Chaos)
      const values: number[] = []
      let hasInvalidValue = false
      for (let i = cellIndex; i < cellIndex + 5 && i < cells.length; i++) {
        const value = getNumberContent(cells[i], NaN)
        // Skip this row if any value is invalid (can't parse to number)
        if (isNaN(value)) {
          hasInvalidValue = true
          break
        }
        values.push(value)
      }

      // Skip if we couldn't parse all values
      if (hasInvalidValue || values.length < 5) continue

      // Initialize song map if needed
      if (!map.has(songName)) map.set(songName, [])

      const difficulties = map.get(songName)!
      difficulties.push({
        playStyle,
        difficulty,
        radar: {
          stream: values[0]!,
          voltage: values[1]!,
          air: values[2]!,
          freeze: values[3]!,
          chaos: values[4]!,
        },
      })
    }
  }

  return map
}

const corrections = new Map<string, string>([
  ['エキサイティング!!も・ちゃ・ちゃ☆', 'エキサイティング！！も・ちゃ・ちゃ☆'],
  ['踊れ!!バーチャルアニマル!!', '踊れ！！バーチャルアニマル！！'],
  ['おひさし中華街!', 'おひさし中華街！'],
  ['カジノファイヤーことみちゃん(ReGLOSS)', 'カジノファイヤーことみちゃん'],
  ['恋はどう？モロ◎波動OK☆方程式!!', '恋はどう？モロ◎波動OK☆方程式！！'],
  ['ちくわパフェだよ☆CKP', 'ちくわパフェだよ☆ＣＫＰ'],
  ['闘え！ダダンダーンV', '闘え！ダダンダーンＶ'],
  ['突撃!ガラスのニーソ姫!', '突撃！ガラスのニーソ姫！'],
  ['轟け!恋のビーンボール!!', '轟け！恋のビーンボール！！'],
  ['めうめうぺったんたん!!', 'めうめうぺったんたん！！'],
  ['ロンロンへ ライライライ!', 'ロンロンへ　ライライライ！'],
  ['BabeL 〜Next Story〜', 'BabeL ～Next Story～'],
  ['GRADIUS REMIX（↑↑↓↓←→←→BA Ver.)', 'GRADIUS REMIX (↑↑↓↓←→←→BA Ver.)'],
  ['Ha・lle・lu・jah', 'Ha･lle･lu･jah'],
  ['KIMONO♡PRINCESS', 'KIMONO♥PRINCESS'],
  ['Leaving･･･', 'Leaving…'],
  [
    'LOVE AGAIN TONIGHT～For Melissa Mix～',
    'LOVE AGAIN TONIGHT～For Melissa MIX～',
  ],
  ['MITOれて!いばらきっしゅだ～りん', 'MITOれて！いばらきっしゅだ～りん'],
  ['murmur twins (guitar pop ver.)(ReGLOSS)', 'murmur twins (guitar pop ver.)'],
  [
    'murmur twins (guitar pop ver.) (ReGLOSS)',
    'murmur twins (guitar pop ver.)',
  ],
  ['neko*neko', 'neko＊neko'],
  [
    'osaka EVOLVED -毎度、おおきに!- (TYPE1)',
    'osaka EVOLVED -毎度、おおきに！- (TYPE1)',
  ],
  [
    'osaka EVOLVED -毎度、おおきに!- (TYPE2)',
    'osaka EVOLVED -毎度、おおきに！- (TYPE2)',
  ],
  [
    'osaka EVOLVED -毎度、おおきに!- (TYPE3)',
    'osaka EVOLVED -毎度、おおきに！- (TYPE3)',
  ],
  [
    'Party Lights (Tommie Sunshine’s Brooklyn Fire Remix)',
    "Party Lights (Tommie Sunshine's Brooklyn Fire Remix)",
  ],
  ['smooooch・∀・', 'smooooch･∀･'],
  ['Timepiece phase II', 'Timepiece phase Ⅱ'],
])
function decodeHtmlEntities(text: string): string {
  const title = he.decode(text)
  return corrections.get(title) ?? title
}
