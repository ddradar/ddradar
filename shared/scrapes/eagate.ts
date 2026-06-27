import { type CheerioAPI, load } from 'cheerio'

import { ClearLamp, FlareRank } from '#shared/schemas/score'
import { Difficulty } from '#shared/schemas/step-chart'
import { getNumberContent, getTextContent } from '#shared/scrapes/utils'

/** Music Detail page URI */
const idRegex = /^.+\/ddr\/ddrworld\/.+(img|index)=([01689bdiloqDIOPQ]{32}).*$/
/** Image source URI */
const srcRegex = /^.+\/ddr\/ddrworld\/images\/playdata\/(.+)\.png$/

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
  ['rank_aaa', 'AAA'],
  ['rank_aa_p', 'AA+'],
  ['rank_aa', 'AA'],
  ['rank_aa_m', 'AA-'],
  ['rank_a_p', 'A+'],
  ['rank_a', 'A'],
  ['rank_a_m', 'A-'],
  ['rank_b_p', 'B+'],
  ['rank_b', 'B'],
  ['rank_b_m', 'B-'],
  ['rank_c_p', 'C+'],
  ['rank_c', 'C'],
  ['rank_c_m', 'C-'],
  ['rank_d_p', 'D+'],
  ['rank_d', 'D'],
  ['rank_e', 'E'],
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

// #region Constants for parsePlayDataList()
/** Element id - Difficulty mapping */
const classDifficultyMap = new Map([
  ['BEGINNER', Difficulty.BEGINNER],
  ['BASIC', Difficulty.BASIC],
  ['DIFFICULT', Difficulty.DIFFICULT],
  ['EXPERT', Difficulty.EXPERT],
  ['CHALLENGE', Difficulty.CHALLENGE],
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
  const musicDetail = $('.music-detail').first()
  if (musicDetail.length === 0) throw new Error('invalid html')

  const songId = musicDetail
    .find('.music-text .jacket')
    .first()
    .attr('src')
    ?.replace(idRegex, '$2')
  if (!songId) throw new Error('invalid html')

  const name = getTextContent(
    $,
    musicDetail.find('.music-text .music-name').first().get(0)
  )
  if (!name) throw new Error('invalid html')

  const noPlayText = getTextContent(
    $,
    musicDetail.find('.no-play').first().get(0)
  )
  if (noPlayText) throw new Error(noPlayText)

  const selectedDiff = musicDetail
    .find('.style-panel a.select, .style-panel a.selected')
    .first()
  if (selectedDiff.length === 0) {
    const prompt = getTextContent(
      $,
      musicDetail.find('.style-panel p').first().get(0)
    )
    throw new Error(prompt ?? 'invalid html')
  }

  const selectedHref = selectedDiff.attr('href') ?? ''
  const selectedUrl = new URL(selectedHref, 'https://p.eagate.573.jp')
  const selectedStyle = Number(selectedUrl.searchParams.get('style'))
  const selectedDifficulty = Number(
    selectedUrl.searchParams.get('difficulty')
  ) as StepChart['difficulty']
  if (
    !Number.isInteger(selectedStyle) ||
    !Number.isInteger(selectedDifficulty)
  ) {
    throw new Error('invalid html')
  }

  const playData = musicDetail.find('.play-data').first()
  if (playData.length === 0) throw new Error('invalid html')

  const clearLampImage = getDetailImageFileName(playData, '.clearkind')
  const clearLamp = fileClearLampMap.get(clearLampImage)
  if (clearLamp === undefined) throw new Error('invalid html')

  const rankImage = getDetailImageFileName(playData, '.clearrank')
  const rank = fileDanceLevelMap.get(rankImage)
  if (rank === undefined) throw new Error('invalid html')

  const flareRankImage = getDetailImageFileName(playData, '.flarerank')
  const flareRank = fileFlareRankMap.get(flareRankImage)
  if (flareRank === undefined) throw new Error('invalid html')

  const normalScore = getNumberContent(
    $,
    playData.find('.best-score .value').first().get(0),
    NaN
  )
  if (Number.isNaN(normalScore)) throw new Error('invalid html')

  const maxCombo = getNumberContent(
    $,
    playData.find('.maxcombo .value').first().get(0),
    NaN
  )
  if (Number.isNaN(maxCombo)) throw new Error('invalid html')

  const flareSkillText = getTextContent(
    $,
    playData.find('.flareskill .value').first().get(0)
  )
  const flareSkill =
    flareSkillText === '' || flareSkillText === '---'
      ? null
      : Number.parseInt(flareSkillText, 10)
  if (flareSkill !== null && Number.isNaN(flareSkill)) {
    throw new Error('invalid html')
  }

  const rivalScores: RivalScore[] = []
  for (const group of musicDetail.find('.rival-data .rival-group').toArray()) {
    const groupEl = $(group)
    if (groupEl.hasClass('player')) continue

    const header = getTextContent(
      $,
      groupEl.find('.rival-header').first().get(0)
    )
    const valueCells = groupEl.find('.row-ui .count-item .value').toArray()
    if (valueCells.length < 1) continue

    const normalScoreText = getTextContent($, valueCells[0])
    const normalScoreValue = Number.parseInt(normalScoreText, 10)
    if (!Number.isFinite(normalScoreValue) || normalScoreValue === 0) continue

    if (header.startsWith('全国トップ')) {
      const topScoreName = header.split(' / ').slice(1).join(' / ')
      if (topScoreName) {
        rivalScores.push({ name: topScoreName, normalScore: normalScoreValue })
      }
      continue
    }

    const rivalRankText = getTextContent($, valueCells[1])
    const rivalFlareRankText = getTextContent($, valueCells[2])
    rivalScores.push({
      name: header,
      normalScore: normalScoreValue,
      rank:
        rivalRankText === '---'
          ? undefined
          : (rivalRankText as ScoreRecord['rank']),
      flareRank: textFlareRankMap.get(rivalFlareRankText) ?? FlareRank.None,
    })
  }

  return {
    songId,
    name,
    playStyle: (selectedStyle + 1) as StepChart['playStyle'],
    difficulty: selectedDifficulty,
    normalScore,
    maxCombo,
    clearLamp,
    rank,
    flareRank,
    flareSkill,
    rivalScores,
  }

  /** Get image file name (without extension) from a detail cell. */
  function getDetailImageFileName(
    cell: ReturnType<CheerioAPI>,
    selector: string
  ) {
    return (
      cell.find(selector).first().find('img').first().attr('src') ?? ''
    ).replace(srcRegex, '$1')
  }
}
