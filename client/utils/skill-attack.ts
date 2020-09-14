import { getDanceLevel, UserScore } from '~/api/score'

type MusicScore = Omit<UserScore, 'songId' | 'userId' | 'userName' | 'level'>

/** Read shift-jis encoded text file asynchronously */
export function readTextAsync(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file, 'shift-jis')
  })
}

/**
 * Convert Skill Attack score list to ScoreList
 * - http://skillattack.com/sa4/data/dancer/{ddrCode}/score_{ddrCode}.txt
 */
export function scoreTexttoScoreList(text: string) {
  const rows = text.trim().split('\n')
  const result: Record<string, MusicScore[]> = {}
  rows.forEach(r => {
    /**
     * - [0]: skillAttackId
     * - [1]: 0:SP, 1:DP
     * - [2]: 0:BEGINNER, 1:BASIC, ..., 4:CHALLENGE
     * - [3]: DDR CODE
     * - [4]: UNIX Time
     * - [5]: score
     * - [6]: 0:Played(Failed,Assisted,Clear), 1:FC(include GreatFC), 2:PFC, 3:MFC
     * - [7]: Song Name (HTML escaped)
     * - [8]: blank
     */
    const cols = r.split('\t')
    if (cols.length < 8) return

    const skillAttackId = cols[0]
    const playStyle = (parseInt(cols[1], 10) + 1) as 1 | 2
    const difficulty = parseInt(cols[2], 10) as 0 | 1 | 2 | 3 | 4
    const score = parseInt(cols[5], 10)
    const clearLamp =
      cols[6] === '3' ? 7 : cols[6] === '2' ? 6 : cols[6] === '1' ? 4 : 2
    const songName = unescapeHTML(cols[7])!

    if (result[skillAttackId] === undefined) result[skillAttackId] = []

    const scores = result[skillAttackId]
    const oldScore = scores.find(
      s => s.playStyle === playStyle && s.difficulty === difficulty
    )
    if (oldScore === undefined) {
      scores.push({
        songName,
        playStyle,
        difficulty,
        clearLamp,
        score,
        rank: getDanceLevel(score),
      })
    } else {
      oldScore.clearLamp = clearLamp
      oldScore.score = score
      oldScore.rank = getDanceLevel(score)
    }
  })
  return result

  function unescapeHTML(escaped: string) {
    const doc = new DOMParser().parseFromString(escaped, 'text/html')
    return doc.documentElement.textContent
  }
}
