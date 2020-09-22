import type { Context } from '@azure/functions'

import existsUser from '.'

describe('GET /api/v1/users/exists/{id}', () => {
  const context: Pick<Context, 'bindingData'> = { bindingData: {} }
  beforeEach(() => (context.bindingData = {}))

  test('returns "200 OK" with not exists JSON body if documents is empty', async () => {
    // Arrange
    const id = 'phantom_user'
    context.bindingData.id = id

    // Act
    const result = await existsUser(context, null, [])

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toStrictEqual({ id, exists: false })
  })

  test('returns "200 OK" with exists JSON body if documents is not empty', async () => {
    // Arrange
    const id = 'exists_user'
    context.bindingData.id = id

    // Act
    const result = await existsUser(context, null, [{}])

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toStrictEqual({ id, exists: true })
  })
})
