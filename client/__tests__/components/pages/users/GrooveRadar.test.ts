import { mount, shallowMount, Wrapper } from '@vue/test-utils'

import GrooveRadar from '~/components/pages/users/GrooveRadar.vue'

describe('/components/pages/users/GrooveRadar.vue', () => {
  describe('snapshot test', () => {
    test('renders correctly', async () => {
      const chart = {
        stream: 120,
        voltage: 100,
        air: 266,
        freeze: 200,
        chaos: 140,
      }
      const wrapper = mount(GrooveRadar, { propsData: { chart } })
      await wrapper.vm.$nextTick()
      expect(wrapper).toMatchSnapshot()
    })
  })

  describe('renderLabel', () => {
    let wrapper: Wrapper<GrooveRadar>
    beforeEach(() => (wrapper = shallowMount(GrooveRadar)))

    test.each([
      [{}, {}],
      [{ index: 0 }, {}],
      [{}, { labels: ['foo'] }],
      [{}, { labels: [['foo']] }],
    ])('(%p, %p) returns ""', (toolTip, data) => {
      // @ts-ignore
      expect(wrapper.vm.renderLabel(toolTip, data)).toBe('')
    })
    test.each([
      [0, ['foo'], 'foo'],
      [0, [['foo']], 'foo'],
      [1, ['foo', 'bar'], 'bar'],
      [1, [['foo', 'bar'], ['baz']], 'baz'],
    ])(
      '({ index: %i }, { labels: %p }) returns "%s"',
      (index, labels, expected) => {
        // @ts-ignore
        expect(wrapper.vm.renderLabel({ index }, { labels })).toBe(expected)
      }
    )
  })
})
