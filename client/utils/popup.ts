import type { BuefyNamespace } from 'buefy/types'

type BuefyInstance = Pick<BuefyNamespace, 'notification'>

export function success($buefy: BuefyInstance, message: string) {
  callNotification($buefy, 'is-success', message)
}

export function warning($buefy: BuefyInstance, errorOrMessage: unknown) {
  callNotification($buefy, 'is-warning', convertToMessage(errorOrMessage))
}

export function danger($buefy: BuefyInstance, error: unknown) {
  callNotification($buefy, 'is-danger', convertToMessage(error))
}

function callNotification(
  $buefy: BuefyInstance,
  type: string,
  message: string
) {
  $buefy.notification.open({ message, type, position: 'is-top', hasIcon: true })
}

function convertToMessage(error: unknown) {
  return error instanceof Error ? error.message : `${error}`
}
