/**
 * @jest-environment node
 */
import type { BNotificationConfig } from 'buefy/types/components'

import * as popup from '~/utils/popup'

describe('utils/popup.ts', () => {
  const $buefy = {
    notification: { open: jest.fn<any, [BNotificationConfig | string]>() },
  }
  const message = 'message'
  beforeEach(() => $buefy.notification.open.mockClear())

  describe('success', () => {
    test('($buefy, message) calls $buefy.notification.open("is-success")', () => {
      // Arrange - Act
      popup.success($buefy, message)

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
      popup.warning($buefy, message)

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
      popup.danger($buefy, message)

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
