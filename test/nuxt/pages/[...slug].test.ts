import { mountSuspended } from '@nuxt/test-utils/runtime'
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'

import Page from '~/pages/[...slug].vue'
import { locales } from '~~/test/nuxt/const'

describe('[...slug]', () => {
  beforeAll(() => {
    vi.mocked(queryCollection).mockImplementation((collection: string) => {
      return {
        path: vi.fn((path: string) => {
          return {
            first: vi.fn(async () => {
              // Return content only for content_en
              if (path === '/' && collection === 'content_en') {
                return {
                  _path: '/',
                  title: 'DDRadar',
                  description:
                    'Simple, fast tool to record, analyze, and share your DDR scores.',
                  body: {
                    type: 'root',
                    children: [
                      {
                        type: 'element',
                        tag: 'div',
                        props: {},
                        children: [
                          {
                            type: 'element',
                            tag: 'h1',
                            props: {},
                            children: [{ type: 'text', value: 'DDRadar' }],
                          },
                        ],
                      },
                    ],
                  },
                }
              }
              return null
            }),
          }
        }),
      } as never
    })
  })
  beforeEach(() => vi.mocked(queryCollection).mockClear())
  afterAll(() => vi.mocked(queryCollection).mockReset())

  test.each([
    [locales[0], ['content_en']],
    [locales[1], ['content_ja', 'content_en']],
  ])(
    '(locale: "%s", route: "/") renders correctly',
    async (locale, expected) => {
      // Arrange - Act
      const wrapper = await mountSuspended(Page, { route: '/' })
      await wrapper.vm.$i18n.setLocale(locale)

      // Assert
      expect(wrapper.html()).toContain('DDRadar')
      expected.forEach((collection, i) => {
        expect(vi.mocked(queryCollection)).toHaveBeenNthCalledWith(
          i + 1,
          collection
        )
      })
    }
  )

  test('(route: "/invalid") throws error', async () => {
    await expect(mountSuspended(Page, { route: '/invalid' })).rejects.toThrow(
      expect.objectContaining({
        statusCode: 404,
        statusMessage: 'Page not found',
      })
    )
  })
})
