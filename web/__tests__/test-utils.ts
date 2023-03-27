import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, Suspense } from 'vue'

export const mountAsync = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: any,
  options: Parameters<typeof mount>[1]
) => {
  const wrapper = mount(
    defineComponent({
      render() {
        return h(Suspense, null, {
          default: h(component),
          fallback: h('div', 'fallback'),
        })
      },
    }),
    options
  )

  await flushPromises()
  return wrapper
}
