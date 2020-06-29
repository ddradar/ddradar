import { createLocalVue, mount } from '@vue/test-utils'
import Buefy from 'buefy'

import IndexPage from '~/pages/index.vue'

const localVue = createLocalVue()
localVue.use(Buefy)

describe('pages/index.vue', () => {
  test('renders correctly', () => {
    const wrapper = mount(IndexPage, { localVue })
    expect(wrapper).toMatchSnapshot()
  })
})
