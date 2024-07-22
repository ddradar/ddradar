import type { Difficulty } from '@ddradar/core'
import { difficultyMap } from '@ddradar/core'
import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import DifficultyBadge from '~/components/song/DifficultyBadge.vue'

describe('components/song/DifficultyBadge.vue', () => {
  test.each([...difficultyMap.keys()])(
    '{ difficulty: %i } snapshot test',
    i => {
      // Arrange - Act
      const props = { difficulty: i as Difficulty }
      const wrapper = mount(DifficultyBadge, { props })
      // Assert
      expect(wrapper.element).toMatchSnapshot()
    }
  )
})
