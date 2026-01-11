import { ClearLamp, FlareRank } from '#shared/schemas/score'
import { Chart, Difficulty } from '#shared/schemas/step-chart'
import { getNumberContent, getTextContent } from '#shared/scrapes/utils'

/** Music Detail page URI */
const idRegex = /^.+\/ddr\/ddrworld\/.+(img|index)=([01689bdiloqDIOPQ]{32}).*$/
/** Image source URI */
const srcRegex = /^.+\/ddr\/ddrworld\/images\/playdata\/(.+)\.png$/

// #region Constants for parsePlayDataList()
/** Element id - Difficulty mapping */
const idDifficultyMap = new Map([
  ['beginner', Difficulty.BEGINNER],
  ['basic', Difficulty.BASIC],
  ['difficult', Difficulty.DIFFICULT],
  ['expert', Difficulty.EXPERT],
  ['challenge', Difficulty.CHALLENGE],
])
/** Image file name - DanceLevel mapping */
const fileDanceLevelMap = new Map<string, ScoreRecord['rank']>([
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
const fileClearLampMap = new Map([
  ['cl_marv', ClearLamp.MFC],
  ['cl_perf', ClearLamp.PFC],
  ['cl_great', ClearLamp.GFC],
  ['cl_good', ClearLamp.FC],
  ['cl_li4clear', ClearLamp.Life4],
  ['cl_clear', ClearLamp.Clear],
  ['cl_asclear', ClearLamp.Assisted],
  ['cl_none', ClearLamp.Failed],
])
/** Image file name - FlareRank mapping */
const fileFlareRankMap = new Map([
  ['flare_ex', FlareRank.EX],
  ['flare_9', FlareRank.IX],
  ['flare_8', FlareRank.VIII],
  ['flare_7', FlareRank.VII],
  ['flare_6', FlareRank.VI],
  ['flare_5', FlareRank.V],
  ['flare_4', FlareRank.IV],
  ['flare_3', FlareRank.III],
  ['flare_2', FlareRank.II],
  ['flare_1', FlareRank.I],
  ['flare_none', FlareRank.None],
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
    if (!songId || !name) continue

    const charts = row.getElementsByClassName('rank')
    for (let j = 0; j < charts.length; j++) {
      const chart = charts[j]!

      // Difficulty
      const difficulty = idDifficultyMap.get(chart.id.toLowerCase())
      if (difficulty === undefined) throw new Error('invalid html')

      // Normal Score
      const normalScore = getNumberContent(
        chart.getElementsByClassName('data_score')[0],
        NaN
      )
      if (isNaN(normalScore)) continue // NO PLAY or No chart

      // Dance Level
      const rank = fileDanceLevelMap.get(getImgFileName(chart, 'data_rank'))!

      // Clear Lamp
      const clearLamp = fileClearLampMap.get(
        getImgFileName(chart, 'data_clearkind')
      )!

      // Flare Skill
      const flareSkill = getNumberContent(
        chart.getElementsByClassName('data_flareskill')[0],
        NaN
      )

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
        flareSkill: isNaN(flareSkill) ? null : flareSkill,
        flareRank,
        maxCombo: null,
      })
    }
  }
  return result

  /** Detect PlayStyle from element. */
  function getPlayStyle(table: HTMLElement): StepChart['playStyle'] {
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
    const name = getTextContent(songNameCol)
    return { id, name }
  }

  /** Get image file name (without extension) from cell by class name. */
  function getImgFileName(cell: Element, className: string) {
    return cell
      .getElementsByClassName(className)[0]!
      .getElementsByTagName('img')[0]!
      .src.replace(srcRegex, '$1')
  }
}

// #region Constants for parseScoreDetail()
/** Image file name - Difficulty mapping */
const fileDifficultyMap = new Map<
  string,
  [StepChart['playStyle'], StepChart['difficulty']]
