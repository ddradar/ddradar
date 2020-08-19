import type { BuefyNamespace } from 'buefy/types'

const option = { position: 'is-top', hasIcon: true } as const

export function success(
  $buefy: Pick<BuefyNamespace, 'notification'>,
  message: string
) {
  $buefy.notification.open({ message, type: 'is-success', ...option })
}

export function warning(
  $buefy: Pick<BuefyNamespace, 'notification'>,
  message: string
) {
  $buefy.notification.open({ message, type: 'is-warning', ...option })
}

export function danger(
  $buefy: Pick<BuefyNamespace, 'notification'>,
  message: string
) {
  $buefy.notification.open({ message, type: 'is-danger', ...option })
}
