/* eslint-disable node/no-process-env */
import type { Context } from '@azure/functions'

import getSongInfo from '../getSongInfo'

describe('/getSongInfo', () => {
  let context: Context
  const storedEnv = { ...process.env }

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...storedEnv }
    context = {
      log: (jest.fn() as unknown) as typeof context.log,
    } as Context
  })
  afterEach(() => (process.env = { ...storedEnv }))

  test('exports function', () => {
    expect(typeof getSongInfo).toBe('function')
  })

  test('returns Status:400(Bad Request) if query.id is undefined', async () => {
    await getSongInfo(context, { query: {} })
    expect(context.res.status).toBe(400)
  })

  test('returns Status:500(Internal Server Error) if COSMOS_DB_CONN is undefined', async () => {
    process.env.COSMOS_DB_CONN = undefined
    await getSongInfo(context, { query: { id: 'foo' } })
    expect(context.res.status).toBe(500)
  })
})
