type PlayStyle = ScoreRecordInput['playStyle']
type Difficulty = ScoreRecordInput['difficulty']
type DanceLevel = ScoreRecordInput['rank']
type ClearLamp = ScoreRecordInput['clearLamp']
type FlareRank = ScoreRecordInput['flareRank']

/** Music Detail page URI */
const idRegex = /^.+\/ddr\/ddrworld\/.+(img|index)=([01689bdiloqDIOPQ]{32}).*$/
/** Image source URI */
const srcRegex = /^.+\/ddr\/ddrworld\/images\/playdata\/(.+)\.png$/

// #region Constants for parsePlayDataList()
/** Element id - Difficulty mapping */
const idDifficultyMap = new Map<string, Difficulty>([
  ['beginner', 0],
  ['basic', 1],
  ['difficult', 2],
  ['expert', 3],
  ['challenge', 4],
])
/** Image file name - DanceLevel mapping */
const fileDanceLevelMap = new Map<string, DanceLevel>([
  ['rank_s_aaa', 'AAA'],
  ['rank_s_aa_p', 'AA+'],
  ['rank_s_aa', 'AA'],
  ['rank_s_aa_m', 'AA-'],
  ['rank_s_a_p', 'A+'],
  ['rank_s_a', 'A'],
  ['rank_s_a_m', 'A-'],
  ['rank_s_b_p', 'B+'],
  ['rank_s_b', 'B'],
  ['rank_s_b_m', 'B-'],
  ['rank_s_c_p', 'C+'],
  ['rank_s_c', 'C'],
  ['rank_s_c_m', 'C-'],
  ['rank_s_d_p', 'D+'],
  ['rank_s_d', 'D'],
  ['rank_s_e', 'E'],
])
/** Image file name - ClearLamp mapping */
const fileClearLampMap = new Map<string, ClearLamp>([
  ['cl_marv', 7],
  ['cl_perf', 6],
  ['cl_great', 5],
  ['cl_good', 4],
  ['cl_li4clear', 3],
  ['cl_clear', 2],
  ['cl_asclear', 1],
  ['cl_none', 0],
])
/** Image file name - FlareRank mapping */
const fileFlareRankMap = new Map<string, FlareRank>([
  ['flare_ex', 10],
  ['flare_9', 9],
  ['flare_8', 8],
  ['flare_7', 7],
  ['flare_6', 6],
  ['flare_5', 5],
  ['flare_4', 4],
  ['flare_3', 3],
  ['flare_2', 2],
  ['flare_1', 1],
  ['flare_none', 0],
])
// #endregion

type EAGateScoreRecord = Omit<ScoreRecordInput, 'userId' | 'exScore'> &
  Pick<SongInfo, 'name'>

/**
 * Parse score data from e-amusement PLAY DATA page.
 * @param document HTML Document of PLAY DATA page
 * - https://p.eagate.573.jp/game/ddr/ddrworld/playdata/music_data_single.html
 * - https://p.eagate.573.jp/game/ddr/ddrworld/playdata/music_data_double.html
 */
