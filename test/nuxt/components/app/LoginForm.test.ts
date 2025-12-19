import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, test } from 'vitest'

import LoginForm from '~/components/app/LoginForm.vue'

describe('app/components/app/LoginForm.vue', () => {
  test('renders properly', async () => {
    const wrapper = await mountSuspended(LoginForm)
    expect(wrapper.html()).toMatchSnapshot()
  })
})
