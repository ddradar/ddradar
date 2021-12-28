const i18n = {
  ja: {
    noEagate:
      'DDR A20PLUS\u306E\u697D\u66F2\u30C7\u30FC\u30BF\u4E00\u89A7\u30DA\u30FC\u30B8\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002',
    userId: 'DDRadar\u306E\u30E6\u30FC\u30B6\u30FCID\u3092\u5165\u529B',
    password:
      '\u30A4\u30F3\u30DD\u30FC\u30C8\u7528\u306B\u8A2D\u5B9A\u3057\u305F\u30D1\u30B9\u30EF\u30FC\u30C9\u3092\u5165\u529B',
    finished:
      '\u30A4\u30F3\u30DD\u30FC\u30C8\u304C\u5B8C\u4E86\u3057\u307E\u3057\u305F\u3002',
  },
  en: {
    noEagate: 'This is not DDR A20PLUS music detail page.',
    userId: 'DDRadar ID:',
    password: 'Password for import',
    finished: 'Import is complete.',
  },
}

export default function (apiBaseUri, lang) {
  const idRegex = /^.+\/ddr\/ddra20\/p.+=([01689bdiloqDIOPQ]{32}).*$/
  const srcRegex = /^.+\/ddr\/ddra20\/p\/images\/play_data\/(.+)\.png$/
  const playStyleRegex =
    /^https:\/\/p\.eagate\.573\.jp\/game\/ddr\/ddra20\/p\/playdata\/(music|nonstop|grade)_data_(double|single)\.html.*/

  const result = {}
  try {
    if (!playStyleRegex.test(document.location.href))
      throw new Error('not KONAMI e-amusement site')

    const playStyle =
      playStyleRegex.exec(document.location.href)[2] === 'single' ? 1 : 2
    const dataTable = document.getElementById('data_tbl')
    if (!dataTable) throw new Error('invalid html')

    const songs = dataTable.getElementsByClassName('data')
    for (let i = 0; i < songs.length; i++) {
      const songRow = songs[i]

      // Get songName & songId from first column
      const songCol = songRow
        .getElementsByTagName('td')[0]
        .getElementsByClassName('music_info')[0]
      const jacketAlt = songCol.getElementsByTagName('img')[0]?.alt // for NONSTOP or GRADE
      const songId = songCol.getAttribute('href')?.replace(idRegex, '$1')
      const songName = songCol.textContent.trim() || jacketAlt
      if (!songId || !songName) continue

      result[songId] = []

      const charts = songRow.getElementsByClassName('rank')
      for (let j = 0; j < charts.length; j++) {
        const chart = charts[j]

        // Get difficulty
        const difficulty = getDifficulty(chart.id.toLowerCase())

        // Get score
        const scoreText =
          chart.getElementsByClassName('data_score')[0].textContent
        const score = parseInt(scoreText, 10)
        if (!Number.isInteger(score) || score < 0 || score > 1000000) continue

        // Get clearLamp
        const fcImageUrl = chart
          .getElementsByClassName('music_info')[0]
          .getElementsByTagName('img')[1]
          .src.toLowerCase()
        const rankImageFileName = chart
          .getElementsByClassName('music_info')[0]
          .getElementsByTagName('img')[0]
          .src.replace(srcRegex, '$1')
        if (rankImageFileName === 'rank_s_none') continue
        const isFailed = rankImageFileName === 'rank_s_e'
        const clearLamp =
          getClearLamp(fcImageUrl) || (isFailed ? 0 : score === 0 ? 1 : 2)

        // Get rank
        const rank = isFailed ? 'E' : getDanceLevel(score)

        result[songId].push({
          songName,
          playStyle,
          difficulty,
          score,
          clearLamp,
          rank,
        })
      }
    }
  } catch (e) {
    alert(i18n[lang].noEagate)
    return
  }

  const userId = prompt(i18n[lang].userId)
  if (!userId) return
  const password = prompt(i18n[lang].password)
  if (!password) return

  Promise.all(
    Object.entries(result).map(([songId, scores]) =>
      fetch(`${apiBaseUri}/${songId}/${userId}`, {
        method: 'post',
        body: JSON.stringify({ password, scores }),
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
      })
        .then(() => {
          const div = document.createElement('div')
          div.setAttribute('class', 'ddradar_added')
          div.textContent = `Finished: ${scores[0].songName}`
          document.getElementById('container').prepend(div)
        })
        .catch(e => {
          const div = document.createElement('div')
          div.setAttribute('class', 'ddradar_added')
          div.setAttribute('style', 'color:red;font-weight:bold;')
          div.textContent = `Failed: ${scores[0].songName} (${e})`
          document.getElementById('container').prepend(div)
        })
    )
  ).then(() => {
    alert(i18n[lang].finished)
    $('.ddradar_added').remove()
  })

  /**
   * Get chart difficulty from element id
   * @param elementId {string}
   */
  function getDifficulty(elementId) {
    if (elementId === 'beginner') return 0
    if (elementId === 'basic') return 1
    if (elementId === 'difficult') return 2
    if (elementId === 'expert') return 3
    if (elementId === 'challenge') return 4
    throw new Error('invalid html')
  }

  /**
   * Get ClearLamp from full combo image URL
   * @param imageUrl {string}
   */
  function getClearLamp(imageUrl) {
    const fileName = imageUrl.replace(srcRegex, '$1')
    if (fileName === 'full_mar') return 7
    if (fileName === 'full_perfect') return 6
    if (fileName === 'full_great') return 5
    if (fileName === 'full_good') return 4
    return null
  }

  /**
   * Get Dance Level from score
   * @param score {number}
   * @returns Dance Level (AAA~D)
   */
  function getDanceLevel(score) {
    const rankList = [
      { border: 990000, rank: 'AAA' },
      { border: 950000, rank: 'AA+' },
      { border: 900000, rank: 'AA' },
      { border: 890000, rank: 'AA-' },
      { border: 850000, rank: 'A+' },
      { border: 800000, rank: 'A' },
      { border: 790000, rank: 'A-' },
      { border: 750000, rank: 'B+' },
      { border: 700000, rank: 'B' },
      { border: 690000, rank: 'B-' },
      { border: 650000, rank: 'C+' },
      { border: 600000, rank: 'C' },
      { border: 590000, rank: 'C-' },
      { border: 550000, rank: 'D+' },
    ]
    for (const { border, rank } of rankList) {
      if (score >= border) return rank
    }
    return 'D'
  }
}
