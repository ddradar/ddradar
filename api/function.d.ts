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
