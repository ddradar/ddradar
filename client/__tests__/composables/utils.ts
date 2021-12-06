import { defineComponent, SetupFunction } from '@nuxtjs/composition-api'

export function createMockComponent<T>(setup: SetupFunction<{}, T>) {
  return defineComponent({ setup, template: '<div></div>' })
}
