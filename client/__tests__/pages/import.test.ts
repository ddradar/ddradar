import { createLocalVue, mount, shallowMount, Wrapper } from '@vue/test-utils'
import Buefy from 'buefy'

import ImportPage from '~/pages/import.vue'

const localVue = createLocalVue()
localVue.use(Buefy)

describe('pages/import.vue', () => {
  let wrapper: Wrapper<ImportPage>
  beforeEach(() => {
    wrapper = shallowMount(ImportPage, { localVue })
  })

  test('renders correctly', () => {
    const wrapper = mount(ImportPage, { localVue })
    expect(wrapper).toMatchSnapshot()
  })

  describe('register button', () => {
    test('has no disabled attribute if sourceCode is valid', async () => {
      // Arrange - Act
      wrapper.setData({ sourceCode: '<html></html>', loading: false })
      await wrapper.vm.$nextTick()

      // Assert
      const button = wrapper.find('b-button-stub')
      expect(button.attributes().disabled).toBeFalsy()
      expect(button.attributes().loading).toBeFalsy()
    })
    test('has disabled attribute if sourceCode is invalid', async () => {
      // Arrange - Act
      wrapper.setData({ sourceCode: '', loading: false })
      await wrapper.vm.$nextTick()

      // Assert
      const button = wrapper.find('b-button-stub')
      expect(button.attributes().disabled).toBeTruthy()
      expect(button.attributes().loading).toBeFalsy()
    })
    test('has loading attribute if loading state', async () => {
      // Arrange - Act
      wrapper.setData({ sourceCode: '', loading: true })
      await wrapper.vm.$nextTick()

      // Assert
      const button = wrapper.find('b-button-stub')
      expect(button.attributes().loading).toBeTruthy()
    })
  })
})
