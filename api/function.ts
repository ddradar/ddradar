export type BadRequestResult = {
  status: 400
  body?: string
}

export type UnauthenticatedResult = {
  status: 401
  body?: string
}

export type NotFoundResult = {
  status: 404
  body?: string
}

export type SuccessResult<T> = {
  status: 200
  headers: { 'Content-type': 'application/json' }
  body: T
}

export type NoContentResult = {
  status: 204
}

/**
 * Get context.bindingData[key] as number
 * workaround for https://github.com/Azure/azure-functions-host/issues/6055
 */
export function getBindingNumber(
  bindingData: { [key: string]: unknown },
  key: string
): number {
  return typeof bindingData[key] === 'number' ? (bindingData[key] as number) : 0
}

/**
 * Get context.bindingData[key] as string
 * workaround for https://github.com/Azure/azure-functions-host/issues/6055
 */
export function getBindingString(
  bindingData: { [key: string]: unknown },
  key: string
): string {
  return typeof bindingData[key] === 'string'
    ? (bindingData[key] as string)
    : '0'
}
