import { testSongData } from '@ddradar/core/test/data'
import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import GrooveRadar from '~~/components/users/GrooveRadar.vue'

describe('components/users/GrooveRadar.vue', () => {
  test('renders canvas', () => {
    const wrapper = mount(GrooveRadar, {
      props: { radar: testSongData.charts[0] },
    })
    expect(wrapper.find('canvas').exists()).toBe(true)
  })
})