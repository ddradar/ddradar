import { type CheerioAPI, load } from 'cheerio'

import { ClearLamp, FlareRank } from '#shared/schemas/score'
import { Chart, Difficulty } from '#shared/schemas/step-chart'
import { getNumberContent, getTextContent } from '#shared/scrapes/utils'

/** Music Detail page URI */
const idRegex = /^.+\/ddr\/ddrworld\/.+(img|index)=([01689bdiloqDIOPQ]{32}).*$/
/** Image source URI */
const srcRegex = /^.+\/ddr\/ddrworld\/images\/playdata\/(.+)\.png$/

// #region Constants for parsePlayDataList()
/** Element id - Difficulty mapping */
const classDifficultyMap = new Map([
  ['BEGINNER', Difficulty.BEGINNER],
  ['BASIC', Difficulty.BASIC],
  ['DIFFICULT', Difficulty.DIFFICULT],
  ['EXPERT', Difficulty.EXPERT],
  ['CHALLENGE', Difficulty.CHALLENGE],
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
 * @param source HTML source of PLAY DATA page.
 * - https://p.eagate.573.jp/game/ddr/ddrworld/playdata/music_data_single.html
 * - https://p.eagate.573.jp/game/ddr/ddrworld/playdata/music_data_double.html
 */
export function parsePlayDataList(source: string): EAGateScoreRecord[] {
  const $ = load(source)
  const musicList = $('#music_list').first()
  if (musicList.length === 0) throw new Error('invalid html')

  const result: ReturnType<typeof parsePlayDataList> = []

  const songs = musicList.find('.music-card').toArray()
  for (const song of songs) {
    const songEl = $(song)
    const { id: songId, name } = getSongInfo(songEl)
    if (!songId || !name) continue

    const charts = songEl.find('.playdata > .rank').toArray()
    if (charts.length !== 5) throw new Error('invalid html')

    const firstDifficulty = getDifficulty($(charts[0]))
    const playStyle = getPlayStyle(firstDifficulty)

    for (const [index, chart] of charts.entries()) {
      const chartEl = $(chart)

      const difficulty = getDifficulty(chartEl)
      if (difficulty === undefined) {
        if (playStyle === 2 && index === 0) continue
        throw new Error('invalid html')
      }

      // Normal Score
      const normalScore = getNumberContent(
        $,
        chartEl.find('.data_score').first(),
        NaN
      )
      if (isNaN(normalScore)) continue // NO PLAY or No chart

      // Dance Level
      const rankImage = getImgFileName(chartEl, '.data_rank')
      if (rankImage === 'rank_s_none' || rankImage === 'rank_s_nodisp') continue

      const rank = fileDanceLevelMap.get(rankImage)
      if (rank === undefined) continue

      // Clear Lamp
      const clearLamp = fileClearLampMap.get(
        getImgFileName(chartEl, '.data_clearkind')
      )!

      // Flare Skill
      const flareSkill = getNumberContent(
        $,
        chartEl.find('.data_flareskill').first(),
        NaN
      )

      // Flare Rank
      const flareRank = fileFlareRankMap.get(
        getImgFileName(chartEl, '.data_flarerank')
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

  /** Detect PlayStyle from first difficulty. */
  function getPlayStyle(
    firstDifficulty: StepChart['difficulty'] | undefined
  ): StepChart['playStyle'] {
    if (firstDifficulty === Difficulty.BEGINNER) return 1
    if (firstDifficulty === undefined) return 2
    throw new Error('invalid html')
  }

  function getSongInfo(
    card: ReturnType<CheerioAPI>
  ): Partial<Pick<SongInfo, 'id' | 'name'>> {
    const songInfo = card.find('.chart .music_info').first()
    const id = songInfo.attr('href')?.replace(idRegex, '$2')
    const name = getTextContent($, songInfo.find('.music-name').first().get(0))
    return { id, name }
  }

  function getDifficulty(
    chart: ReturnType<CheerioAPI>
  ): StepChart['difficulty'] | undefined {
    const classNames = new Set(
      (chart.attr('class') ?? '')
        .split(/\s+/)
        .map(className => className.toUpperCase())
        .filter(Boolean)
    )
    for (const className of classNames) {
      const difficulty = classDifficultyMap.get(className)
      if (difficulty !== undefined) return difficulty
    }
    return undefined
  }

  /** Get image file name (without extension) from cell by class name. */
  function getImgFileName(cell: ReturnType<CheerioAPI>, selector: string) {
    return (
      cell.find(selector).first().find('img').first().attr('src') ?? ''
    ).replace(srcRegex, '$1')
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
 * @param source HTML source of MUSIC DETAIL page.
 * - https://p.eagate.573.jp/game/ddr/ddrworld/playdata/music_detail.html
 */
export function parseScoreDetail(
  source: string
): EAGateScoreRecord & { rivalScores: RivalScore[] } {
  const $ = load(source)
  const musicInfo = $('#music_info').first()
  const songId = musicInfo
    .find('tr')
    .first()
    .find('td')
    .eq(0)
    .find('img')
    .first()
    .attr('src')
    ?.replace(idRegex, '$2')
  if (!songId) throw new Error('invalid html')
  const name = (musicInfo.find('tr').first().find('td').eq(1).html() ?? '')
    .replace(/^(.+)<br.+/ms, '$1')
    .trim()

  const table = $('#music_detail_table').first()
  if (table.length === 0) {
    throw new Error(
      getTextContent($, $('#popup_cnt').first().get(0)) || 'invalid html'
    )
  }

  // Get PlayStyle and Difficulty from Logo
  const logo = $('#diff_logo')
    .first()
    .find('img')
    .first()
    .attr('src')
    ?.replace(srcRegex, '$1')
  const chartMeta = fileDifficultyMap.get(logo ?? '')
  if (!chartMeta) throw new Error('invalid html')
  const [playStyle, difficulty] = chartMeta

  const rank = getTextContent($, getCell(1, 0).get(0)) as ScoreRecord['rank']
  const flareSkill = getNumberContent($, getCell(3, 0).get(0), NaN)

  const rivalScores: RivalScore[] = []
  // Add Top Score
  const topScoreElement = table.find('top_score_disp').first()
  const topScorePlayer = topScoreElement
    .contents()
    .toArray()
    .map(node => getTextContent($, node))
    .find(text => text !== '' && text.includes('/'))
  const normalScore = getNumberContent(
    $,
    topScoreElement.find('span').first().get(0),
    NaN
  )
  if (topScorePlayer && !isNaN(normalScore)) {
    rivalScores.push({ name: topScorePlayer, normalScore })
  }

  // Add Rival Scores
  const rivalDetailRow = $('#rival_detail_table')
    .first()
    .find('.rival')
    .toArray()
  for (const row of rivalDetailRow) {
    const rowEl = $(row)
    const name = getTextContent($, rowEl.find('th').first().get(0))
    const normalScore = getNumberContent($, rowEl.find('td').eq(0).get(0), 0)
    if (!name || !normalScore) continue

    const rank = getTextContent($, rowEl.find('td').eq(1).get(0)) as
      | ScoreRecord['rank']
      | ''
    const flareRank =
      textFlareRankMap.get(getTextContent($, rowEl.find('td').eq(2).get(0))) ??
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
    normalScore: getNumberContent($, getCell(1, 1).get(0), 0),
    maxCombo: getNumberContent($, getCell(5, 0).get(0), 0),
    clearLamp:
      getClearLamp() ?? (rank === 'E' ? ClearLamp.Failed : ClearLamp.Assisted),
    rank,
    flareRank:
      textFlareRankMap.get(getTextContent($, getCell(2, 0).get(0))) ??
      FlareRank.None,
    flareSkill: Number.isInteger(flareSkill) ? flareSkill : null,
    rivalScores,
  }

  /** Get cell element by row and column index. */
  function getCell(row: number, col: number): ReturnType<CheerioAPI> {
    return table.find('tr').eq(row).find('td').eq(col)
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
        $,
        $(`#${id}`).first().find('td').first().get(0),
        0
      )
      if (count > 0) return clearLamp
    }
    // Check Clear count (Assisted Clear is not counted on here)
    const clearCount = getNumberContent(
      $,
      table.find('tr').eq(4).find('td').eq(1).get(0),
      0
    )
    if (clearCount > 0) return ClearLamp.Clear

    // Assisted Clear or Failed
    return undefined
  }
}
