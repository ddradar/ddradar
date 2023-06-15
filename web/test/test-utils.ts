import type { ComponentMountingOptions } from '@vue/test-utils'
import { flushPromises, mount } from '@vue/test-utils'
import type { DefineComponent } from 'vue'
import { defineComponent, h, Suspense } from 'vue'

export async function mountAsync<T>(
  component: T,
  options?: ComponentMountingOptions<T>
) {
  const { props, ..._options } = options ?? {}
  const wrapper = mount(
    defineComponent({
      render() {
        return h(Suspense, null, {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          default: h(component as DefineComponent<any, any>, props),
          fallback: h('div', 'fallback'),
        })
      },
    }),
    _options
  )

  await flushPromises()
  return wrapper
}
