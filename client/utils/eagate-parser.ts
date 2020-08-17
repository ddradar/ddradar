import { getDanceLevel, UserScore } from '~/api/score'

type ChartScore = Omit<UserScore, 'userId' | 'userName'>

/**
 * Convert music data to { songId: Score[] } Record.
 * - https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_data_single.html
 * - https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_data_double.html
 */
export function musicDataToScoreList(
  sourceCode: string
): Record<string, ChartScore[]> {
  const doc = new DOMParser().parseFromString(sourceCode, 'text/html')
  const dataTable = doc.getElementById('data_tbl')
  if (!dataTable) throw new Error('invalid html')

  // Get PlayStyle from columns count
  const headerColumns =
    dataTable
      .getElementsByClassName('column')[0]
      ?.getElementsByClassName('rank')?.length ?? 0
  if (headerColumns !== 4 && headerColumns !== 5)
    throw new Error('invalid html')
  const playStyle = headerColumns === 5 ? 1 : 2

  const result: Record<string, ChartScore[]> = {}

  const songs = dataTable.getElementsByClassName('data')
  for (let i = 0; i < songs.length; i++) {
    const songRow = songs[i]

    // Get songName & songId from first column
    const songCol = songRow
      .getElementsByTagName('td')[0]
      .getElementsByClassName('music_info')[0]
    const songId = songCol
      .getAttribute('href')
      ?.replace(
        /^\/game\/ddr\/ddra20\/p\/playdata\/music_detail.html\?index=([01689bdiloqDIOPQ]{32})$/,
        '$1'
      )
    const songName = songCol.textContent?.trim()
    if (!songId || !songName) continue

    result[songId] = []

    const charts = songRow.getElementsByClassName('rank')
    for (let j = 0; j < charts.length; j++) {
      const chart = charts[j]

      // Get difficulty
      const difficulty = getDifficulty(chart.id.toLowerCase())

      // Get score
      const scoreText =
        chart.getElementsByClassName('data_score')[0].textContent ?? ''
      const score = parseInt(scoreText, 10)
      if (!Number.isInteger(score) || score < 0 || score > 1000000) continue

      // Get clearLamp
      const fcImageUrl = chart
        .getElementsByClassName('music_info')[0]
        .getElementsByTagName('img')[1]
        .src.toLowerCase()
      const rankImageUrl = chart
        .getElementsByClassName('music_info')[0]
        .getElementsByTagName('img')[0]
        .src.toLowerCase()
      const isFailed = /^.+\/rank_s_e\.png$/.test(rankImageUrl)
      const clearLamp =
        getClearLamp(fcImageUrl) ?? (isFailed ? 0 : score === 0 ? 1 : 2)

      // Get rank
      const rank = isFailed ? 'E' : getDanceLevel(score)

      result[songId].push({
        songId,
        songName,
        playStyle,
        difficulty,
        score,
        clearLamp,
        rank,
      })
    }
  }
  return result

  /** Get chart difficulty from element id */
  function getDifficulty(elementId: string) {
    if (elementId === 'beginner') return 0
    if (elementId === 'basic') return 1
    if (elementId === 'difficult') return 2
    if (elementId === 'expert') return 3
    if (elementId === 'challenge') return 4
    throw new Error('invalid html')
  }

  /** Get ClearLamp from full combo image URL */
  function getClearLamp(imageUrl: string) {
    // https://p.eagate.573.jp/game/ddr/ddra20/p/images/play_data/full_mar.png
    if (/^.+\/full_mar\.png$/.test(imageUrl)) return 7
    // https://p.eagate.573.jp/game/ddr/ddra20/p/images/play_data/full_perfect.png
    if (/^.+\/full_perfect\.png$/.test(imageUrl)) return 6
    // https://p.eagate.573.jp/game/ddr/ddra20/p/images/play_data/full_great.png
    if (/^.+\/full_great\.png$/.test(imageUrl)) return 5
    // https://p.eagate.573.jp/game/ddr/ddra20/p/images/play_data/full_good.png
    if (/^.+\/full_good\.png$/.test(imageUrl)) return 4
    // https://p.eagate.573.jp/game/ddr/ddra20/p/images/play_data/full_none.png
    return null
  }
}
