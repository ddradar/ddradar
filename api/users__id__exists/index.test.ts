import type { Context } from '@azure/functions'
import { privateUser } from '@ddradar/core/__tests__/data'

import existsUser from '.'

describe('GET /api/v1/users/{id}/exists', () => {
  const context: Pick<Context, 'bindingData'> = { bindingData: {} }
  beforeEach(() => (context.bindingData = {}))

  test('/not_exists_user/exists returns "200 OK" with { exists: false }', async () => {
    // Arrange
    const id = 'not_exists_user'
    context.bindingData.id = id

    // Act
    const result = await existsUser(context, null, [])

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toStrictEqual({ id, exists: false })
  })

  test(`/${privateUser.id}/exists returns "200 OK" with { exists: true }`, async () => {
    // Arrange
    context.bindingData.id = privateUser.id

    // Act
    const result = await existsUser(context, null, [privateUser])

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toStrictEqual({ id: privateUser.id, exists: true })
  })
})
