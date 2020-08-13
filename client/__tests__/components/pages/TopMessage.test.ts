import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import Buefy from 'buefy'

import TopMessage from '~/components/pages/TopMessage.vue'

const localVue = createLocalVue()
localVue.use(Buefy)

describe('/components/pages/TopMessage.vue', () => {
  /** 2020/8/13 0:00 (Local Time zone) */
  const time = Math.floor(new Date(2020, 7, 13).valueOf() / 1000)
  const propsData = {
    type: 'is-info',
    title: 'Title',
    body: 'Message Body',
    time,
  } as const

  describe('snapshot test', () => {
    test('renders default icon if not set', () => {
      // Arrange
      const wrapper = mount(TopMessage, {
        localVue,
        propsData: { ...propsData },
      })

      // Act - Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('renders specified icon', () => {
      // Arrange
      const wrapper = mount(TopMessage, {
        localVue,
        propsData: { ...propsData, icon: 'account' },
      })

      // Act - Assert
      expect(wrapper).toMatchSnapshot()
    })
  })
  describe('get date()', () => {
    const wrapper = shallowMount(TopMessage, {
      localVue,
      propsData: { ...propsData, time },
    })
    test.each([
      ['2020/8/13', time],
      ['2020/8/13', time + 1 * 60 * 60],
      ['2020/8/13', time + 2 * 60 * 60],
      ['2020/8/13', time + 3 * 60 * 60],
      ['2020/8/13', time + 4 * 60 * 60],
      ['2020/8/13', time + 5 * 60 * 60],
      ['2020/8/13', time + 6 * 60 * 60],
      ['2020/8/13', time + 7 * 60 * 60],
      ['2020/8/13', time + 8 * 60 * 60],
      ['2020/8/13', time + 9 * 60 * 60],
      ['2020/8/13', time + 10 * 60 * 60],
      ['2020/8/13', time + 11 * 60 * 60],
      ['2020/8/13', time + 12 * 60 * 60],
      ['2020/8/13', time + 13 * 60 * 60],
      ['2020/8/13', time + 14 * 60 * 60],
      ['2020/8/13', time + 15 * 60 * 60],
      ['2020/8/13', time + 16 * 60 * 60],
      ['2020/8/13', time + 17 * 60 * 60],
      ['2020/8/13', time + 18 * 60 * 60],
      ['2020/8/13', time + 19 * 60 * 60],
      ['2020/8/13', time + 10 * 60 * 60],
      ['2020/8/13', time + 21 * 60 * 60],
      ['2020/8/13', time + 22 * 60 * 60],
      ['2020/8/13', time + 23 * 60 * 60],
      ['2020/8/14', time + 24 * 60 * 60],
    ])('returns %s if time prop is %i', (expected, time) => {
      // Arrange
      wrapper.setProps({ ...propsData, time })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.date).toBe(expected)
    })
  })
})