>([
  ['songdetails_0_0', [...Chart.bSP]],
  ['songdetails_0_1', [...Chart.BSP]],
  ['songdetails_0_2', [...Chart.DSP]],
  ['songdetails_0_3', [...Chart.ESP]],
  ['songdetails_0_4', [...Chart.CSP]],
  ['songdetails_1_1', [...Chart.BDP]],
  ['songdetails_1_2', [...Chart.DDP]],
  ['songdetails_1_3', [...Chart.EDP]],
  ['songdetails_1_4', [...Chart.CDP]],
])
/** Element id - ClearLamp mapping */
const clearLampIds = [
  ['fc_marv', ClearLamp.MFC],
  ['fc_perf', ClearLamp.PFC],
  ['fc_great', ClearLamp.GFC],
  ['fc_good', ClearLamp.FC],
  // Ignored because eagete miss counts "Life 4 Failed" as "Life 4 Clear"
  // https://x.com/nogic1008/status/1969199838043476041
  // ['clear_life4', ClearLamp.Life4],
] as const
/** Text - FlareRank mapping */
const textFlareRankMap = new Map([
  ['EX', FlareRank.EX],
  ['IX', FlareRank.IX],
  ['VIII', FlareRank.VIII],
  ['VII', FlareRank.VII],
  ['VI', FlareRank.VI],
  ['V', FlareRank.V],
  ['IV', FlareRank.IV],
  ['III', FlareRank.III],
  ['II', FlareRank.II],
  ['I', FlareRank.I],
  ['なし', FlareRank.None],
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
  const name =
    document
      .getElementById('music_info')
      ?.getElementsByTagName('tr')[0]
      ?.getElementsByTagName('td')[1]
      ?.innerHTML.replace(/^(.+)<br.+/ms, '$1')
      ?.trim() ?? ''

  const table = document.getElementById('music_detail_table')
  if (!table)
    throw new Error(
      getTextContent(document.getElementById('popup_cnt')) || 'invalid html'
    )

  // Get PlayStyle and Difficulty from Logo
  const logo = document
    .getElementById('diff_logo')
    ?.getElementsByTagName('img')[0]
    ?.src.replace(srcRegex, '$1')
  const [playStyle, difficulty] = fileDifficultyMap.get(logo ?? '')!

  const rank = getTextContent(getCell(1, 0)) as ScoreRecord['rank']
  const flareSkill = getNumberContent(getCell(3, 0), NaN)

  const rivalScores: RivalScore[] = []
  // Add Top Score
  const topScoreElement = table?.getElementsByTagName('top_score_disp')[0]
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
  const normalScore = getNumberContent(
    topScoreElement?.getElementsByTagName('span')[0],
    NaN
  )
  if (topScorePlayer && !isNaN(normalScore)) {
    rivalScores.push({ name: topScorePlayer, normalScore })
  }

  // Add Rival Scores
  const rivalDetailRow = document
    .getElementById('rival_detail_table')
    ?.getElementsByClassName('rival')
  for (let i = 0; i < (rivalDetailRow?.length ?? 0); i++) {
    const row = rivalDetailRow![i]!
    const name = getTextContent(row.getElementsByTagName('th')[0])
    const normalScore = getNumberContent(row.getElementsByTagName('td')[0], 0)
    if (!name || !normalScore) continue

    const rank = getTextContent(row.getElementsByTagName('td')[1]) as
      | ScoreRecord['rank']
      | ''
    const flareRank =
      textFlareRankMap.get(getTextContent(row.getElementsByTagName('td')[2])) ??
      FlareRank.None

    rivalScores.push({
      name,
      normalScore,
      rank: rank || undefined,
      flareRank,
    })
  }

  return {
    songId,
    name,
    playStyle,
    difficulty,
    normalScore: getNumberContent(getCell(1, 1), 0),
    maxCombo: getNumberContent(getCell(5, 0), 0),
    clearLamp:
      getClearLamp() ?? (rank === 'E' ? ClearLamp.Failed : ClearLamp.Assisted),
    rank,
    flareRank:
      textFlareRankMap.get(getTextContent(getCell(2, 0))) ?? FlareRank.None,
    flareSkill: Number.isInteger(flareSkill) ? flareSkill : null,
    rivalScores,
  }

  /** Get cell element by row and column index. */
  function getCell(row: number, col: number): HTMLTableCellElement | undefined {
    return table!.getElementsByTagName('tr')[row]?.getElementsByTagName('td')[
      col
    ]
  }

  /** Detect ClearLamp from element. */
  function getClearLamp():
    | Exclude<
        ValueOf<typeof ClearLamp>,
        (typeof ClearLamp)['Assisted'] | (typeof ClearLamp)['Failed']
      >
    | undefined {
    // Check Full Combo count
    for (const [id, clearLamp] of clearLampIds) {
      const count = getNumberContent(
        document.getElementById(id)?.getElementsByTagName('td')[0],
        0
      )
      if (count > 0) return clearLamp
    }
    // Check Clear count (Assisted Clear is not counted on here)
    const clearCount = getNumberContent(
      table!.getElementsByTagName('tr')[4]?.getElementsByTagName('td')[1],
      0
    )
    if (clearCount > 0) return ClearLamp.Clear

    // Assisted Clear or Failed
    return undefined
  }
}
