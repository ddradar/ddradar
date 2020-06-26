import { createLocalVue, mount } from '@vue/test-utils'

import IndexPage from '~/pages/index.vue'

const localVue = createLocalVue()

describe('pages/index.vue', () => {
  test('renders correctly', () => {
    const wrapper = mount(IndexPage, { localVue })
    expect(wrapper).toMatchSnapshot()
  })
})
