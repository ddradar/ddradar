import { getCourseInfo, getCourseList, getCourseType } from '~/api/course'

describe('api/course.ts', () => {
  describe('getCourseType', () => {
    test.each([
      [1, 'NONSTOP'],
      [2, '段位認定'],
      [0, ''],
    ])('(%i) returns "%s"', (type, expected) => {
      expect(getCourseType(type)).toBe(expected)
    })
  })
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
    const courseInfo = { id: 'DQqi68IP1qbDiQ9li6PI1Q9Iddd6o9QQ' }
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
