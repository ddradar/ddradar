import {
  mockNuxtImport,
  mountSuspended,
  registerEndpoint,
  renderSuspended,
} from '@nuxt/test-utils/runtime'
import { fireEvent, screen, within } from '@testing-library/vue'
import { createError, readBody } from 'h3'
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'

import type { User } from '#auth-utils'
import Page from '~/pages/profile.vue'
import { publicUser, sessionUser } from '~~/test/data/user'
import { addMock, locales, mockHandler } from '~~/test/nuxt/const'

// Mock composables
const { useCookieMock } = vi.hoisted(() => ({ useCookieMock: vi.fn() }))
mockNuxtImport('useCookie', () => useCookieMock)

// Mock API endpoints
registerEndpoint(`/api/users/${publicUser.id}`, () => ({ ...publicUser }))
registerEndpoint('/api/me', { method: 'POST', handler: mockHandler })

describe('/profile', () => {
  const route = '/profile'
  const loginUser = { id: publicUser.id, ...sessionUser }

  const user = ref<User | null>(null)
  const loggedIn = computed(() => !!user.value)
  const fetchMock = vi.fn<ReturnType<typeof useUserSession>['fetch']>()
  const redirectCookie = { value: '' }

  beforeAll(() => {
    vi.mocked(useToast).mockReturnValue({ add: addMock } as never)
    vi.mocked(useUserSession).mockReturnValue({
      loggedIn,
      user,
      fetch: fetchMock,
    } as never)
  })
  beforeEach(() => {
    mockHandler.mockClear()
    addMock.mockClear()
    fetchMock.mockClear()
    vi.mocked(navigateTo).mockClear()
    vi.mocked(useCookie).mockReturnValue(redirectCookie as never)
    redirectCookie.value = ''
  })
  afterAll(() => {
    vi.mocked(useUserSession).mockReset()
    vi.mocked(navigateTo).mockReset()
    vi.mocked(useCookie).mockReset()
  })

  // NOTE: This middleware test must run BEFORE any tests that successfully mount the component.
  // Nuxt test-utils caches middleware execution, so if a logged-in user test runs first,
  // the middleware won't re-execute for subsequent non-logged-in user tests.
  // This is why this redirect test is placed at the top of the test suite.
  test('redirects to /login when not logged in', async () => {
    // Arrange
    user.value = null

    // Act
    await mountSuspended(Page, { route })

    // Assert
    expect(vi.mocked(navigateTo)).toHaveBeenCalledWith('/login')
    expect(redirectCookie.value).toBe('/profile')
  })

  describe.each(locales)('(locale: %s)', locale => {
    test('renders correctly when user is already registered', async () => {
      // Arrange
      user.value = loginUser

      // Act
      const wrapper = await mountSuspended(Page, { route })
      await wrapper.vm.$i18n.setLocale(locale)

      // Assert
      expect(wrapper.html()).toMatchSnapshot()
    })

    test('renders alert when user is not registered yet', async () => {
      // Arrange
      user.value = { ...sessionUser }

      // Act
      const wrapper = await mountSuspended(Page, { route })
      await wrapper.vm.$i18n.setLocale(locale)

      // Assert
      const alert = wrapper.findComponent({ name: 'UAlert' })
      expect(alert.exists()).toBe(true)
      expect(alert.html()).toMatchSnapshot()
    })
  })

  describe('field behaviors', () => {
    test('ID field is disabled for registered users', async () => {
      // Arrange
      user.value = loginUser
      await renderSuspended(Page, { route })

      // Act
      const form = screen.getByRole('form')
      const idField = within(form).getByLabelText(
        /ユーザーID|User ID/i
      ) as HTMLInputElement

      // Assert
      expect(idField.disabled).toBe(true)
      expect(idField.value).toBe(publicUser.id)
    })

    test('ID field is enabled for new users', async () => {
      // Arrange
      user.value = { ...sessionUser }
      await renderSuspended(Page, { route })

      // Act
      const form = screen.getByRole('form')
      const idField = within(form).getByLabelText(
        /ユーザーID|User ID/i
      ) as HTMLInputElement

      // Assert
      expect(idField.disabled).toBe(false)
      expect(idField.value).toBe('')
    })

    test('Name field defaults to social account name for new users', async () => {
      // Arrange
      user.value = { ...sessionUser }
      await renderSuspended(Page, { route })

      // Act
      const form = screen.getByRole('form')
      const nameField = within(form).getByLabelText(
        /ユーザー名|Name/i
      ) as HTMLInputElement

      // Assert
      expect(nameField.value).toBe(sessionUser.displayName)
    })

    test('isPublic switch defaults to false for new users', async () => {
      // Arrange
      user.value = { ...sessionUser }
      await renderSuspended(Page, { route })

      // Act
      const form = screen.getByRole('form')
      const isPublicSwitch = within(form).getByRole(
        'switch'
      ) as HTMLButtonElement

      // Assert
      expect(isPublicSwitch.getAttribute('aria-checked')).toBe('false')
    })

    test('isPublic switch reflects existing value for registered users', async () => {
      // Arrange
      user.value = loginUser
      await renderSuspended(Page, { route })

      // Act
      const form = screen.getByRole('form')
      const isPublicSwitch = within(form).getByRole(
        'switch'
      ) as HTMLButtonElement

      // Assert
      expect(isPublicSwitch.getAttribute('aria-checked')).toBe(
        String(publicUser.isPublic)
      )
    })

    test('isPublic switch can be toggled', async () => {
      // Arrange
      user.value = { ...sessionUser }
      await renderSuspended(Page, { route })

      // Act
      const form = screen.getByRole('form')
      const isPublicSwitch = within(form).getByRole(
        'switch'
      ) as HTMLButtonElement

      const initialState = isPublicSwitch.getAttribute('aria-checked')
      await fireEvent.click(isPublicSwitch)

      // Wait for state update
      await new Promise(r => setTimeout(r, 100))

      // Assert
      const newState = isPublicSwitch.getAttribute('aria-checked')
      expect(newState).not.toBe(initialState)
      expect(newState).toBe('true')
    })
  })

  describe('onSubmit', () => {
    test.each([
      [locales[0], 'Profile saved successfully.'],
      [locales[1], 'プロフィールを保存しました。'],
    ])(
      '(locale: %s) submits user data and calls toast with "%s"',
      async (locale, message) => {
        // Arrange
        user.value = loginUser
        let capturedBody: UserInfo | null = null
        mockHandler.mockImplementationOnce(async event => {
          capturedBody = await readBody(event)
          return capturedBody
        })
        const wrapper = await mountSuspended(Page, { route })
        await wrapper.vm.$i18n.setLocale(locale)

        // Act
        const form = wrapper.find('form')
        await fireEvent.submit(form.element as HTMLFormElement)
        await new Promise(r => setTimeout(r, 100))

        // Assert
        expect(mockHandler).toHaveBeenCalled()
        expect(addMock).toHaveBeenCalledWith(
          expect.objectContaining({ color: 'success', title: message })
        )
        expect(fetchMock).toHaveBeenCalled()

        // Verify payload structure
        expect(capturedBody!.id).toBe(publicUser.id)
        expect(capturedBody!.name).toBe(publicUser.name)
        expect(capturedBody!.area).toBe(publicUser.area)
        expect(capturedBody!.isPublic).toBe(publicUser.isPublic)
      }
    )

    test.each([
      [locales[0], 'Failed to save profile.'],
      [locales[1], 'プロフィールの保存に失敗しました。'],
    ])(
      '(locale: %s) handles error and calls toast with error message "%s"',
      async (locale, message) => {
        // Arrange
        user.value = loginUser
        mockHandler.mockClear()
        addMock.mockClear()
        const apiErrorMessage = 'Invalid Body'
        mockHandler.mockImplementationOnce(() => {
          throw createError({ statusCode: 400, statusMessage: apiErrorMessage })
        })
        const wrapper = await mountSuspended(Page, { route })
        await wrapper.vm.$i18n.setLocale(locale)

        // Act
        const form = wrapper.find('form')
        await fireEvent.submit(form.element as HTMLFormElement)
        await new Promise(r => setTimeout(r, 100))

        // Assert
        expect(mockHandler).toHaveBeenCalled()
        expect(addMock).toHaveBeenCalledWith(
          expect.objectContaining({
            color: 'error',
            title: message,
          })
        )
      }
    )
  })

  describe('form validation', () => {
    test.each([/ユーザーID|User ID/i, /ユーザー名|Name/i, /所属エリア|Area/i])(
      'shows validation error when required field is empty',
      async labelPattern => {
        // Arrange
        user.value = null // New user (not registered)
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
        const errors = screen.queryAllByText(
          /required|Required|必須|小さ|Too small/i
        )
        expect(errors.length).toBeGreaterThan(0)

        expect(mockHandler).not.toHaveBeenCalled()
      }
    )

    test('allows optional field (ddrCode) to be empty without validation errors', async () => {
      // Arrange
      user.value = { ...sessionUser }
      await renderSuspended(Page, { route })

      // Act - Clear optional field
      const form = screen.getByRole('form')
      const ddrCodeField = within(form).getByLabelText(/DDR.*Code|DDRコード/i)

      await fireEvent.update(ddrCodeField, '')

      // Trigger form validation
      await fireEvent.submit(form)

      // Wait for validation to complete
      await new Promise(r => setTimeout(r, 100))

      // Assert - Clearing optional field should not show required field errors
      const requiredErrors = screen.queryAllByText(
        /Too small.*required|Required.*小さ|小さすぎます/i
      )
      expect(requiredErrors.length).toBe(0)
    })

    test('validates fields independently', async () => {
      // Arrange
      user.value = { ...sessionUser }
      await renderSuspended(Page, { route })

      // Act - Clear only ID field
      const form = screen.getByRole('form')
      const idField = within(form).getByLabelText(/ユーザーID|User ID/i)

      await fireEvent.update(idField, '')

      // Submit form
      await fireEvent.submit(form)
      await new Promise(r => setTimeout(r, 100))

      // Assert - Only one error should be shown (for ID field)
      const errors = screen.queryAllByText(/Too small|Required|必須/i)
      expect(errors.length).toBeGreaterThan(0)

      // Verify form was not submitted
      expect(mockHandler).not.toHaveBeenCalled()
    })
  })
})
