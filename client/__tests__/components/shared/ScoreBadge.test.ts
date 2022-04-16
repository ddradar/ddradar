import { mount } from '@vue/test-utils'

import { createVue } from '~/__tests__/util'
import ScoreBadge from '~/components/shared/ScoreBadge.vue'

const localVue = createVue()

describe('/components/shared/ScoreBadge.vue', () => {
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
    // Arrange - Act
    const propsData = { lamp, score }
    const wrapper = mount(ScoreBadge, { localVue, propsData })

    // Assert
    expect(wrapper).toMatchSnapshot()
  })
})
