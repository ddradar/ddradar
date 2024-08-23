import type { ClearLamp, DanceLevel, FlareRank, UserScoreRecord } from './score'
import { scoreRecordSchema } from './score'

export type ScoreData = Omit<UserScoreRecord, 'userId' | 'userName' | 'level'>

/** Music Detail page URI */
const idRegex = /^.+\/ddr\/ddrworld\/.+(img|index)=([01689bdiloqDIOPQ]{32}).*$/
/** Image source URI */
const srcRegex = /^.+\/ddr\/ddrworld\/images\/playdata\/(.+)\.png$/

const difficultyMap = new Map<string, UserScoreRecord['difficulty']>([
  ['beginner', 0],
  ['basic', 1],
  ['difficult', 2],
  ['expert', 3],
  ['challenge', 4],
])

const danceLevelMap = new Map<string, DanceLevel>([
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

const clearLampMap = new Map<string, ClearLamp>([
  ['cl_marv', 7],
  ['cl_perf', 6],
  ['cl_great', 5],
  ['cl_good', 4],
  ['cl_li4clear', 3],
  ['cl_clear', 2],
  ['cl_asclear', 1],
  ['cl_none', 0],
])

const flareRankMap = new Map<string, FlareRank>([
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
      const difficulty = difficultyMap.get(chart.id.toLowerCase())
      if (difficulty === undefined) throw new Error('invalid html')

      // Normal Score
      const score = scoreRecordSchema.shape.score.safeParse(
        getInteger(chart, 'data_score')
      )
      if (!score.success) continue // NO PLAY or No chart

      // Dance Level
      const rank = danceLevelMap.get(getImgFileName(chart, 'data_rank'))!

      // Clear Lamp
      const clearLamp = clearLampMap.get(
        getImgFileName(chart, 'data_clearkind')
      )!

      // Flare Skill
      const flareSkill = getInteger(chart, 'data_flareskill')

      // Flare Rank
      const flareRank = flareRankMap.get(
        getImgFileName(chart, 'data_flarerank')
      )!

      result.push({
        songId,
        songName,
        playStyle,
        difficulty,
        score: score.data,
        rank,
        clearLamp,
        ...(flareSkill !== undefined ? { flareSkill } : {}),
        flareRank,
      })
    }
  }
  return result

  /** Detect PlayStyle from element. */
  function getPlayStyle(table: HTMLElement): UserScoreRecord['playStyle'] {
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
