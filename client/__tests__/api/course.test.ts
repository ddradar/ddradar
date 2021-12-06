import { getCourseInfo, getCourseType } from '~/api/course'

describe('./api/course.ts', () => {
  describe('getCourseType', () => {
    test.each([
      [1, 'NONSTOP'],
      [2, '段位認定'],
      [0, ''],
    ])('(%i) returns "%s"', (type, expected) => {
      expect(getCourseType(type)).toBe(expected)
    })
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
