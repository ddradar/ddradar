export function scrapeSongNotes(
  document: Document
): Map<string, Required<Omit<StepChart, 'bpm' | 'level' | 'radar'>>[]> {
  const map: ReturnType<typeof scrapeSongNotes> = new Map()
  for (const table of document.querySelectorAll('table')) {
    const rows = table.querySelectorAll('tr')
    for (const row of rows) {
      const cells = row.querySelectorAll('td')
      if (cells.length < 2) continue

      let songName = cells[0]?.textContent?.trim()
      if (!songName) continue
      songName = decodeHtmlEntities(songName)

      const chartDataList: Required<
        Omit<StepChart, 'bpm' | 'level' | 'radar'>
      >[] = []
      // Parse all note data columns (skip first column which is song name)
      // Collect all valid chart data, filtering out dashes and invalid data
      const charts: Pick<StepChart, 'playStyle' | 'difficulty'>[] = [
        { playStyle: 1, difficulty: 0 }, // SINGLE/BEGINNER
        { playStyle: 1, difficulty: 1 }, // SINGLE/BASIC
        { playStyle: 1, difficulty: 2 }, // SINGLE/DIFFICULT
        { playStyle: 1, difficulty: 3 }, // SINGLE/EXPERT
        { playStyle: 1, difficulty: 4 }, // SINGLE/CHALLENGE
        { playStyle: 2, difficulty: 1 }, // DOUBLE/BASIC
        { playStyle: 2, difficulty: 2 }, // DOUBLE/DIFFICULT
        { playStyle: 2, difficulty: 3 }, // DOUBLE/EXPERT
        { playStyle: 2, difficulty: 4 }, // DOUBLE/CHALLENGE
      ]
      for (let i = 1; i < cells.length; i++) {
        const notesData = cells[i]?.textContent?.trim()
        if (!notesData || notesData === '-') continue

        // Parse notes data format: "notes/freezes" or "notes/freezes(shocks)"
        const notesMatch = notesData.match(/^(\d+)\/(\d+)(?:\((\d+)\))?/)
        if (!notesMatch) continue

        const notes = parseInt(notesMatch[1]!, 10)
        const freezes = parseInt(notesMatch[2]!, 10)
        const shocks = notesMatch[3] ? parseInt(notesMatch[3]!, 10) : 0

        chartDataList.push({ ...charts[i - 1]!, notes, freezes, shocks })
      }

      if (chartDataList.length > 0) {
        map.set(songName, chartDataList)
      }
    }
  }
  return map
}

export function scrapeGrooveRadar(
  document: Document,
  playStyle: StepChart['playStyle']
): Map<
  string,
  Required<Pick<StepChart, 'playStyle' | 'difficulty' | 'radar'>>[]
> {
  const difficultyRecord: Record<string, StepChart['difficulty']> = {
    BEGINNER: 0,
    BASIC: 1,
    DIFFICULT: 2,
    EXPERT: 3,
    CHALLENGE: 4,
  }
  const map: ReturnType<typeof scrapeGrooveRadar> = new Map()

  // Parse all tables in the document
  const tables = document.querySelectorAll('table')

  for (const table of tables) {
    const rows = table.querySelectorAll('tr')
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
        songName = decodeHtmlEntities(
          cells[cellIndex++]?.textContent?.trim() || ''
        )
        const difficultyText = cells[cellIndex++]?.textContent
          ?.trim()
          .toUpperCase()
        difficulty = difficultyRecord[difficultyText || '']
      } else {
        // Case 2: no rowspan. If the first cell is a difficulty label, reuse current song.
        // If it's not a difficulty label, treat it as song name (1-chart songs with no rowspan).
        const firstText = cells[cellIndex++]?.textContent?.trim() || ''
        const firstDifficulty = difficultyRecord[firstText.toUpperCase()] as
          | StepChart['difficulty']
          | undefined

        if (firstDifficulty !== undefined) {
          difficulty = firstDifficulty
        } else {
          // New song without rowspan; difficulty is the next cell
          songName = decodeHtmlEntities(firstText)
          const difficultyText = cells[cellIndex++]?.textContent
            ?.trim()
            .toUpperCase()
          difficulty = difficultyRecord[difficultyText || '']
        }
      }
      // Skip level cell
      cellIndex++

      if (!songName || difficulty === undefined) continue

      // Extract radar values (5 values: Stream, Voltage, Air, Freeze, Chaos)
      const values: number[] = []
      let hasInvalidValue = false
      for (let i = cellIndex; i < cellIndex + 5 && i < cells.length; i++) {
        const cellText = cells[i]?.textContent?.trim()
        const value = parseInt(cellText || '', 10)
        // Skip this row if any value is invalid (can't parse to number)
        if (!cellText || isNaN(value)) {
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
  ['&AElig;THER', 'ÆTHER'],
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
  const title = text.replace(/&([a-zA-Z0-9]+);/gi, entity => {
    const entities: { [key: string]: string } = {
      atilde: 'ã',
      hearts: '♥',
      nbsp: ' ',
      amp: '&',
      lt: '<',
      gt: '>',
      quot: '"',
      apos: "'",
      ntilde: 'ñ',
      AElig: 'Æ',
      eacute: 'é',
      sup2: '²',
    }
    const name = entity.slice(1, -1).toLowerCase()
    return entities[name] || entity
  })
  return corrections.get(title) ?? title
}
