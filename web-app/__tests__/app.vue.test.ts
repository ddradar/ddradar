import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import App from '~/app.vue'

describe('app.vue', () => {
  test('snapshot test', () => {
    const wrapper = mount(App, { global: { stubs: { NuxtWelcome: true } } })
    expect(wrapper.element).toMatchSnapshot()
  })
})
