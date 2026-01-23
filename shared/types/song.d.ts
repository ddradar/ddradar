import type { songs } from '@nuxthub/db/schema'

import type { songSchema } from '#shared/schemas/song'
import type { stepChartSchema } from '#shared/schemas/step-chart'

/** Song info */
export type SongInfo = ZodInfer<typeof songSchema> &
  Readonly<Omit<typeof songs.$inferSelect, keyof typeof songs.$inferInsert>> & {
    charts: StepChart[]
  }
export type SongSearchResult = Omit<SongInfo, 'charts'> & {
  charts?: Pick<StepChart, 'playStyle' | 'difficulty' | 'level'>[]
}
export type SongBody = ZodInfer<typeof songSchema> & { charts: StepChart[] }

export type { SeriesCategory, SeriesFolder } from '#shared/schemas/song'

/** Groove Radar data */
export type GrooveRadar = {
  stream: number
  voltage: number
  air: number
  freeze: number
  chaos: number
}
export type StepChart = ZodInfer<typeof stepChartSchema>
