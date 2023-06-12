import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import ScoreBadge from '~~/components/songs/ScoreBadge.vue'

describe('components/songs/ScoreBadge.vue', () => {
  test.each([
    [0, 10000],
    [1, 340000],
    [2, 800000],
    [3, 950000],
    [4, 940000],
    [5, 987650],
    [6, 999990],
    [7, 1000000],
  ])('{ lamp: %i, score: %i } renders correctly', (lamp, score) => {
    const wrapper = mount(ScoreBadge, {
      props: { lamp, score },
      global: { plugins: [[Oruga, bulmaConfig]] },
    })
    expect(wrapper.element).toMatchSnapshot()
  })
})
