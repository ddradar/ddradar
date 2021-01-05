/* eslint-disable no-undef */
;(function ($, location) {
  const idRegex = /^.+\/ddr\/ddra20\/p.+=([01689bdiloqDIOPQ]{32}).*$/
  const srcRegex = /^.+\/ddr\/ddra20\/p\/images\/play_data\/(.+)\.png$/
  const playStyleRegex = /^.+\/ddr\/ddra20\/p.+_data_(double|single)\.html.*/
  const apiBaseUri = 'https://api.ddradar.app/api/v1/scores'
  const errorMessage = 'This is not DDR A20PLUS music detail page.'

  if (!$) {
    alert(errorMessage)
    return
  }

  const dt = $('#data_tbl')
  if (!dt || !dt.length) {
    alert(errorMessage)
    return
  }

  const playStyle = location.href.replace(playStyleRegex, '$1')
  if (!playStyle) {
    alert(errorMessage)
    return
  }

  const result = {}

  $('.data', dt).each(function () {
    // Get songName & songId from first column
    const songId = $('td:first > .music_info:first', this)
      .attr('href')
      .replace(idRegex, '$1')
    const songName = $('td:first > .music_info:first', this).text()

    result[songId] = []

    $('.rank', this).each(function () {
      // Get difficulty
      const id = $(this).attr('id')
      const difficulty =
        id === 'beginner'
          ? 0
          : id === 'basic'
          ? 1
          : id === 'difficult'
          ? 2
          : id === 'expert'
          ? 3
          : 4

      // Get score
      const scoreText = $('.data_score:first', this).text().trim()
      const score = parseInt(scoreText, 10)
      if (!Number.isInteger(score)) return

      // Get clearLamp
      const fileName = $('.music_info:first > img:eq(1)', this)
        .attr('src')
        .replace(srcRegex, '$1')
      const rankImageFileName = $('.music_info:first > img:first', this)
        .attr('src')
        .replace(srcRegex, '$1')
      const isFailed = rankImageFileName === 'rank_s_e'
      const clearLamp =
        fileName === 'full_mar'
          ? 7
          : fileName === 'full_perfect'
          ? 6
          : fileName === 'full_great'
          ? 5
          : fileName === 'full_good'
          ? 4
          : isFailed
          ? 0
          : score === 0
          ? 1
          : 2

      // Get rank
      const rank = isFailed
        ? 'E'
        : score >= 990000
        ? 'AAA'
        : score >= 950000
        ? 'AA+'
        : score >= 900000
        ? 'AA'
        : score >= 890000
        ? 'AA-'
        : score >= 850000
        ? 'A+'
        : score >= 800000
        ? 'A'
        : score >= 790000
        ? 'A-'
        : score >= 750000
        ? 'B+'
        : score >= 700000
        ? 'B'
        : score >= 690000
        ? 'B-'
        : score >= 650000
        ? 'C+'
        : score >= 600000
        ? 'C'
        : score >= 590000
        ? 'C-'
        : score >= 550000
        ? 'D+'
        : 'D'

      result[songId].push({
        playStyle: playStyle === 'single' ? 1 : 2,
        difficulty,
        songName,
        score,
        clearLamp,
        rank,
      })
    })
  })
  const userId = prompt('DDRadar ID:')
  const password = prompt('Password for import')
  if (!password) return

  Promise.all(
    Object.entries(result).map(([songId, scores]) =>
      fetch(`${apiBaseUri}/${songId}/${userId}`, {
        method: 'post',
        body: JSON.stringify({ password, scores }),
        headers: { 'Content-Type': 'application/json' },
      })
        .then(() =>
          $('div#container').prepend(
            `<div class="ddradar_added">Finished: ${scores[0].songName}</div>`
          )
        )
        .catch(e =>
          $('div#container').prepend(
            `<div class="ddradar_added" style="color:red;font-weight:bold;">Error!: ${scores[0].songName} (${e})</div>`
          )
        )
    )
  ).then(() => {
    alert('インポートが完了しました。')
    $('.ddradar_added').remove()
  })
})($, location)
