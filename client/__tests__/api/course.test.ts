import { CourseInfo, getCourseInfo, getCourseList } from '~/api/course'

describe('api/course.ts', () => {
  describe('getCourseList', () => {
    type Option = { searchParams: URLSearchParams }
    const $http = {
      $get: jest.fn<Promise<any>, [string, Option]>((_1, _2) =>
        Promise.resolve([])
      ),
    }
    beforeEach(() => $http.$get.mockClear())

    test.each([
      [undefined, undefined, ''] as const,
      [undefined, 1, 'type=1'] as const,
      [undefined, 2, 'type=2'] as const,
      [16, undefined, 'series=16'] as const,
      [17, undefined, 'series=17'] as const,
      [16, 1, 'series=16&type=1'] as const,
      [16, 2, 'series=16&type=2'] as const,
      [17, 1, 'series=17&type=1'] as const,
      [17, 2, 'series=17&type=2'] as const,
    ])(
      '($http, %i, %i) calls /api/v1/courses?%s',
      async (series, type, query) => {
        // Arrange - Act
        const result = await getCourseList($http, series, type)

        // Assert
        expect(result).toHaveLength(0)
        expect($http.$get).toBeCalledTimes(1)
        expect($http.$get.mock.calls[0][0]).toBe('/api/v1/courses')
        expect($http.$get.mock.calls[0][1].searchParams.toString()).toBe(query)
      }
    )
  })
  describe('getCourseInfo', () => {
    const courseInfo: CourseInfo = {
      id: 'DQqi68IP1qbDiQ9li6PI1Q9Iddd6o9QQ',
      name: '九段',
      nameKana: 'D-A20PLUS-2-09',
      nameIndex: -2,
      series: 'DanceDanceRevolution A20 PLUS',
      minBPM: 40,
      maxBPM: 400,
      charts: [
        {
          playStyle: 2,
          difficulty: 4,
          level: 18,
          notes: 2487,
          freezeArrow: 134,
          shockArrow: 0,
          order: [
            {
              songId: '18l0blb188Oqqi8I68o8oq91Qbq86QDi',
              songName: 'Magnetic',
              playStyle: 2,
              difficulty: 4,
              level: 17,
            },
            {
              songId: 'd810q0I8q6d0l1POlIO6d66bOPb96dql',
              songName: 'Triple Counter',
              playStyle: 2,
              difficulty: 3,
              level: 17,
            },
            {
              songId: 'o0l1Qioq1i9iQl6b9q6il0iqi1b1OQ9b',
              songName: 'New Decade',
              playStyle: 2,
              difficulty: 3,
              level: 17,
            },
            {
              songId: '606b9d6OiliId69bO9Odi6qq8o8Qd0dq',
              songName: 'PARANOiA Revolution',
              playStyle: 2,
              difficulty: 3,
              level: 18,
            },
          ],
        },
      ],
    }
    const $http = {
      $get: jest.fn<Promise<any>, [string]>(_ => Promise.resolve(courseInfo)),
    }
    beforeEach(() => $http.$get.mockClear())

    test(`($http, ${courseInfo.id}) calls GET /api/v1/courses/${courseInfo.id}`, async () => {
      // Arrange - Act
      const result = await getCourseInfo($http, courseInfo.id)

      // Assert
      expect(result).toBe(courseInfo)
      expect($http.$get).toBeCalledTimes(1)
      expect($http.$get).toBeCalledWith(`/api/v1/courses/${courseInfo.id}`)
    })
  })
})
