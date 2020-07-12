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
        const difficulty =
          id === 'beginner'
            ? 0
            : id === 'basic'
            ? 1
            : id === 'difficult'
            ? 2
            : id === 'expert'
            ? 3
            : id === 'challenge'
            ? 4
            : 5
        if (difficulty === 5) throw new Error('invalid html')

        // Get score
        const scoreText = $(chart).children('.data_score').text()
        const score = parseInt(scoreText)
        if (!Number.isInteger(score) || score < 0 || score > 1000000) return

        // Get clearLamp
        const fcImageUrl = $(chart)
          .find('.music_info')
          .children('img')[1]
          .attribs['src'].toLowerCase()
        const isFailed = /^.+\/rank_s_e\.png$/.test(
          $(chart)
            .find('.music_info')
            .children('img')[0]
            .attribs['src'].toLowerCase()
        )
        const clearLamp = /^.+\/full_mar\.png$/.test(fcImageUrl)
          ? 7
          : /^.+\/full_perfect\.png$/.test(fcImageUrl)
          ? 6
          : /^.+\/full_great\.png$/.test(fcImageUrl)
          ? 5
          : /^.+\/full_good\.png$/.test(fcImageUrl)
          ? 4
          : isFailed
          ? 0
          : score === 0
          ? 1
          : 2

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
}
