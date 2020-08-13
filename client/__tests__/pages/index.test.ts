import { createLocalVue, mount, RouterLinkStub } from '@vue/test-utils'
import Buefy from 'buefy'

import type { Notification } from '~/api/notification'
import IndexPage from '~/pages/index.vue'

const localVue = createLocalVue()
localVue.use(Buefy)

describe('/pages/index.vue', () => {
  test('renders correctly', () => {
    const messages: Omit<Notification, 'sender' | 'pinned'>[] = [
      {
        id: 'foo',
        icon: 'account',
        type: 'is-info',
        title: 'Title 1',
        body: 'Message Body1',
        _ts: 1597244400, // 2020/8/13
      },
      {
        id: 'bar',
        icon: '',
        type: 'is-info',
        title: 'Title 2',
        body: 'Message Body2',
        _ts: 1597244400, // 2020/8/13
      },
    ]
    const wrapper = mount(IndexPage, {
      localVue,
      stubs: { NuxtLink: RouterLinkStub, TopMessage: true },
      data: () => ({ messages }),
    })
    expect(wrapper).toMatchSnapshot()
  })
})
