import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import { testSongData } from '~/../core/test/data'
import GrooveRadar from '~/components/GrooveRadar.vue'

describe('components/GrooveRadar.vue', () => {
  test('renders canvas', () => {
    const wrapper = mount(GrooveRadar, {
      props: { radar: testSongData.charts[0] },
    })
    expect(wrapper.find('canvas').exists()).toBe(true)
  })
})
