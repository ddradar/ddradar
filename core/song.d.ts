export type Song = {
  /** ^([01689bdiloqDIOPQ]*){32}$ */
  id: string
  name: string
  /** name furigana ^([A-Z0-9 .ぁ-んー]*)$ */
  nameKana: string
  nameIndex: number
  artist: string
  series: number
  /** Displayed min BPM (Beet Per Minutes). */
  minBPM: number | null
  /** Displayed max BPM (Beet Per Minutes). */
  maxBPM: number | null
}
