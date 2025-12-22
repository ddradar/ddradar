export type ScoreUpsertResult = {
  severity: 'error' | 'warning'
  reason: keyof typeof Reason
  message: string
  column: number
  data: unknown
  details?: {
    fields?: Array<{ field: string; message: string }>
  }
}

const Reason = {
  CHART_NOT_FOUND: ['error', 'Chart not found'],
  MISSING_CHART_NOTES: [
    'warning',
    'Chart notes information is incomplete. ignore exScore and maxCombo.',
  ],
  MISSING_REQUIRED_PROPERTIES: [
    'error',
    'Missing required properties and cannot detect other properties.',
  ],
  VALIDATION_FAILED: ['error', 'Score validation failed.'],
  LOWER_THAN_EXISTING: [
    'warning',
    'Score not updated because existing score is higher.',
  ],
} as const

export function getReason(
  reason: keyof typeof Reason,
  column: number,
  data: unknown,
  message?: string,
  details?: ScoreUpsertResult['details']
): ScoreUpsertResult {
  const [severity, defaultMessage] = Reason[reason]
  message ??= defaultMessage
  return {
    severity,
    reason,
    message,
    column,
    data,
    ...(details && { details }),
  }
}
