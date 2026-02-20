import {
  mockNuxtImport,
  mountSuspended,
  registerEndpoint,
  renderSuspended,
} from '@nuxt/test-utils/runtime'
import { fireEvent, screen, within } from '@testing-library/vue'
import { readBody } from 'h3'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'

import type { User } from '#auth-utils'
import Page from '~/pages/admin/songs/[id].vue'
import { testSongData } from '~~/test/data/song'
import { testStepCharts } from '~~/test/data/step-chart'
import { sessionUser } from '~~/test/data/user'
import { addMock, locales, mockHandler, withLocales } from '~~/test/nuxt/const'

mockNuxtImport(useToast, original => vi.fn(original))
mockNuxtImport(useUserSession, original => vi.fn(original))

// Mock API endpoints
registerEndpoint(`/api/songs/${testSongData.id}`, () => ({
  ...testSongData,
  charts: testStepCharts.map(chart => JSON.parse(JSON.stringify(chart))),
}))
registerEndpoint('/api/songs/', { method: 'POST', handler: mockHandler })

describe('/admin/songs/[id]', () => {
  const route = `/admin/songs/${testSongData.id}`
  const admin = { ...sessionUser, roles: ['admin'] }

  const user = ref<User | null>(null)
  const loggedIn = computed(() => !!user.value)

  beforeAll(() => {
    vi.mocked(useToast).mockReturnValue({ add: addMock } as never)
    vi.mocked(useUserSession).mockReturnValue({ loggedIn, user } as never)
  })
  beforeEach(() => {
    mockHandler.mockClear()
    addMock.mockClear()
    user.value = null
  })
  afterAll(() => {
    vi.mocked(useUserSession).mockReset()
  })

  test.each([
    [null, 'test=null'],
    [{ ...sessionUser }, 'test=norole'],
    [{ ...sessionUser, roles: ['user'] }, 'test=userrole'],
  ])('({ user: %s }) returns 403', async (loginUser, query) => {
    // Arrange
    user.value = loginUser
    // Append query to avoid middleware caching
    const route = `/admin/songs/${testSongData.id}?${query}`

    // Act & Assert
    await expect(mountSuspended(Page, { route })).rejects.toThrowError(
      expect.objectContaining({ statusCode: 403, statusMessage: 'Forbidden' })
    )
  })

  describe.each(locales)('(locale: %s)', locale => {
    afterEach(async () => await useNuxtApp().$i18n.setLocale('en'))

    test('(<admin user>) renders correctly', async () => {
      // Arrange
      user.value = admin

      //  Act
      const wrapper = await mountSuspended(Page, { route })
      await wrapper.vm.$i18n.setLocale(locale)

      // Assert
      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe('events', () => {
    test('addChart adds a new chart', async () => {
      // Arrange
      user.value = admin
      await renderSuspended(Page, { route })

      // Act
      const addButton = screen.getByRole('button', { name: 'Add' })
      await fireEvent.click(addButton)

      // Assert
      const accordions = screen.getAllByRole('button', {
        name: /BEGINNER|BASIC|DIFFICULT|EXPERT|CHALLENGE/i,
      })
      expect(accordions.length).toBeGreaterThan(testStepCharts.length)
    })

    test('addRadar adds radar data to a chart', async () => {
      // Arrange
      user.value = admin
      await renderSuspended(Page, { route })
      const noRadarChartIndex = testStepCharts.findIndex(
        chart => !('radar' in chart)
      )

      // Act
      // Open the no radar chart accordion
      const accordions = screen.getAllByRole('button', {
        name: /BEGINNER|BASIC|DIFFICULT|EXPERT|CHALLENGE/i,
      })
      await fireEvent.click(accordions[noRadarChartIndex]!)

      // Scope to the radar field within the opened accordion
      const radarLabel = await screen.findByText('Groove Radar')
      const radarField = radarLabel.closest(
        '[data-slot="root"]'
      )! as HTMLElement

      // Ensure no radar fields exist before adding
      expect(within(radarField).queryAllByRole('textbox').length).toBe(0)

      // Click the "Add" button to add radar
      const addRadarButton = within(radarField).getByRole('button', {
        name: 'Add',
      })
      await fireEvent.click(addRadarButton)

      // Assert
      // Radar field should have 5 textboxes now
      expect(within(radarField).getAllByRole('textbox').length).toBe(5)
    })

    test('removeRadar removes radar data from a chart', async () => {
      // Arrange
      user.value = admin
      await renderSuspended(Page, { route })
      const radarChartIndex = testStepCharts.findIndex(
        chart => 'radar' in chart
      )

      // Act
      // Open the accordion that has radar data
      const accordions = screen.getAllByRole('button', {
        name: /BEGINNER|BASIC|DIFFICULT|EXPERT|CHALLENGE/i,
      })
      await fireEvent.click(accordions[radarChartIndex]!)

      // Scope to the radar field within the opened accordion
      const radarLabel = await screen.findByText('Groove Radar')
      const radarField = radarLabel.closest(
        '[data-slot="root"]'
      )! as HTMLElement

      // Ensure radar fields exist before deletion
      expect(within(radarField).getAllByRole('textbox').length).toBe(5)

      // Click the "Delete" button to remove radar within the field
      const deleteButton = within(radarField).getByRole('button', {
        name: 'Delete',
      })
      await fireEvent.click(deleteButton)

      // Assert within the radar field
      expect(within(radarField).queryAllByRole('textbox').length).toBe(0)
    })

    describe('onSubmit', () => {
      test.each(
        withLocales(
          'Song saved successfully.',
          '曲情報を保存しました。',
          '노래 정보가 저장되었습니다.'
        )
      )(
        '(locale: %s) submits updated song data and call toast with "%s"',
        async (locale, title) => {
          // Arrange
          clearNuxtData()
          user.value = admin
          let capturedBody: SongInfo
          mockHandler.mockImplementationOnce(async event => {
            capturedBody = await readBody(event)
            return capturedBody
          })
          const wrapper = await mountSuspended(Page, { route })
          await wrapper.vm.$i18n.setLocale(locale)

          // Act
          await wrapper.find('form#main-form').trigger('submit')

          // Assert
          await vi.waitFor(() => {
            expect(mockHandler).toHaveBeenCalled()
            expect(addMock).toHaveBeenCalledWith({ color: 'success', title })

            // Verify payload structure
            expect(capturedBody.id).toBe(testSongData.id)
            expect(capturedBody.name).toBe(testSongData.name)
            expect(capturedBody.nameKana).toBe(testSongData.nameKana)
            expect(capturedBody.series).toBe(testSongData.series)
            expect(capturedBody.charts).toStrictEqual(testStepCharts)
          })
          await useNuxtApp().$i18n.setLocale('en')
        }
      )

      test.each(
        withLocales(
          'Failed to save song.',
          '曲情報の保存に失敗しました。',
          '노래 정보를 저장하는 데 실패했습니다.'
        )
      )(
        '(locale: %s) handles error and calls toast with error message "%s"',
        async (locale, title) => {
          // Arrange
          clearNuxtData()
          user.value = admin
          const errorMessage = 'Invalid Body'
          mockHandler.mockImplementationOnce(() => {
            throw createError({ statusCode: 400, statusMessage: errorMessage })
          })
          const wrapper = await mountSuspended(Page, { route })
          await wrapper.vm.$i18n.setLocale(locale)

          // Act
          await wrapper.find('form#main-form').trigger('submit')

          // Assert
          await vi.waitFor(() => {
            expect(mockHandler).toHaveBeenCalled()
            expect(addMock).toHaveBeenCalledWith(
              expect.objectContaining({
                color: 'error',
                title,
                description: expect.stringContaining(errorMessage),
              })
            )
          })
          await useNuxtApp().$i18n.setLocale('en')
        }
      )
    })

    describe('form validation', () => {
      test.each([/Name/i, /Furigana/i, /Series/i])(
        'shows validation error when required field is empty',
        async labelPattern => {
          // Arrange
          user.value = admin
          await renderSuspended(Page, { route })

          // Act - Find and clear the field using Testing Library queries
          const form = screen.getByRole('form')
          const field = within(form).getByLabelText(labelPattern)

          await fireEvent.update(field, '')

          // Trigger form validation by submitting the form
          await fireEvent.submit(form)

          // Wait for validation to complete
          await new Promise(r => setTimeout(r, 100))

          // Assert - Check that validation error is displayed
          const errors = screen.queryAllByText(/Too small|Required/i)
          expect(errors).toHaveLength(1)

          expect(mockHandler).not.toHaveBeenCalled()
        }
      )

      test.each([/Play Style/i, /Difficulty/i, /Level/i])(
        'shows validation error when chart required field is empty',
        async labelPattern => {
          // Arrange
          user.value = admin
          await renderSuspended(Page, { route })

          // Open the first chart accordion
          const accordions = screen.getAllByRole('button', {
            name: /BEGINNER|BASIC|DIFFICULT|EXPERT|CHALLENGE/i,
          })
          await fireEvent.click(accordions[0]!)

          // Wait for accordion content to render
          await new Promise(r => setTimeout(r, 100))

          // Act - Find and clear the field using Testing Library queries
          const form = screen.getByRole('form')
          const field = within(form).getByLabelText(labelPattern)

          await fireEvent.update(field, '')

          // Trigger form validation by submitting the form
          await fireEvent.submit(form)

          // Wait for validation to complete
          await new Promise(r => setTimeout(r, 100))

          // Assert - Check that validation error is displayed
          const errors = screen.queryAllByText(/Too small|Required|Invalid/i)
          expect(errors.length).toBeGreaterThan(0)

          expect(mockHandler).not.toHaveBeenCalled()
        }
      )

      test('allows optional fields (artist, bpm) to be empty without validation errors', async () => {
        // Arrange
        user.value = admin
        await renderSuspended(Page, { route })

        // Act
        const form = screen.getByRole('form')
        const artistField = within(form).getByLabelText(/Artist/i)
        const bpmField = within(form).getByLabelText(/BPM/i)

        await fireEvent.update(artistField, '')
        await fireEvent.update(bpmField, '')

        // Trigger form validation
        await fireEvent.submit(form)

        // Assert - Clearing optional fields should not show required field errors
        const requiredErrors = screen.queryAllByText(
          /Too small|Required|Invalid/i
        )
        expect(requiredErrors).toHaveLength(0)
      })

      test('chart fields validated independently when multiple charts exist', async () => {
        // Arrange
        user.value = admin
        await renderSuspended(Page, { route })

        // Act - Open first chart and make it invalid
        const accordions = screen.getAllByRole('button', {
          name: /BEGINNER|BASIC|DIFFICULT|EXPERT|CHALLENGE/i,
        })
        await fireEvent.click(accordions[0]!)
        await new Promise(r => setTimeout(r, 100))

        // Clear a required field in first chart
        const form = screen.getByRole('form')
        const levelField = within(form).getByLabelText(/Level/i)
        await fireEvent.update(levelField, '')

        // Submit form
        await fireEvent.submit(form)
        await new Promise(r => setTimeout(r, 100))

        // Assert - Error should be shown for the cleared field
        const errors = screen.queryAllByText(/Too small|Required|Invalid/i)
        expect(errors.length).toBeGreaterThan(0)

        // Verify other charts were not submitted
        expect(mockHandler).not.toHaveBeenCalled()
      })
    })
  })
})
