import { createLocalVue, mount } from '@vue/test-utils'
import Buefy from 'buefy'

import UserListPage from '~/pages/users/index.vue'

const localVue = createLocalVue()
localVue.use(Buefy)

describe('pages/users/index.vue', () => {
  test('renders correctly', () => {
    const wrapper = mount(UserListPage, { localVue })
    expect(wrapper).toMatchSnapshot()
  })
})
