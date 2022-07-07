export class SuccessResult<T> {
  status = 200 as const
  headers = {
    'Content-type': 'application/json' as const,
    'Access-Control-Allow-Origin': 'https://p.eagate.573.jp',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
  }
  constructor(public body: T) {}
}

type ErrorCode = 400 | 401 | 404
export class ErrorResult<T extends ErrorCode> {
  constructor(public status: T, public body?: string) {}
}

export type NoContentResult = {
  status: 204
}

/**
 * Get context.bindingData[key] as number
 * workaround for https://github.com/Azure/azure-functions-nodejs-worker/issues/377
 */
export function getBindingNumber(
  bindingData: { [key: string]: unknown },
  key: string
): number {
  return typeof bindingData[key] === 'number' ? (bindingData[key] as number) : 0
}
