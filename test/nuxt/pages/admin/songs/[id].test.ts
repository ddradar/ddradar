import {
  mockNuxtImport,
  mountSuspended,
  registerEndpoint,
} from '@nuxt/test-utils/runtime'
import { readBody } from 'h3'
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'

import Page from '~/pages/admin/songs/[id].vue'
import { testSongData } from '~~/test/data/song'
import { testStepCharts } from '~~/test/data/step-chart'

// Mock composables
const { useToastMock, useUserSessionMock } = vi.hoisted(() => ({
  useToastMock: vi.fn(),
  useUserSessionMock: vi.fn(),
}))
mockNuxtImport('useUserSession', () => useUserSessionMock)
mockNuxtImport('useToast', () => useToastMock)

// Mock API endpoints
registerEndpoint(`/api/songs/${testSongData.id}`, () => ({
  ...testSongData,
  charts: [...testStepCharts],
}))
const mockHandler = vi.fn(event => readBody(event))
registerEndpoint('/api/songs/', {
  method: 'POST',
  handler: mockHandler,
})

describe('/admin/songs/[id]', () => {
  const route = `/admin/songs/${testSongData.id}`
  const addMock = vi.fn<ReturnType<typeof useToastMock>['add']>()

  beforeAll(() => {
    useToastMock.mockReturnValue({ add: addMock })
    useUserSessionMock.mockReturnValue({
      loggedIn: ref(true),
      user: ref({ roles: ['admin'] }),
    })
  })
  beforeEach(() => {
    mockHandler.mockClear()
    addMock.mockClear()
  })
  afterAll(() => {
    useToastMock.mockReset()
    useUserSessionMock.mockReset()
  })

  test.each([
    [false, null],
    [true, { roles: [] }],
    [true, { roles: ['user'] }],
  ])('({ loggedIn: %o, user: %o }) returns 403', async (loggedIn, user) => {
    // Arrange
    useUserSessionMock.mockReturnValueOnce({
      loggedIn: ref(loggedIn),
      user: ref(user),
    })

    // Act - Assert
    await expect(mountSuspended(Page, { route })).rejects.toThrowError(
      expect.objectContaining({ statusCode: 403, statusMessage: 'Forbidden' })
    )
  })

  test('(<admin user>) renders correctly', async () => {
    // Arrange - Act
    const wrapper = await mountSuspended(Page, { route })

    // Assert
    expect(wrapper.html()).toMatchSnapshot()
  })

  describe('events', () => {
    test('addChart adds a new chart', async () => {
      // Arrange
      const wrapper = await mountSuspended(Page, { route })

      // Act
      await wrapper.find('button#add-button').trigger('click')

      // Assert
      // @ts-expect-error - charts is a data property
      expect(wrapper.vm.charts.length).toBe(testStepCharts.length + 1)
    })

    describe('onSubmit', () => {
      test('submits updated song data', async () => {
        // Arrange
        const wrapper = await mountSuspended(Page, { route })

        // Act
        await wrapper.find('form#main-form').trigger('submit')

        // Assert
        await vi.waitFor(() => {
          expect(mockHandler).toHaveBeenCalled()
          expect(addMock).toHaveBeenCalledWith({
            color: 'success',
            title: '曲情報を保存しました',
          })
        })
      })

      test('handles error', async () => {
        // Arrange
        const errorMessage = 'Invalid Body'
        mockHandler.mockImplementationOnce(() => {
          throw createError({ statusCode: 400, statusMessage: errorMessage })
        })
        const wrapper = await mountSuspended(Page, { route })

        // Act
        await wrapper.find('form#main-form').trigger('submit')

        // Assert
        await vi.waitFor(() => {
          expect(mockHandler).toHaveBeenCalled()
          expect(addMock).toHaveBeenCalledWith(
            expect.objectContaining({
              color: 'error',
              title: '曲情報の保存に失敗しました',
              description: expect.stringContaining(errorMessage),
            })
          )
        })
      })
    })
  })
})
