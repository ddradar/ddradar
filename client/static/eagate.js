export default function (apiBaseUri) {
  const idRegex = /^.+\/ddr\/ddra20\/p.+=([01689bdiloqDIOPQ]{32}).*$/
  const srcRegex = /^.+\/ddr\/ddra20\/p\/images\/play_data\/(.+)\.png$/
  const playStyleRegex =
    /^https:\/\/p\.eagate\.573\.jp\/game\/ddr\/ddra20\/p\/playdata\/(music|nonstop|grade)_data_(double|single)\.html.*/

  const result = {}
  try {
    if (playStyleRegex.test(document.location.href))
      throw new Error('not KONAMI e-amusement site')

    const playStyle =
      playStyleRegex.exec(document.location.href)[1] === 'single' ? 1 : 2
    const dataTable = document.getElementById('data_tbl')
    if (!dataTable) throw new Error('invalid html')

    const songs = dataTable.getElementsByClassName('data')
    for (let i = 0; i < songs.length; i++) {
      const songRow = songs[i]

      // Get songName & songId from first column
      const songCol = songRow
        .getElementsByTagName('td')[0]
        .getElementsByClassName('music_info')[0]
      const jacketAlt = songCol.getElementsByTagName('img')[0]?.alt // for NONSTOP or 段位認定
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
  } catch {
    alert('DDA A20PLUSの楽曲/NONSTOP/段位認定一覧ページではありません。')
  }

  const userId = prompt('DDRadarのユーザーIDを入力')
  if (!userId) return
  const password = prompt('インポート用に設定したパスワードを入力')
  if (!password) return

  Promise.all(
    Object.entries(result).map(([songId, scores]) =>
      fetch(`${apiBaseUri}/${songId}/${userId}`, {
        method: 'post',
        body: JSON.stringify(scores),
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
      })
        .then(() => {
          const div = document.createElement('div')
          div.setAttribute('class', 'ddradar_added')
          div.textContent = `「${scores[0].songName}」のインポートが完了しました。`
          document.getElementById('container').prepend(div)
        })
        .catch(e => {
          const div = document.createElement('div')
          div.setAttribute('class', 'ddradar_added')
          div.setAttribute('style', 'color:red;font-weight:bold;')
          div.textContent = `「${scores[0].songName}」のインポートに失敗しました。(${e})`
          document.getElementById('container').prepend(div)
        })
    )
  ).then(() => {
    alert('インポートが完了しました。')
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
}
