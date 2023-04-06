import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { RouterLinkStub } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import Page from '~~/pages/index.vue'
import { mountAsync } from '~~/test/test-utils'

describe('Page /', () => {
  test('renders expected menu', async () => {
    // Arrange - Act
    const wrapper = await mountAsync(Page, {
      global: {
        plugins: [[Oruga, bulmaConfig]],
        stubs: { NuxtLink: RouterLinkStub },
      },
    })

    // Assert
    expect(wrapper.element).toMatchSnapshot()
  })
})
