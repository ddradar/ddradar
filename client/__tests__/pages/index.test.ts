import { createLocalVue, mount, RouterLinkStub } from '@vue/test-utils'
import Buefy from 'buefy'

import type { Notification } from '~/api/notification'
import IndexPage from '~/pages/index.vue'

const localVue = createLocalVue()
localVue.use(Buefy)

describe('/pages/index.vue', () => {
  describe('snapshot test', () => {
    const messages: Omit<Notification, 'sender' | 'pinned'>[] = [
      {
        id: 'foo',
        icon: 'account',
        type: 'is-info',
        title: 'Title 1',
        body: 'Message Body1',
        timeStamp: 1597244400, // 2020/8/13
      },
      {
        id: 'bar',
        icon: '',
        type: 'is-info',
        title: 'Title 2',
        body: 'Message Body2',
        timeStamp: 1597244400, // 2020/8/13
      },
    ]
    test('renders loading skeleton', () => {
      const wrapper = mount(IndexPage, {
        localVue,
        mocks: { $fetchState: { pending: true } },
        stubs: { NuxtLink: RouterLinkStub, TopMessage: true },
        data: () => ({ messages }),
      })
      expect(wrapper).toMatchSnapshot()
    })
    test('renders correctly', () => {
      const wrapper = mount(IndexPage, {
        localVue,
        mocks: { $fetchState: { pending: false } },
        stubs: { NuxtLink: RouterLinkStub, TopMessage: true },
        data: () => ({ messages }),
      })
      expect(wrapper).toMatchSnapshot()
    })
  })
})
