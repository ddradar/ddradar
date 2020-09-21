import type { Context } from '@azure/functions'
import { mocked } from 'ts-jest/utils'

import { CourseSchema, fetchCourseInfo } from '../db/songs'
import getCourseInfo from '.'

jest.mock('../db/songs')

describe('GET /api/v1/courses', () => {
  let context: Pick<Context, 'bindingData'>
  const course: CourseSchema = {
    id: 'o1Q8Ol8Dol9b0dllD6P0iPQbIoP666Db',
    name: '皆伝',
    nameIndex: -2,
    nameKana: '2-11',
    series: 'DanceDanceRevolution A20',
    minBPM: 23,
    maxBPM: 840,
    charts: [
      {
        playStyle: 2,
        difficulty: 4,
        level: 19,
        notes: 634 + 640 + 759 + 804,
        freezeArrow: 45 + 10 + 28 + 1,
        shockArrow: 0,
        order: [
          {
            songId: '186dd6DQq891Ib9Ilq8Qbo8lIqb0Qoll',
            songName: 'Valkyrie dimension',
            playStyle: 2,
            difficulty: 4,
            level: 19,
          },
          {
            songId: 'q6di1DQbi88i9QlPol1iIPbb8lP1qP1b',
            songName: 'POSSESSION',
            playStyle: 2,
            difficulty: 4,
            level: 19,
          },
          {
            songId: '6bid6d9qPQ80DOqiidQQ891o6Od8801l',
            songName: 'Over The “Period”',
            playStyle: 2,
            difficulty: 4,
            level: 19,
          },
          {
            songId: '9i0q91lPPiO61b9P891O1i86iOP1I08O',
            songName: 'EGOISM 440',
            playStyle: 2,
            difficulty: 4,
            level: 19,
          },
        ],
      },
    ],
  }
  beforeEach(() => {
    context = { bindingData: {} }
    mocked(fetchCourseInfo).mockClear()
    mocked(fetchCourseInfo).mockResolvedValue(course)
  })

  test(`/${course.id} calls fetchCourseInfo("${course.id}")`, async () => {
    // Arrange
    context.bindingData.id = course.id

    // Act
    const result = await getCourseInfo(context)

    // Assert
    expect(result.status).toBe(200)
    expect(result.body).toBe(course)
    expect(mocked(fetchCourseInfo)).toBeCalledWith(course.id)
  })

  test(`/foo returns "404 Not Found" if fetchCourseInfo("foo") returns null`, async () => {
    // Arrange
    mocked(fetchCourseInfo).mockResolvedValue(null)
    context.bindingData.id = 'foo'

    // Act
    const result = await getCourseInfo(context)

    // Assert
    expect(result.status).toBe(404)
    expect(mocked(fetchCourseInfo)).toBeCalledWith('foo')
  })
})
