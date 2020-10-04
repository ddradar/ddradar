import type { Container } from '@azure/cosmos'
import { mocked } from 'ts-jest/utils'

import { getContainer } from '../../db'
import { generateGrooveRadar, GrooveRadarSchema } from '../../db/user-details'

jest.mock('../../db')

describe('/db/user-details.ts', () => {
  describe('generateGrooveRadar()', () => {
    let resources: GrooveRadarSchema[] = []
    const radar: GrooveRadarSchema = {
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

    test('returns groove radar', async () => {
      // Arrange
      resources.push(radar)

      // Act
      const result = await generateGrooveRadar('public_user', 1)

      // Assert
      expect(result).toStrictEqual({ ...radar, id: 'radar-public_user-1' })
      expect(container.items.query).toBeCalled()
    })

    test('() returns empty groove radar if scores is empty', async () => {
      // Arrange - Act
      const result = await generateGrooveRadar('public_user', 1)

      expect(result).toStrictEqual({
        ...radar,
        id: 'radar-public_user-1',
        stream: 0,
        voltage: 0,
        air: 0,
        freeze: 0,
        chaos: 0,
      })
      expect(container.items.query).toBeCalled()
    })
  })
})