export function parsePlayDataList(document: Document): EAGateScoreRecord[] {
  const dataTable = document.getElementById('data_tbl')
  if (!dataTable) throw new Error('invalid html')

  const playStyle = getPlayStyle(dataTable)

  const result: ReturnType<typeof parsePlayDataList> = []

  const songs = dataTable.getElementsByClassName('data')
  for (let i = 0; i < songs.length; i++) {
    const row = songs[i]!
    const { id: songId, name } = getSongInfo(row)
    /* v8 ignore if -- @preserve */
    if (!songId || !name) continue

    const charts = row.getElementsByClassName('rank')
    for (let j = 0; j < charts.length; j++) {
      const chart = charts[j]!

      // Difficulty
      const difficulty = idDifficultyMap.get(chart.id.toLowerCase())
      if (difficulty === undefined) throw new Error('invalid html')

      // Normal Score
      const normalScore = getInteger(chart, 'data_score')
      if (normalScore === undefined) continue // NO PLAY or No chart

      // Dance Level
      const rank = fileDanceLevelMap.get(getImgFileName(chart, 'data_rank'))!

      // Clear Lamp
      const clearLamp = fileClearLampMap.get(
        getImgFileName(chart, 'data_clearkind')
      )!

      // Flare Skill
      const flareSkill = getInteger(chart, 'data_flareskill') ?? null

      // Flare Rank
      const flareRank = fileFlareRankMap.get(
        getImgFileName(chart, 'data_flarerank')
      )!

      result.push({
        songId,
        name,
        playStyle,
        difficulty,
        normalScore,
        clearLamp,
        rank,
        flareSkill,
        flareRank,
        maxCombo: null,
      })
    }
  }
  return result

  /** Detect PlayStyle from element. */
  function getPlayStyle(table: HTMLElement): PlayStyle {
    // Get PlayStyle from columns count
    const headerColumns = table
      .getElementsByClassName('column')[0]
      ?.getElementsByClassName('rank')?.length
    if (headerColumns === 5) return 1 // BEGINNER, BASIC, DIFFICULT, EXPERT, CHALLENGE
    if (headerColumns === 4) return 2 // BASIC, DIFFICULT, EXPERT, CHALLENGE
    throw new Error('invalid html')
  }

  function getSongInfo(row: Element) {
    const songNameCol = row
      .getElementsByTagName('td')[0]!
      .getElementsByClassName('music_info')[0]!
    const id = songNameCol.getAttribute('href')?.replace(idRegex, '$2')
    const name = songNameCol.textContent!.trim()
    return { id, name }
  }

  function getInteger(cell: Element, className: string) {
    const res = parseInt(
      /* v8 ignore next -- @preserve */
      cell.getElementsByClassName(className)[0]?.textContent ?? '',
      10
    )
    return Number.isInteger(res) ? res : undefined
  }

  function getImgFileName(cell: Element, className: string) {
    return cell
      .getElementsByClassName(className)[0]!
      .getElementsByTagName('img')[0]!
      .src.replace(srcRegex, '$1')
  }
}

// #region Constants for parseScoreDetail()
/** Image file name - Difficulty mapping */
const fileDifficultyMap = new Map<string, [PlayStyle, Difficulty]>([
  ['songdetails_0_0', [1, 0]],
  ['songdetails_0_1', [1, 1]],
  ['songdetails_0_2', [1, 2]],
  ['songdetails_0_3', [1, 3]],
  ['songdetails_0_4', [1, 4]],
  ['songdetails_1_1', [2, 1]],
  ['songdetails_1_2', [2, 2]],
  ['songdetails_1_3', [2, 3]],
  ['songdetails_1_4', [2, 4]],
])
/** Element id - ClearLamp mapping */
const clearLampIds: [string, ClearLamp][] = [
  ['fc_marv', 7],
  ['fc_perf', 6],
  ['fc_great', 5],
  ['fc_good', 4],
  // Ignored because eagete counts "Life 4 Failed" as "Life 4 Clear"
  // https://x.com/nogic1008/status/1969199838043476041
  // ['clear_life4', 3],
]
/** Text - FlareRank mapping */
const textFlareRankMap = new Map<string, FlareRank>([
  ['EX', 10],
  ['IX', 9],
  ['VIII', 8],
  ['VII', 7],
  ['VI', 6],
  ['V', 5],
  ['IV', 4],
  ['III', 3],
  ['II', 2],
  ['I', 1],
  ['なし', 0],
])
// #endregion

type RivalScore = Pick<ScoreRecordInput, 'normalScore'> & {
  name: string
} & Partial<Pick<ScoreRecordInput, 'rank' | 'flareRank'>>

/**
 * Parse score data from e-amusement MUSIC DETAIL page.
 * @param document HTML Document of MUSIC DETAIL page
 * - https://p.eagate.573.jp/game/ddr/ddrworld/playdata/music_detail.html
 */
