import { describe, expect, test } from 'vitest'

import {
  Chart,
  chartEquals,
  Difficulty,
  getChartName,
  PlayStyle,
  type StepChart,
  stepChartSchema,
} from '~~/shared/types/step-chart'
import { notValidObject } from '~~/test/data/schema'

describe('/shared/types/step-chart', () => {
  describe('stepChartSchema', () => {
    const validStepChart: StepChart = {
      playStyle: PlayStyle.SINGLE,
      difficulty: Difficulty.BASIC,
      bpm: [150],
      level: 10,
    }
    test.each([
      ...notValidObject,
      { ...validStepChart, playStyle: 0 },
      { ...validStepChart, difficulty: -1 },
      { ...validStepChart, difficulty: 5 },
      { ...validStepChart, level: 2.3 },
      { ...validStepChart, level: 21 },
      { ...validStepChart, bpm: [] },
      { ...validStepChart, bpm: [100, 400] },
      { ...validStepChart, notes: -1 },
      { ...validStepChart, freezes: -1 },
      { ...validStepChart, shocks: -1 },
      { ...validStepChart, radar: { stream: 10 } },
      {
        ...validStepChart,
        radar: { stream: -1, voltage: 0, air: 0, freeze: 0, chaos: 0 },
      },
    ])('safeParse(%o) returns { success: false }', o =>
      expect(stepChartSchema.safeParse(o).success).toBe(false)
    )
    test.each([
      validStepChart,
      { ...validStepChart, playStyle: PlayStyle.DOUBLE },
      { ...validStepChart, difficulty: Difficulty.DIFFICULT },
      { ...validStepChart, bpm: [100, 200, 400] },
      { ...validStepChart, level: 19 },
      { ...validStepChart, notes: 300, freezes: 50, shocks: 10 },
      {
        ...validStepChart,
        radar: { stream: 5, voltage: 7, air: 3, freeze: 4, chaos: 2 },
      },
    ])('safeParse(%o) returns { success: true }', o =>
      expect(stepChartSchema.safeParse(o).success).toBe(true)
    )
  })

  describe('getChartName', () => {
    test.each([
      [...Chart.bSP, 'SINGLE/BEGINNER'],
      [...Chart.BSP, 'SINGLE/BASIC'],
      [...Chart.DSP, 'SINGLE/DIFFICULT'],
      [...Chart.ESP, 'SINGLE/EXPERT'],
      [...Chart.CSP, 'SINGLE/CHALLENGE'],
      [...Chart.BDP, 'DOUBLE/BASIC'],
      [...Chart.DDP, 'DOUBLE/DIFFICULT'],
      [...Chart.EDP, 'DOUBLE/EXPERT'],
      [...Chart.CDP, 'DOUBLE/CHALLENGE'],
      [
        3 as ValueOf<typeof PlayStyle>,
        5 as ValueOf<typeof Difficulty>,
        'UNKNOWN/UNKNOWN',
      ],
    ])('(%i, %i) returns "%s"', (playStyle, difficulty, expected) =>
      expect(getChartName({ playStyle, difficulty })).toBe(expected)
    )
  })

  describe('chartEquals', () => {
    test.each([
      [
        { playStyle: PlayStyle.SINGLE, difficulty: Difficulty.BEGINNER },
        { playStyle: PlayStyle.SINGLE, difficulty: Difficulty.BEGINNER },
        true,
      ],
      [
        { playStyle: PlayStyle.SINGLE, difficulty: Difficulty.BEGINNER },
        { playStyle: PlayStyle.SINGLE, difficulty: Difficulty.BASIC },
        false,
      ],
      [
        { playStyle: PlayStyle.SINGLE, difficulty: Difficulty.BASIC },
        { playStyle: PlayStyle.DOUBLE, difficulty: Difficulty.BASIC },
        false,
      ],
    ])('(%o, %o) returns %o', (left, right, expected) =>
      expect(chartEquals(left, right)).toBe(expected)
    )
  })
})
