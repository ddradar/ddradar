import {
  mockNuxtImport,
  mountSuspended,
  registerEndpoint,
} from '@nuxt/test-utils/runtime'
import type { VueWrapper } from '@vue/test-utils'
import { getQuery, type H3Event } from 'h3'
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'

import SongsResultTable from '~/components/page/songs/ResultTable.vue'
import SongsSearchTabs from '~/components/page/songs/SearchTabs.vue'
import PageComponent from '~/pages/songs/index.vue'
import type { SongSearchResult } from '~~/shared/types/song'
import type { Pagenation } from '~~/shared/types/utility-types'
import { testSongData } from '~~/test/data/song'
import { testStepCharts } from '~~/test/data/step-chart'
import { locales } from '~~/test/nuxt/const'

mockNuxtImport(navigateTo, o => vi.fn<typeof navigateTo>(o))

const songResult: SongSearchResult = {
  ...testSongData,
  charts: testStepCharts.map(chart => ({
    playStyle: chart.playStyle,
    difficulty: chart.difficulty,
    level: chart.level,
  })),
}

const anotherSongResult: SongSearchResult = {
  ...songResult,
  id: '0'.repeat(32),
  name: 'PARANOiA MAX',
  nameKana: 'PARANOIA MAX',
}

const songsHandler = vi.fn<(event: H3Event) => Pagenation<SongSearchResult>>(
  event => {
    const query = getQuery(event)
    if (query.offset === '50') {
      return {
        items: [anotherSongResult],
        limit: 50,
        offset: 50,
        nextOffset: null,
        hasMore: false,
      }
    }

    return {
      items: [songResult],
      limit: 50,
      offset: 0,
      nextOffset: 50,
      hasMore: true,
    }
  }
)

registerEndpoint('/api/songs', songsHandler)

async function waitForTabsPanelSettled(wrapper: VueWrapper<unknown>) {
  const selector = '[role="tabpanel"][data-state="active"]'

  await vi.waitFor(() => {
    expect(wrapper.find(selector).exists()).toBe(true)
  })

  let previous: string | undefined
  await vi.waitFor(async () => {
    // Wait one macrotask to allow inline transition styles to settle.
    await new Promise(resolve => setTimeout(resolve, 0))

    const current = wrapper.find(selector).attributes('style') ?? ''
    if (previous === undefined) {
      previous = current
      throw new Error('tabpanel style not settled yet')
    }
    if (current !== previous) {
      previous = current
      throw new Error('tabpanel style changed')
    }
  })
}

describe('/songs', () => {
  const mountOptions = { global: { stubs: { UTooltip: true } } }

  beforeEach(() => {
    clearNuxtData()
    songsHandler.mockClear()
    vi.mocked(navigateTo).mockClear()
    useState('play-style-visibility', () => 0).value = 0
  })

  afterAll(() => vi.mocked(navigateTo).mockReset())

  describe.each(locales)('(locale: %s)', locale => {
    beforeEach(async () => await useNuxtApp().$i18n.setLocale(locale))
    afterEach(async () => await useNuxtApp().$i18n.setLocale('en'))

    test('renders initial state correctly', async () => {
      const wrapper = await mountSuspended(PageComponent, {
        route: '/songs',
        ...mountOptions,
      })
      await waitForTabsPanelSettled(wrapper)

      expect(wrapper.findComponent(SongsSearchTabs).props('activeTab')).toBe(
        'level'
      )
      expect(wrapper.html()).toMatchSnapshot()
    })

    test('renders search result state correctly', async () => {
      const options = { route: '/songs?level=4', ...mountOptions }
      const wrapper = await mountSuspended(PageComponent, options)

      await vi.waitFor(() => {
        expect(songsHandler).toHaveBeenCalled()
      })
      await waitForTabsPanelSettled(wrapper)

      expect(wrapper.findComponent(SongsSearchTabs).props('activeTab')).toBe(
        'level'
      )
      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  test.each([
    [{ style: 0, expected: { level: '4' } }],
    [{ style: 1, expected: { level: '4', style: '1' } }],
    [{ style: 2, expected: { level: '4', style: '2' } }],
  ] as const)(
    'level search navigates with expected query: %o',
    async ({ style, expected }) => {
      useState('play-style-visibility').value = style
      const options = { route: '/songs', ...mountOptions }
      const wrapper = await mountSuspended(PageComponent, options)

      const tabs = wrapper.findComponent(SongsSearchTabs) as VueWrapper<unknown>
      tabs.vm.$emit('search', { tab: 'level', query: expected })

      expect(vi.mocked(navigateTo)).toHaveBeenCalledWith({ query: expected })
    }
  )

  test.each([
    ['/songs?series=0', 'version'],
    ['/songs?name=25', 'title'],
    ['/songs?level=4&series=0&name=25', 'level'],
  ] as const)(
    'derives active tab from route query (%s)',
    async (route, expected) => {
      const options = { route, ...mountOptions }
      const wrapper = await mountSuspended(PageComponent, options)

      expect(wrapper.findComponent(SongsSearchTabs).props('activeTab')).toBe(
        expected
      )
    }
  )

  test('keeps custom tab active after custom search with level condition', async () => {
    const options = { route: '/songs', ...mountOptions }
    const wrapper = await mountSuspended(PageComponent, options)
    const tabs = wrapper.findComponent(SongsSearchTabs) as VueWrapper<unknown>

    tabs.vm.$emit('update:activeTab', 'custom')
    tabs.vm.$emit('search', { tab: 'custom', query: { level: ['4'] } })

    await vi.waitFor(() => {
      expect(wrapper.findComponent(SongsSearchTabs).props('activeTab')).toBe(
        'custom'
      )
    })
  })

  test('loads more results when load-more is emitted', async () => {
    const options = { route: '/songs?level=4', ...mountOptions }
    const wrapper = await mountSuspended(PageComponent, options)

    await vi.waitFor(() => {
      expect(wrapper.html()).toContain(songResult.name)
    })

    const initialCalls = songsHandler.mock.calls.length

    const resultTable = wrapper.findComponent(
      SongsResultTable
    ) as VueWrapper<unknown>
    resultTable.vm.$emit('load-more')

    await vi.waitFor(() => {
      expect(songsHandler).toHaveBeenCalledTimes(initialCalls + 1)
      expect(wrapper.html()).toContain(anotherSongResult.name)
    })
  })
})
