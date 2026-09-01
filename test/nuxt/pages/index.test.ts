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

import Page from '~/pages/index.vue'
import { locales } from '~~/test/nuxt/const'

mockNuxtImport(queryCollection, o => vi.fn<typeof queryCollection>(o))

describe('/', () => {
  beforeAll(() => {
    vi.mocked(queryCollection).mockImplementation((collection: string) => {
      return {
        path: vi.fn<(path: string) => { first: () => Promise<unknown> }>(
          (path: string) => {
            return {
              first: vi.fn<() => Promise<unknown>>(() => {
                // Return content only for content_en
                if (path === '/' && collection === 'content_en') {
                  return Promise.resolve({
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
                  })
                }
                return Promise.resolve(null)
              }),
            }
          }
        ),
      } as never
    })
  })
  beforeEach(() => vi.mocked(queryCollection).mockClear())
  afterEach(async () => await useNuxtApp().$i18n.setLocale('en'))

  afterAll(() => vi.mocked(queryCollection).mockReset())

  test.each(locales)(
    '(locale: "%s", route: "/") renders correctly',
    async locale => {
      // Arrange - Act
      await useNuxtApp().$i18n.setLocale(locale)
      const wrapper = await mountSuspended(Page, { route: '/' })

      // Assert
      expect(wrapper.html()).toContain('DDRadar')
      expect(vi.mocked(queryCollection)).toHaveBeenCalledWith(
        `content_${locale}`
      )
      expect(vi.mocked(queryCollection)).toHaveBeenCalledWith('content_en')
    },
    10000
  )
})
