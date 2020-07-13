import { load } from 'cheerio'

import { ScoreSchema } from './db/scores'
import { getDanceLevel } from './score'

type ChartScore = Omit<ScoreSchema, 'id' | 'userId' | 'userName' | 'isPublic'>

/**
 * Convert music data to Score array.
 * - https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_data_single.html
 * - https://p.eagate.573.jp/game/ddr/ddra20/p/playdata/music_data_double.html
 */
export function musicDataToScoreList(sourceCode: string): ChartScore[] {
  const $ = load(sourceCode)
  const dataTable = $('#data_tbl')

  // Get PlayStyle from columns count
  const headerColumns = dataTable.find('.column').find('.rank').length
  if (headerColumns !== 4 && headerColumns !== 5)
    throw new Error('invalid html')
  const playStyle = headerColumns === 5 ? 1 : 2

  const result: ChartScore[] = []
  dataTable.find('.data').map((_, songRow) => {
    const songCol = $(songRow).children('td').first().children('.music_info')
    const songId = songCol
      .attr()
      .href.replace(
        /^\/game\/ddr\/ddra20\/p\/playdata\/music_detail.html\?index=([01689bdiloqDIOPQ]{32})$/,
        '$1'
      )
    const songName = songCol.text().trim()

    $(songRow)
      .children('.rank')
      .map((_, chart) => {
        // Get difficulty
        const id = $(chart).attr().id?.toLowerCase()
        const difficulty = getDifficulty(id)

        // Get score
        const scoreText = $(chart).children('.data_score').text()
        const score = parseInt(scoreText, 10)
        if (!Number.isInteger(score) || score < 0 || score > 1000000) return

        // Get clearLamp
        const fcImageUrl = $(chart)
          .find('.music_info')
          .children('img')[1]
          .attribs['src'].toLowerCase()
        const rankImageUrl = $(chart)
          .find('.music_info')
          .children('img')[0]
          .attribs['src'].toLowerCase()
        const isFailed = /^.+\/rank_s_e\.png$/.test(rankImageUrl)
        const clearLamp = isFailed
          ? 0
          : score === 0
          ? 1
          : getClearLamp(fcImageUrl)

        // Get rank
        const rank = isFailed ? 'E' : getDanceLevel(score)

        result.push({
          songId,
          songName,
          playStyle,
          difficulty,
          score,
          clearLamp,
          rank,
        })
      })
  })
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
    return 2
  }
}
