import { shallowMount, Wrapper } from '@vue/test-utils'

import GrooveRadarComponent from '~/components/pages/users/GrooveRadar.vue'

describe('/components/pages/users/GrooveRadar.vue', () => {
  describe('renderLabel', () => {
    let wrapper: Wrapper<GrooveRadarComponent>
    beforeEach(() => (wrapper = shallowMount(GrooveRadarComponent)))

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
