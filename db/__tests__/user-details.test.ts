import type { Database } from '@ddradar/core'
import { mocked } from 'ts-jest/utils'

import { fetchGroupedList, fetchList } from '../database'
import { fetchClearAndScoreStatus, generateGrooveRadar } from '../user-details'

jest.mock('../database')

describe('user-details.ts', () => {
  describe('generateGrooveRadar()', () => {
    const radar: Database.GrooveRadarSchema = {
      userId: 'public_user',
      type: 'radar',
      playStyle: 1,
      stream: 100,
      voltage: 100,
      air: 100,
      freeze: 100,
      chaos: 100,
    }

    test('returns groove radar', async () => {
      // Arrange
      mocked(fetchGroupedList).mockResolvedValue([{ ...radar }])

      // Act
      const result = await generateGrooveRadar('public_user', 1)

      // Assert
      expect(result).toStrictEqual({ ...radar, id: 'radar-public_user-1' })
      expect(mocked(fetchGroupedList)).toBeCalledWith(
        'Scores',
        [
          'userId',
          '"radar" AS type',
          'playStyle',
          'MAX(c.radar.stream) AS stream',
          'MAX(c.radar.voltage) AS voltage',
          'MAX(c.radar.air) AS air',
          'MAX(c.radar.freeze) AS freeze',
          'MAX(c.radar.chaos) AS chaos',
        ],
        [
          { condition: 'c.userId = @', value: 'public_user' },
          { condition: 'c.playStyle = @', value: 1 },
          { condition: 'IS_DEFINED(c.radar)' },
          {
            condition:
              '((NOT IS_DEFINED(c.ttl)) OR c.ttl = -1 OR c.ttl = null)',
          },
        ],
        ['userId', 'playStyle']
      )
    })

    test('returns empty groove radar if scores is empty', async () => {
      // Arrange
      mocked(fetchGroupedList).mockResolvedValue([])

      // Act
      const result = await generateGrooveRadar('public_user', 1)
      const emptyRadar = { stream: 0, voltage: 0, air: 0, freeze: 0, chaos: 0 }

      expect(result).toStrictEqual({
        ...radar,
        ...emptyRadar,
        id: 'radar-public_user-1',
      })
      expect(mocked(fetchGroupedList)).toBeCalled()
    })
  })

  describe('fetchClearAndScoreStatus()', () => {
    test('calls fetchList("UserDetails")', async () => {
      // Arrange
      mocked(fetchList).mockResolvedValue([])

      // Act
      const result = await fetchClearAndScoreStatus('foo')

      // Assert
      expect(result).toHaveLength(0)
      expect(mocked(fetchList)).toBeCalledWith(
        'UserDetails',
        '*',
        [
          { condition: 'c.userId = @', value: 'foo' },
          { condition: 'c.type = "clear" OR c.type = "score"' },
        ],
        { _ts: 'ASC' }
      )
    })
  })
})
