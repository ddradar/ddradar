import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import Card from '~/components/Card.vue'

describe('components/Card.vue', () => {
  test.each([
    { title: 'title', variant: 'primary' },
    { title: 'title', variant: 'danger', collapsible: true, open: false },
    { title: 'title', variant: 'info', collapsible: true, open: true },
  ])('(%o) snapshot test', props => {
    const wrapper = mount(Card, {
      props,
      global: { plugins: [[Oruga, bulmaConfig]] },
    })
    expect(wrapper.element).toMatchSnapshot()
  })
})