export function parseScoreDetail(
  document: Document
): EAGateScoreRecord & { rivalScores: RivalScore[] } {
  const songId = document
    .getElementById('music_info')
    ?.getElementsByTagName('tr')[0]
    ?.getElementsByTagName('td')[0]
    ?.getElementsByTagName('img')[0]
    ?.src.replace(idRegex, '$2')
  if (!songId) throw new Error('invalid html')
  /* v8 ignore next -- @preserve */
  const name =
    document
      .getElementById('music_info')
      ?.getElementsByTagName('tr')[0]
      ?.getElementsByTagName('td')[1]
      ?.innerHTML.replace(/^(.+)<br.+/ms, '$1')
      ?.trim() ?? ''

  const table = document.getElementById('music_detail_table')
  if (!table) {
    const message =
      document.getElementById('popup_cnt')?.textContent?.trim() ??
      'invalid html'
    throw new Error(message)
  }

  // Get PlayStyle and Difficulty from Logo
  const logo = document
    .getElementById('diff_logo')
    ?.getElementsByTagName('img')[0]
    ?.src.replace(srcRegex, '$1')
  const [playStyle, difficulty] = fileDifficultyMap.get(
    /* v8 ignore next -- @preserve */
    logo ?? ''
  )!

  const rank = getText(table, 1, 0) as DanceLevel
  const flareSkill = parseInt(getText(table, 3, 0), 10)

  const rivalScores: RivalScore[] = []
  // Add Top Score
  const topScoreElement = table?.getElementsByTagName('top_score_disp')[0]
  /* v8 ignore next -- @preserve */
  const topScorePlayer = topScoreElement
    ? Array.from(topScoreElement.childNodes)
        .find(
          node =>
            node.nodeType === Node.TEXT_NODE &&
            node.textContent?.trim() !== '' &&
            node.textContent?.includes('/')
        )
        ?.textContent?.trim()
    : undefined
  const topScoreText =
    topScoreElement?.getElementsByTagName('span')[0]?.textContent
  if (topScorePlayer && topScoreText) {
    rivalScores.push({
      name: topScorePlayer,
      normalScore: parseInt(topScoreText, 10),
    })
  }

  // Add Rival Scores
  const rivalDetailRow = document
    .getElementById('rival_detail_table')
    ?.getElementsByClassName('rival')
  for (let i = 0; i < (rivalDetailRow?.length ?? 0); i++) {
    const row = rivalDetailRow![i]!
    const name = row.getElementsByTagName('th')[0]?.textContent?.trim()
    const normalScore = parseInt(
      /* v8 ignore next -- @preserve */
      row.getElementsByTagName('td')[0]?.textContent ?? '',
      10
    )
    if (!name || !normalScore) continue
    const rank = row.getElementsByTagName('td')[1]?.textContent as
      | DanceLevel
      | undefined
    const flareRank =
      /* v8 ignore next -- @preserve */
      textFlareRankMap.get(
        row.getElementsByTagName('td')[2]?.textContent ?? ''
      ) ?? 0

    rivalScores.push({
      name,
      normalScore,
      rank,
      flareRank,
    })
  }

  return {
    songId,
    name,
    playStyle,
    difficulty,
    normalScore: parseInt(getText(table, 1, 1), 10),
    maxCombo: parseInt(getText(table, 5, 0), 10),
    clearLamp: getClearLamp() ?? (rank === 'E' ? 0 : 1),
    rank,
    /* v8 ignore next -- @preserve */
    flareRank: textFlareRankMap.get(getText(table, 2, 0)) ?? 0,
    flareSkill: Number.isInteger(flareSkill) ? flareSkill : null,
    rivalScores,
  }

  function getText(table: Element, row: number, col: number): string {
    return (
      /* v8 ignore next -- @preserve */
      table.getElementsByTagName('tr')[row]?.getElementsByTagName('td')[col]
        ?.textContent ?? ''
    )
  }

  /** Detect ClearLamp from element. */
  function getClearLamp(): ClearLamp | undefined {
    // Check Full Combo count
    for (const [id, clearLamp] of clearLampIds) {
      /* v8 ignore next -- @preserve */
      const countText = document
        .getElementById(id)
        ?.getElementsByTagName('td')[0]?.textContent
      if (parseInt(/* v8 ignore next -- @preserve */ countText ?? '', 10) > 0)
        return clearLamp
    }
    // Check Clear count (Assisted Clear is not counted on here)
    /* v8 ignore next -- @preserve */
    const clearCountText = table!
      .getElementsByTagName('tr')[4]
      ?.getElementsByTagName('td')[1]?.textContent
    if (
      parseInt(/* v8 ignore next -- @preserve */ clearCountText ?? '', 10) > 0
    )
      return 2

    // Assisted Clear or Falied
    return undefined
  }
}
