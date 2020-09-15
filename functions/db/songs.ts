import { getContainer } from '.'

/** DB Schema of "Song" */
export type SongSchema = {
  /**
   * Song id that depend on official site.
   * @example `^([01689bdiloqDIOPQ]*){32}$`
   */
  id: string
  name: string
  /**
   * Song furigana for sorting.
   * @example `^([A-Z0-9 .ぁ-んー]*)$`
   */
  nameKana: string
  /**
   * Index for sorting. Associated with the "Choose by Name" folder.
   * @example `0`: あ行, `1`: か行, ..., `10`: A, `11`: B, ..., `35`: Z, `36`: 数字・記号
   */
  nameIndex: number
  artist: string
  /** Series title depend on official site. */
  series: string
  /**
   * Displayed min BPM (Beet Per Minutes).
   * Set to `null` if not revealed, such as "???".
   */
  minBPM: number | null
  /**
   * Displayed max BPM (Beet Per Minutes).
   * Set to `null` if not revealed, such as "???".
   */
  maxBPM: number | null
  skillAttackId?: number
  charts: StepChartSchema[]
}

/** Song's step chart */
export type StepChartSchema = {
  /** `1`: SINGLE, `2`: DOUBLE */
  playStyle: 1 | 2
  difficulty: 0 | 1 | 2 | 3 | 4
  level: number
  /** Normal arrow count. (Jump = 1 count) */
  notes: number
  /** Freeze Arrow count. */
  freezeArrow: number
  /** Shock Arrow count. */
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

export async function upsertSong(song: SongSchema): Promise<void> {
  const container = getContainer('Songs')
  await container.items.upsert(song)
}
