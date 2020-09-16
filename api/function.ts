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
 * Get number data from route bindings.
 * workaround for https://github.com/Azure/azure-functions-host/issues/6055
 */
export function getBindingData(
  bindingData: {
    [key: string]: unknown
  },
  key: string
): number {
  const value = bindingData[key]
  return typeof value === 'number' ? value : 0
}
