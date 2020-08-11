import { createLocalVue, mount, shallowMount, Wrapper } from '@vue/test-utils'
import Buefy from 'buefy'
import { mocked } from 'ts-jest/utils'

import ImportPage from '~/pages/import.vue'
import * as notification from '~/utils/notification'

jest.mock('~/utils/notification')

const localVue = createLocalVue()
localVue.use(Buefy)

describe('pages/import.vue', () => {
  let wrapper: Wrapper<ImportPage>
  const $http = {
    $post: jest.fn((_url, _body, _options) => Promise.resolve({ count: 1 })),
  }
  const $buefy = { notification: {} }
  beforeEach(() => {
    $http.$post.mockClear()
    wrapper = shallowMount(ImportPage, { localVue, mocks: { $http, $buefy } })
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
  describe('importEageteScores()', () => {
    test('calls "api/v1/scores" API', async () => {
      // Arrange
      wrapper.setData({ sourceCode: '<html></html>', loading: false })
      await wrapper.vm.$nextTick()
      const successMock = mocked(notification.success)
      $http.$post.mockResolvedValueOnce({ count: 5 })

      // Act
      // @ts-ignore
      await wrapper.vm.importEageteScores()

      // Assert
      expect($http.$post).lastCalledWith('/api/v1/scores', {
        type: 'eagate_music_data',
        body: '<html></html>',
      })
      expect(successMock).lastCalledWith($buefy, '5件のスコアを登録しました')
    })
    test('shows warning message if API returns 400', async () => {
      // Arrange
      wrapper.setData({ sourceCode: '<html></html>', loading: false })
      await wrapper.vm.$nextTick()
      const warningMock = mocked(notification.warning)
      $http.$post.mockRejectedValueOnce({ message: '400' })

      // Act
      // @ts-ignore
      await wrapper.vm.importEageteScores()

      // Assert
      expect(warningMock).lastCalledWith($buefy, 'HTMLソース文字列が不正です')
    })
    test('shows error message if API returns ErrorCode', async () => {
      // Arrange
      const errorMessage = '500 Server Error'
      wrapper.setData({ sourceCode: '<html></html>', loading: false })
      await wrapper.vm.$nextTick()
      const dangerMock = mocked(notification.danger)
      $http.$post.mockRejectedValueOnce(errorMessage)

      // Act
      // @ts-ignore
      await wrapper.vm.importEageteScores()

      // Assert
      expect(dangerMock).lastCalledWith($buefy, errorMessage)
    })
  })
})
