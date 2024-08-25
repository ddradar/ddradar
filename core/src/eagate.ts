import type { ClearLamp, DanceLevel, FlareRank, UserScoreRecord } from './score'
import type { Difficulty, PlayStyle } from './song'

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

export type ScoreData = Omit<UserScoreRecord, 'userId' | 'userName' | 'level'>

/**
 * Parse score data from e-amusement PLAY DATA page.
 * @param sourceCode HTML source code of PLAY DATA page.
 * - https://p.eagate.573.jp/game/ddr/ddrworld/playdata/music_data_single.html
 * - https://p.eagate.573.jp/game/ddr/ddrworld/playdata/music_data_double.html
 */
export function parsePlayDataList(sourceCode: string): ScoreData[] {
  const doc = new DOMParser().parseFromString(sourceCode, 'text/html')
  const dataTable = doc.getElementById('data_tbl')
  if (!dataTable) throw new Error('invalid html')

  const playStyle = getPlayStyle(dataTable)

  const result: ScoreData[] = []

  const songs = dataTable.getElementsByClassName('data')
  for (let i = 0; i < songs.length; i++) {
    const row = songs[i]
    const { songId, songName } = getSongInfo(row)
    if (!songId || !songName) continue

    const charts = row.getElementsByClassName('rank')
    for (let j = 0; j < charts.length; j++) {
      const chart = charts[j]

      // Difficulty
      const difficulty = idDifficultyMap.get(chart.id.toLowerCase())
      if (difficulty === undefined) throw new Error('invalid html')

      // Normal Score
      const score = getInteger(chart, 'data_score')
      if (score === undefined) continue // NO PLAY or No chart

      // Dance Level
      const rank = fileDanceLevelMap.get(getImgFileName(chart, 'data_rank'))!

      // Clear Lamp
      const clearLamp = fileClearLampMap.get(
        getImgFileName(chart, 'data_clearkind')
      )!

      // Flare Skill
      const flareSkill = getInteger(chart, 'data_flareskill')

      // Flare Rank
      const flareRank = fileFlareRankMap.get(
        getImgFileName(chart, 'data_flarerank')
      )!

      result.push({
        songId,
        songName,
        playStyle,
        difficulty,
        score,
        clearLamp,
        rank,
        ...(flareSkill !== undefined ? { flareSkill } : {}),
        flareRank,
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
      .getElementsByTagName('td')[0]
      .getElementsByClassName('music_info')[0]
    const songId = songNameCol.getAttribute('href')?.replace(idRegex, '$2')
    const songName = songNameCol.textContent!.trim()
    return { songId, songName }
  }

  function getInteger(cell: Element, className: string) {
    const res = parseInt(
      cell.getElementsByClassName(className)[0].textContent!,
      10
    )
    return Number.isInteger(res) ? res : undefined
  }

  function getImgFileName(cell: Element, className: string) {
    return cell
      .getElementsByClassName(className)[0]
      .getElementsByTagName('img')[0]
      .src.replace(srcRegex, '$1')
  }
}

export type ScoreDetailData = ScoreData & {
  /** World Record */
  topScore: UserScoreRecord['score']
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
  ['clear_life4', 3],
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
])
// #endregion

/**
 * Parse score data from e-amusement MUSIC DETAIL page.
 * @param sourceCode HTML source code of MUSIC DETAIL page.
 * - https://p.eagate.573.jp/game/ddr/ddrworld/playdata/music_detail.html
 */
export function parseScoreDetail(sourceCode: string): ScoreDetailData {
  const doc = new DOMParser().parseFromString(sourceCode, 'text/html')

  const songId = doc
    .getElementById('music_info')
    ?.getElementsByTagName('tr')[0]
    ?.getElementsByTagName('td')[0]
    ?.getElementsByTagName('img')[0]
    ?.src.replace(idRegex, '$2')
  if (!songId) throw new Error('invalid html')
  const songName = doc
    .getElementById('music_info')!
    .getElementsByTagName('tr')[0]
    .getElementsByTagName('td')[1]
    .innerHTML.replace(/^(.+)<br.+/ms, '$1')
    .trim()

  const detailTable = doc.getElementById('music_detail_table')
  if (!detailTable) {
    const message =
      doc.getElementById('popup_cnt')?.textContent?.trim() ?? 'invalid html'
    throw new Error(message)
  }

  // Get PlayStyle and Difficulty from Logo
  const logo = doc
    .getElementById('diff_logo')!
    .getElementsByTagName('img')[0]
    .src.replace(srcRegex, '$1')
  const [playStyle, difficulty] = fileDifficultyMap.get(logo)!

  const rank = getText(1, 0) as DanceLevel
  const topScoreText = detailTable
    .getElementsByTagName('tr')[2]
    .getElementsByTagName('td')[1]
    .getElementsByTagName('span')[0].textContent!
  const flareSkill = parseInt(getText(3, 0), 10)

  return {
    songId,
    songName,
    playStyle,
    difficulty,
    score: parseInt(getText(1, 1), 10),
    maxCombo: parseInt(getText(5, 0), 10),
    clearLamp: getClearLamp() ?? (rank === 'E' ? 0 : 1),
    rank,
    flareRank: textFlareRankMap.get(getText(2, 0)) ?? 0,
    ...(Number.isInteger(flareSkill) ? { flareSkill } : {}),
    topScore: parseInt(topScoreText, 10),
  }

  function getText(row: number, col: number): string {
    return detailTable!
      .getElementsByTagName('tr')
      [row].getElementsByTagName('td')[col].textContent!
  }

  /** Detect ClearLamp from element. */
  function getClearLamp(): ClearLamp | undefined {
    // Check Full Combo count & Life 4 Clear count
    for (const [id, clearLamp] of clearLampIds) {
      const countText = doc
        .getElementById(id)!
        .getElementsByTagName('td')[0].textContent!
      if (parseInt(countText, 10) > 0) return clearLamp
    }
    // Check Clear count (Assisted Clear is not counted on here)
    const clearCountText = detailTable!
      .getElementsByTagName('tr')[4]
      .getElementsByTagName('td')[1].textContent!
    if (parseInt(clearCountText, 10) > 0) return 2

    // Assisted Clear or Falied
    return undefined
  }
}
