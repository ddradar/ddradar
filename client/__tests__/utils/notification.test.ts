import { BNotificationConfig } from 'buefy/types/components'

import * as notification from '~/utils/notification'

describe('utils/notification.ts', () => {
  const $buefy = {
    notification: { open: jest.fn<any, [BNotificationConfig | string]>() },
  }
  const message = 'message'
  beforeEach(() => $buefy.notification.open.mockClear())

  describe('success', () => {
    test('($buefy, message) calls $buefy.notification.open("is-success")', () => {
      // Arrange - Act
      notification.success($buefy, message)

      // Assert
      expect($buefy.notification.open).toHaveBeenCalledTimes(1)
      expect($buefy.notification.open).lastCalledWith({
        message,
        type: 'is-success',
        position: 'is-top',
        hasIcon: true,
      })
    })
  })
  describe('warning', () => {
    test('($buefy, message) calls $buefy.notification.open("is-warning")', () => {
      // Arrange - Act
      notification.warning($buefy, message)

      // Assert
      expect($buefy.notification.open).toHaveBeenCalledTimes(1)
      expect($buefy.notification.open).lastCalledWith({
        message,
        type: 'is-warning',
        position: 'is-top',
        hasIcon: true,
      })
    })
  })
  describe('danger', () => {
    test('($buefy, message) calls $buefy.notification.open("is-danger")', () => {
      // Arrange - Act
      notification.danger($buefy, message)

      // Assert
      expect($buefy.notification.open).toHaveBeenCalledTimes(1)
      expect($buefy.notification.open).lastCalledWith({
        message,
        type: 'is-danger',
        position: 'is-top',
        hasIcon: true,
      })
    })
  })
})
