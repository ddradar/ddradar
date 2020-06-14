import { Song } from './song'

export type StepChart = {
  songId: string
  playStyle: PlayStyle
  difficulty: Difficulty
  level: Level
  /** Step Note's count (Jump = 1 count). */
  notes: number
  /** Freeze Arrow's count. */
  freezeArrow: number
  /** Shock Arrow's count. */
  shockArrow: number
  /** Groove Radar STREAM */
  stream: number
  /** Groove Radar VOLTAGE */
  voltage: number
  /** Groove Radar AIR */
  air: number
  /** Groove Radar FREEZE */
  freeze: number
  /** Groove Radar CHAOS */
  chaos: number
}

export type Cource = Pick<Song, 'id' | 'name'> &
  Pick<StepChart, 'playStyle' | 'difficulty' | 'level'> & {
    charts: StepChart[]
  }

/** SINGLE:1, DOUBLE:4 */
type PlayStyle = 1 | 2

/** BEGINNER:0, BASIC:1, ..., CHALLENGE:4 */
type Difficulty = 0 | 1 | 2 | 3 | 4

type Level =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
