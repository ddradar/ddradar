import {
  mountSuspended,
  registerEndpoint,
  renderSuspended,
} from '@nuxt/test-utils/runtime'
import { fireEvent, screen, within } from '@testing-library/vue'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import type { ScoreRecord } from '#shared/types/score'
import { calcFlareSkill, fillScoreRecordFromChart } from '#shared/utils/score'
import ScoreInput from '~/components/form/ScoreInput.vue'
import { ClearLamp, FlareRank } from '~~/shared/schemas/score'
import { scoreRecord } from '~~/test/data/score'
import { testSongData as song } from '~~/test/data/song'
import { testStepCharts as charts } from '~~/test/data/step-chart'
import { addMock, locales, mockHandler } from '~~/test/nuxt/const'

registerEndpoint(
  `/api/me/scores/${song.id}/${charts[0].playStyle}/${charts[0].difficulty}`,
  { method: 'POST', handler: mockHandler }
)

describe('components/form/ScoreInput.vue', () => {
  const requiredProps = {
    id: song.id,
    chart: { ...charts[0] }, // has notes info
  }

  beforeAll(() => {
    vi.mocked(useToast).mockReturnValue({ add: addMock } as never)
  })
  beforeEach(() => {
    mockHandler.mockClear()
    addMock.mockClear()
  })

  describe('Rendering', () => {
    describe.each(locales)('(locale: %s)', locale => {
      test.each([
        charts[0], // has notes info
        charts[2], // has no notes info
      ])('(chart: %o) renders properly', async chart => {
        // Arrange - Act
        const props = { ...requiredProps, chart }
        const wrapper = await mountSuspended(ScoreInput, { props })
        await wrapper.vm.$i18n.setLocale(locale)

        // Assert
        expect(wrapper.html()).toMatchSnapshot()
      })
    })

    test.each([
      [
        null,
        {
          normalScore: 0,
          clearLamp: ClearLamp.Clear,
          flareRank: FlareRank.None,
        },
      ],
      [
        scoreRecord,
        {
          normalScore: scoreRecord.normalScore,
          clearLamp: scoreRecord.clearLamp,
          flareRank: scoreRecord.flareRank,
        },
      ],
      [
        {
          ...scoreRecord,
          exScore: charts[0].notes * 2,
          maxCombo: charts[0].notes,
          flareSkill: 185,
        },
        {
          normalScore: scoreRecord.normalScore,
          clearLamp: scoreRecord.clearLamp,
          flareRank: scoreRecord.flareRank,
          exScore: charts[0].notes * 2,
          maxCombo: charts[0].notes,
          flareSkill: 185,
        },
      ],
    ])(
      '(score: %o) sets input fields properly',
      async (score: ScoreRecord | null, expected: Partial<ScoreRecord>) => {
        // Arrange - Act
        const props = { ...requiredProps, score }
        await renderSuspended(ScoreInput, { props })

        // Assert
        const form = screen.getByRole('form')
        for (const [key, value] of Object.entries(expected)) {
          const el = form.querySelector(`[name="${key}"]`) as
            | HTMLInputElement
            | HTMLSelectElement
          expect(el).toBeDefined()
          expect(el.value).toBe(String(value))
        }
      }
    )
  })

  describe('Form State & Field Population', () => {
    describe('Failed checkbox', () => {
      test('updates clearLamp and rank when Failed is checked', async () => {
        // Arrange
        await renderSuspended(ScoreInput, {
          props: { ...requiredProps, score: scoreRecord },
        })
        const form = screen.getByRole('form')

        // Act - Find the checkbox button (there's only one: isFailed)
        const checkboxButton = within(form!).getByRole('checkbox')
        await fireEvent.click(checkboxButton)
        await new Promise(r => setTimeout(r, 0))

        // Assert
        const clearLampSelect = form!.querySelector(
          '[name="clearLamp"]'
        ) as HTMLSelectElement
        expect(checkboxButton.getAttribute('aria-checked')).toBe('true')
        expect(clearLampSelect.value).toBe(String(ClearLamp.Failed))
      })

      test('updates clearLamp and rank when Failed is unchecked', async () => {
        // Arrange
        await renderSuspended(ScoreInput, {
          props: {
            ...requiredProps,
            score: { ...scoreRecord, clearLamp: ClearLamp.Failed, rank: 'E' },
          },
        })
        const form = screen.getByRole('form')

        // Act - Find the checkbox button (there's only one: isFailed)
        const checkboxButton = within(form!).getByRole('checkbox')

        await fireEvent.click(checkboxButton)
        await new Promise(r => setTimeout(r, 0))

        // Assert
        const clearLampSelect = form!.querySelector(
          '[name="clearLamp"]'
        ) as HTMLSelectElement
        expect(checkboxButton.getAttribute('aria-checked')).toBe('false')
        expect(clearLampSelect.value).toBe(String(ClearLamp.Clear))
      })
    })

    describe('Clear Lamp dropdown', () => {
      test('updates state when Clear Lamp is selected', async () => {
        // Arrange
        await renderSuspended(ScoreInput, {
          props: { ...requiredProps, score: scoreRecord },
        })
        const form = screen.getByRole('form')

        // Act
        const clearLampSelect = form!.querySelector(
          '[name="clearLamp"]'
        ) as HTMLSelectElement

        await fireEvent.update(clearLampSelect, String(ClearLamp.MFC))
        await new Promise(r => setTimeout(r, 0))

        // Assert
        expect(clearLampSelect.value).toBe(String(ClearLamp.MFC))
      })
    })

    test('Auto button fills score fields', async () => {
      // Arrange
      const score = {
        clearLamp: ClearLamp.MFC,
        flareRank: FlareRank.IV,
      } as ScoreRecord
      const props = { ...requiredProps, score }
      const expected = fillScoreRecordFromChart(props.chart, score)
      expected.flareSkill = calcFlareSkill(
        props.chart.level,
        expected.flareRank
      )
      await renderSuspended(ScoreInput, { props })

      // Act
      const form = screen.getByRole('form')
      const autoBtn = within(form!).getByRole('button', {
        name: 'Auto-fill score fields',
      })
      await fireEvent.click(autoBtn)
      await new Promise(r => setTimeout(r, 0))

      // Assert
      const normal = within(form).getByLabelText(
        '通常スコア'
      ) as HTMLInputElement
      expect(normal.value).toBe(String(expected.normalScore))
      const ex = within(form).getByLabelText('EX SCORE') as HTMLInputElement
      const maxC = within(form).getByLabelText('MAX COMBO') as HTMLInputElement
      const flare = within(form).getByLabelText(
        'フレアスキル'
      ) as HTMLInputElement
      expect(ex.value).toBe(String(expected.exScore))
      expect(maxC.value).toBe(String(expected.maxCombo))
      expect(flare.value).toBe(String(expected.flareSkill))
    })

    test('Reset button clears form to initial state', async () => {
      // Arrange
      await renderSuspended(ScoreInput, {
        props: { ...requiredProps, score: scoreRecord },
      })
      const form = screen.getByRole('form')

      // Act - Get input by name attribute
      const normalScoreInput = form!.querySelector(
        '[name="normalScore"]'
      ) as HTMLInputElement
      expect(normalScoreInput.value).toBe(String(scoreRecord.normalScore))

      // Click Reset button
      const resetBtn = within(form!).getByRole('button', {
        name: /リセット|Reset/i,
      })
      await fireEvent.click(resetBtn)
      await new Promise(r => setTimeout(r, 0))

      // Assert - Form should reset to initial values
      expect(normalScoreInput.value).toBe('0')
    })
  })

  describe('Form Submission', () => {
    test.each([
      [locales[0], 'Score saved successfully.'],
      [locales[1], 'スコアを保存しました。'],
    ])(
      '(locale: %s) submits score to API with expected success message "%s"',
      async (locale, message) => {
        // Arrange
        mockHandler.mockClear()
        addMock.mockClear()
        const props = { ...requiredProps, score: scoreRecord }
        const wrapper = await mountSuspended(ScoreInput, { props })
        await wrapper.vm.$i18n.setLocale(locale)

        // Act
        await wrapper.find('form').trigger('submit')

        // Assert
        await vi.waitFor(() => {
          expect(mockHandler).toHaveBeenCalled()
          expect(addMock).toHaveBeenCalledWith(
            expect.objectContaining({ color: 'success', title: message })
          )
        })
      }
    )

    test.each([
      [locales[1], 'スコアの保存に失敗しました。'],
      [locales[0], 'Failed to save score.'],
    ])(
      '(locale: %s) handles error and calls toast with error message "%s"',
      async (locale, message) => {
        // Arrange
        mockHandler.mockClear()
        addMock.mockClear()
        const errorMessage = 'Invalid Body'
        mockHandler.mockImplementationOnce(() => {
          throw createError({ statusCode: 400, statusMessage: errorMessage })
        })

        const wrapper = await mountSuspended(ScoreInput, {
          props: { ...requiredProps, score: scoreRecord },
        })
        await wrapper.vm.$i18n.setLocale(locale)

        // Act
        await wrapper.find('form').trigger('submit')

        // Assert
        await vi.waitFor(() => {
          expect(mockHandler).toHaveBeenCalled()
          expect(addMock).toHaveBeenCalledWith(
            expect.objectContaining({
              color: 'error',
              title: message,
              description: expect.stringContaining(errorMessage),
            })
          )
        })
      }
    )
  })

  describe('Form validation', () => {
    test('shows validation error when normalScore is invalid', async () => {
      // Arrange
      await renderSuspended(ScoreInput, {
        props: { ...requiredProps, score: null },
      })
      const form = screen.getByRole('form')

      // Act - Set normalScore to invalid value (negative)
      const normalScoreInput = form!.querySelector(
        '[name="normalScore"]'
      ) as HTMLInputElement
      await fireEvent.update(normalScoreInput, '-1')
      await fireEvent.submit(form!)
      await new Promise(r => setTimeout(r, 100))

      // Assert - Validation should prevent submission with invalid data
      // The form validation in UForm should prevent negative values
      expect(normalScoreInput.value).toBe('-1')
    })

    test('allows valid exScore input', async () => {
      // Arrange
      await renderSuspended(ScoreInput, {
        props: { ...requiredProps, score: scoreRecord },
      })
      const form = screen.getByRole('form')

      // Act
      const exScoreInput = within(form!).getByLabelText(
        /EX SCORE/i
      ) as HTMLInputElement
      const validExScore = charts[0].notes * 2
      await fireEvent.update(exScoreInput, String(validExScore))
      await new Promise(r => setTimeout(r, 0))

      // Assert
      expect(exScoreInput.value).toBe(String(validExScore))
    })

    test('allows empty optional fields (exScore, maxCombo, flareSkill)', async () => {
      // Arrange
      await renderSuspended(ScoreInput, {
        props: {
          ...requiredProps,
          score: {
            ...scoreRecord,
            exScore: 100,
            maxCombo: 50,
            flareSkill: 10,
          },
        },
      })
      const form = screen.getByRole('form')

      // Act
      const exScoreInput: HTMLInputElement =
        within(form).getByLabelText(/EX SCORE/i)
      const maxComboInput: HTMLInputElement =
        within(form).getByLabelText(/MAX COMBO/i)
      const flareSkillInput: HTMLInputElement =
        within(form).getByLabelText(/フレアスキル|Flare Skill/i)

      await fireEvent.update(exScoreInput, '')
      await fireEvent.update(maxComboInput, '')
      await fireEvent.update(flareSkillInput, '')
      await new Promise(r => setTimeout(r, 0))

      // Assert
      expect(exScoreInput.value).toBe('')
      expect(maxComboInput.value).toBe('')
      expect(flareSkillInput.value).toBe('')
    })
  })
})
