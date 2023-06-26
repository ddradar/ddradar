import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { mount } from '@vue/test-utils'
import { describe, expect, test } from 'vitest'

import DialogModal from '~~/components/modal/DialogModal.vue'

describe('components/modal/DialogModal.vue', () => {
  describe('snapshot test', () => {
    test.each([
      { message: 'Message Only' },
      { message: 'Information', variant: 'info' },
      { title: 'Error!', message: 'Description', variant: 'error' },
    ])('%o rendars collectly', props => {
      const wrapper = mount(DialogModal, {
        props,
        global: { plugins: [[Oruga, bulmaConfig]] },
      })
      expect(wrapper.element).toMatchSnapshot()
    })
  })

  describe('event', () => {
    const props = { message: 'Message' }

    test('close button emits "canceled" event', () => {
      // Arrange
      const wrapper = mount(DialogModal, {
        props,
        global: { plugins: [[Oruga, bulmaConfig]] },
      })

      // Act
      wrapper.find('button#canceled').trigger('click')

      // Assert
      expect(wrapper.emitted().close[0]).toStrictEqual(['canceled'])
    })

    test('"Yes" button emits "yes" event', () => {
      // Arrange
      const wrapper = mount(DialogModal, {
        props,
        global: { plugins: [[Oruga, bulmaConfig]] },
      })

      // Act
      wrapper.find('button#yes').trigger('click')

      // Assert
      expect(wrapper.emitted().close[0]).toStrictEqual(['yes'])
    })

    test('"No" button emits "no" event', () => {
      // Arrange
      const wrapper = mount(DialogModal, {
        props,
        global: { plugins: [[Oruga, bulmaConfig]] },
      })

      // Act
      wrapper.find('button#no').trigger('click')

      // Assert
      expect(wrapper.emitted().close[0]).toStrictEqual(['no'])
    })
  })
})
