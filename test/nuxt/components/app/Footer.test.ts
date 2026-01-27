import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, test } from 'vitest'

import Footer from '~/components/app/Footer.vue'

describe('app/components/app/Footer.vue', () => {
  test('renders footer with copyright and community links', async () => {
    // Arrange - Act
    const wrapper = await mountSuspended(Footer)

    // Assert
    expect(wrapper.html()).toMatchSnapshot()
  })
})
