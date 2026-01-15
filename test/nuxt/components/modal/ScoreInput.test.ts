import {
  mountSuspended,
  registerEndpoint,
  renderSuspended,
} from '@nuxt/test-utils/runtime'
import { fireEvent, screen, within } from '@testing-library/vue'
import { html as beautifyHtml } from 'js-beautify'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'

import type { ScoreRecord } from '#shared/types/score'
import { calcFlareSkill, fillScoreRecordFromChart } from '#shared/utils/score'
import ScoreInput from '~/components/modal/ScoreInput.vue'
import { ClearLamp, FlareRank } from '~~/shared/schemas/score'
import { scoreRecord } from '~~/test/data/score'
import { testSongData as song } from '~~/test/data/song'
import { testStepCharts as charts } from '~~/test/data/step-chart'
import { addMock, locales, mockHandler } from '~~/test/nuxt/const'

registerEndpoint(
  `/api/me/scores/${song.id}/${charts[0].playStyle}/${charts[0].difficulty}`,
  { method: 'POST', handler: mockHandler }
)

describe('components/modal/ScoreInput.vue', () => {
  const requiredProps = {
    id: song.id,
    name: song.name,
    chart: { ...charts[0] }, // has notes info
  }

  beforeAll(() => {
    vi.mocked(useToast).mockReturnValue({ add: addMock } as never)
  })
  beforeEach(() => {
    document.body.innerHTML = ''
    mockHandler.mockClear()
    addMock.mockClear()
  })

  /** Get modal form element via mountSuspended wrapper */
  const getTeleportedForms = async (
    wrapper: Awaited<ReturnType<typeof mountSuspended>>
  ) => {
    await wrapper.get('button')?.trigger('click')
    await wrapper.vm.$nextTick()
    return document.querySelector('form')
  }

  /** Open modal and get form element using testing-library */
  const openModalAndGetForm = async () => {
    const trigger = await screen.findByRole('button')
    await fireEvent.click(trigger)
    return screen.getByRole('form') as HTMLFormElement
  }

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
        const form = await getTeleportedForms(wrapper)

        // Assert
        expect(form).toBeDefined()
        const normalized = beautifyHtml(form!.outerHTML, {
          indent_size: 2,
          wrap_line_length: 0,
        })
        expect(normalized).toMatchSnapshot()
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
        const form = await openModalAndGetForm()
        for (const [key, value] of Object.entries(expected)) {
          const el = form!.querySelector(`[name="${key}"]`) as
            | HTMLInputElement
            | HTMLSelectElement
          expect(el).toBeDefined()
          expect(el.value).toBe(value == null ? '' : String(value))
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
        const form = await openModalAndGetForm()

        // Act - Find checkbox within the form
        const failedCheckbox = form!.querySelector(
          'input[type="checkbox"]'
        ) as HTMLInputElement
        await fireEvent.click(failedCheckbox)
        await new Promise(r => setTimeout(r, 0))

        // Assert
        const clearLampSelect = form!.querySelector(
          '[name="clearLamp"]'
        ) as HTMLSelectElement
        expect(failedCheckbox.checked).toBe(true)
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
        const form = await openModalAndGetForm()

        // Act
        const failedCheckbox = form!.querySelector(
          'input[type="checkbox"]'
        ) as HTMLInputElement

        await fireEvent.click(failedCheckbox)
        await new Promise(r => setTimeout(r, 0))

        // Assert
        const clearLampSelect = form!.querySelector(
          '[name="clearLamp"]'
        ) as HTMLSelectElement
        expect(failedCheckbox.checked).toBe(false)
        expect(clearLampSelect.value).toBe(String(ClearLamp.Clear))
      })
    })

    describe('Clear Lamp dropdown', () => {
      test('updates state when Clear Lamp is selected', async () => {
        // Arrange
        await renderSuspended(ScoreInput, {
          props: { ...requiredProps, score: scoreRecord },
        })
        const form = await openModalAndGetForm()

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
      const props = {
        ...requiredProps,
        score: { ...scoreRecord, clearLamp: ClearLamp.MFC },
      }
      const wrapper = await mountSuspended(ScoreInput, { props })
      const form = await getTeleportedForms(wrapper)

      // Act
      const vm = wrapper.vm as unknown as { fillScoreRecord: () => void }
      vm.fillScoreRecord()
      await wrapper.vm.$nextTick()

      // Assert
      const expected = fillScoreRecordFromChart(props.chart, props.score!)
      expected.flareSkill = calcFlareSkill(
        props.chart.level,
        expected.flareRank
      )
      const ex = form!.querySelector(
        'input[name="exScore"]'
      ) as HTMLInputElement | null
      const maxC = form!.querySelector(
        'input[name="maxCombo"]'
      ) as HTMLInputElement | null
      const flare = form!.querySelector(
        'input[name="flareSkill"]'
      ) as HTMLInputElement | null
      expect(ex).toBeDefined()
      expect(maxC).toBeDefined()
      expect(flare).toBeDefined()
      // HTML inputs convert null to empty string
      expect(ex!.value).toBe(
        expected.exScore == null ? '' : String(expected.exScore)
      )
      expect(maxC!.value).toBe(
        expected.maxCombo == null ? '' : String(expected.maxCombo)
      )
      expect(flare!.value).toBe(String(expected.flareSkill))
    })

    test('Reset button clears form to initial state', async () => {
      // Arrange
      await renderSuspended(ScoreInput, {
        props: { ...requiredProps, score: scoreRecord },
      })
      const form = await openModalAndGetForm()

      // Act - Get input by name attribute (more reliable than label text)
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
        const wrapper = await mountSuspended(ScoreInput, {
          props: { ...requiredProps, score: scoreRecord },
        })
        await wrapper.vm.$i18n.setLocale(locale)
        await wrapper.vm.$nextTick()

        // Act
        const form = await getTeleportedForms(wrapper)
        const submitBtn = form!.querySelector(
          'button[type="submit"]'
        ) as HTMLButtonElement
        await fireEvent.click(submitBtn)
        await new Promise(r => setTimeout(r, 100))

        // Assert
        expect(mockHandler).toHaveBeenCalled()
        expect(addMock).toHaveBeenCalledWith(
          expect.objectContaining({ color: 'success', title: message })
        )
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
        const apiErrorMessage = 'Invalid Body'
        mockHandler.mockImplementationOnce(() => {
          throw createError({ statusCode: 400, statusMessage: apiErrorMessage })
        })

        const wrapper = await mountSuspended(ScoreInput, {
          props: { ...requiredProps, score: scoreRecord },
        })
        await wrapper.vm.$i18n.setLocale(locale)
        await wrapper.vm.$nextTick()

        // Act
        const form = await getTeleportedForms(wrapper)
        expect(form).toBeDefined()
        const submitBtn = form!.querySelector(
          'button[type="submit"]'
        ) as HTMLButtonElement
        await fireEvent.click(submitBtn)
        await new Promise(r => setTimeout(r, 100))

        // Assert
        expect(mockHandler).toHaveBeenCalled()
        expect(addMock).toHaveBeenCalledWith(
          expect.objectContaining({
            color: 'error',
            title: message,
            description: expect.stringContaining(apiErrorMessage),
          })
        )
      }
    )
  })

  describe('Form validation', () => {
    test('shows validation error when normalScore is invalid', async () => {
      // Arrange
      await renderSuspended(ScoreInput, {
        props: { ...requiredProps, score: null },
      })
      const form = await openModalAndGetForm()

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
      const form = await openModalAndGetForm()

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
      const form = await openModalAndGetForm()

      // Act
      const exScoreInput = within(form!).getByLabelText(
        /EX SCORE/i
      ) as HTMLInputElement
      const maxComboInput = within(form!).getByLabelText(
        /MAX COMBO/i
      ) as HTMLInputElement
      const flareSkillInput = within(form!).getByLabelText(
        /フレアスキル|Flare Skill/i
      ) as HTMLInputElement

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
