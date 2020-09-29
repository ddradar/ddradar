import type { Container } from '@azure/cosmos'
import { mocked } from 'ts-jest/utils'

import { getContainer } from '../../db'
import { fetchGrooveRadar, GrooveRadarSchema } from '../../db/user-details'

jest.mock('../../db')

describe('/db/user-details.ts', () => {
  describe('fetchGrooveRadar', () => {
    let resources: (GrooveRadarSchema & { id: string })[] = []
    const radar: GrooveRadarSchema & { id: string } = {
      id: 'foo',
      userId: 'public_user',
      type: 'radar',
      playStyle: 1,
      stream: 100,
      voltage: 100,
      air: 100,
      freeze: 100,
      chaos: 100,
    }

    const container = {
      items: {
        query: jest.fn(() => ({ fetchAll: async () => ({ resources }) })),
      },
    }
    beforeAll(() =>
      mocked(getContainer).mockReturnValue((container as unknown) as Container)
    )
    beforeEach(() => {
      container.items.query.mockClear()
      resources = []
    })

    test('() returns null if not found', async () => {
      // Arrange
      const userId = 'public_user'
      const playStyle = 2

      // Act
      const result = await fetchGrooveRadar(userId, playStyle)

      expect(result).toBeNull()
      expect(container.items.query).toBeCalled()
    })

    test('() returns groove radar if found', async () => {
      // Arrange
      const userId = 'public_user'
      const playStyle = 1
      resources.push(radar)

      // Act
      const result = await fetchGrooveRadar(userId, playStyle)

      expect(result).toBe(radar)
      expect(container.items.query).toBeCalled()
    })
  })
})
