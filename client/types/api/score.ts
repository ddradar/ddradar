/**
 * Object type returned by `/api/v1/scores/{:songId}/{:playStyle}/{:difficulty}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/getChartScore/README.md
 */
export type UserScore = {
  userId: string
  userName: string
  /** Song id that depend on official site. ^([01689bdiloqDIOPQ]*){32}$ */
  songId: string
  songName: string
  playStyle: 1 | 2
  difficulty: 0 | 1 | 2 | 3 | 4
  /** Normal score */
  score: number
  exScore?: number
  maxCombo?: number
  /** 0: Failed, 1: Assisted Clear 2: Clear, 3: LIFE4, 4: Good FC (Full Combo), 5: Great FC, 6: PFC, 7: MFC */
  clearLamp: ClearLamp
  /** Clear rank (E-AAA) */
  rank: string
}

/** 0: Failed, 1: Assisted Clear 2: Clear, 3: LIFE4, 4: Good FC (Full Combo), 5: Great FC, 6: PFC, 7: MFC */
export type ClearLamp = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

/**
 * Request body to `/api/v1/scores/{:songId}/{:playStyle}/{:difficulty}`
 * @see https://github.com/ddradar/ddradar/blob/master/api/postChartScore/README.md
 */
export type Score = Pick<
  UserScore,
  'score' | 'exScore' | 'maxCombo' | 'clearLamp' | 'rank'
>

export function getDanceLevel(score: number) {
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
  ] as const
  for (const { border, rank } of rankList) {
    if (score >= border) return rank
  }
  return 'D'
}
