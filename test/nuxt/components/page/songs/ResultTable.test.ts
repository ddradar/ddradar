import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, describe, expect, test } from 'vitest'

import ResultTable from '~/components/page/songs/ResultTable.vue'
import { testSongData } from '~~/test/data/song'
import { testStepCharts } from '~~/test/data/step-chart'
import { locales } from '~~/test/nuxt/const'

const songResult: SongSearchResult = {
  ...testSongData,
  charts: testStepCharts.map(chart => ({
    playStyle: chart.playStyle,
    difficulty: chart.difficulty,
    level: chart.level,
  })),
}

const pagenation: Pagenation<SongSearchResult> = {
  items: [songResult],
  limit: 50,
  offset: 0,
  nextOffset: 50,
  hasMore: true,
}

const mountOptions = {
  props: {
    pagenation,
  },
  global: {
    stubs: {
      UTooltip: true,
    },
  },
}

describe('components/page/songs/ResultTable.vue', () => {
  afterEach(async () => await useNuxtApp().$i18n.setLocale('en'))

  describe.each(locales)('(locale: %s)', locale => {
    test('renders properly', async () => {
      const wrapper = await mountSuspended(ResultTable, mountOptions)
      await wrapper.vm.$i18n.setLocale(locale)

      expect(wrapper.html()).toMatchSnapshot()
    })

    test('renders filtered levels as outlined badges', async () => {
      const wrapper = await mountSuspended(ResultTable, {
        ...mountOptions,
        props: {
          pagenation,
          filterLevels: [4],
        },
      })
      await wrapper.vm.$i18n.setLocale(locale)

      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  test('emits load-more when clicked', async () => {
    const wrapper = await mountSuspended(ResultTable, mountOptions)

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('load-more')).toHaveLength(1)
  })

  test('hides DOUBLE charts when filterStyle is SINGLE', async () => {
    const wrapper = await mountSuspended(ResultTable, {
      ...mountOptions,
      props: {
        pagenation,
        filterStyle: 1,
      },
    })

    expect(wrapper.html()).toContain(songResult.name)
    expect(wrapper.html()).not.toContain('DOUBLE/')
  })

  test('hides SINGLE charts when filterStyle is DOUBLE', async () => {
    const wrapper = await mountSuspended(ResultTable, {
      ...mountOptions,
      props: {
        pagenation,
        filterStyle: 2,
      },
    })

    expect(wrapper.html()).toContain(songResult.name)
    expect(wrapper.html()).not.toContain('SINGLE/')
  })
})
