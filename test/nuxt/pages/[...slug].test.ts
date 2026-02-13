import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
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

import Page from '~/pages/[...slug].vue'
import { withLocales } from '~~/test/nuxt/const'

mockNuxtImport(queryCollection, original => vi.fn(original))

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
  afterEach(async () => await useNuxtApp().$i18n.setLocale('en'))
  afterAll(() => vi.mocked(queryCollection).mockReset())

  test.each(
    withLocales(
      ['content_en'],
      ['content_ja', 'content_en'],
      ['content_ko', 'content_en']
    )
  )(
    '(locale: "%s", route: "/") renders correctly',
    async (locale, expected) => {
      // Arrange - Act
      await useNuxtApp().$i18n.setLocale(locale)
      const wrapper = await mountSuspended(Page, { route: '/' })

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
    await expect(
      mountSuspended(Page, { route: '/invalid' })
    ).rejects.toThrowError(
      expect.objectContaining({
        statusCode: 404,
        statusMessage: 'Page not found',
      })
    )
  })
})
