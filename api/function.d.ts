export type NotFoundResult = {
  status: 404
  body: string
}

export type SuccessResult<T> = {
  status: 200
  headers: { 'Content-type': 'application/json' }
  body: T
}
