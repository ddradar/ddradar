import type { CourseInfo } from '@core/api/course'
import type { Context } from '@nuxt/types'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { mocked } from 'ts-jest/utils'

import { getCourseInfo } from '~/api/course'
import CourseDetailPage from '~/pages/courses/_id/index.vue'

jest.mock('~/api/course')
const localVue = createLocalVue()

describe('pages/courses/_id/index.vue', () => {
  const course: CourseInfo = {
    id: 'I90bQ81P1blOPIdd9PPl6I9D8DQ1dIob',
    name: 'TWENTY',
    nameKana: 'C-A20-2',
    nameIndex: -1,
    series: 'DanceDanceRevolution A20',
    minBPM: 128,
    maxBPM: 180,
    charts: [
      {
        playStyle: 1,
        difficulty: 0,
        level: 4,
        notes: 438,
        freezeArrow: 26,
        shockArrow: 0,
        order: [
          {
            songId: 'PdPdbdQ1lDI18O90Q0li8QI0bo99bidd',
            songName: 'This Beat Is.....',
            playStyle: 1,
            difficulty: 0,
            level: 1,
          },
          {
            songId: 'PPQb966D6Ql6Q8iPo68810PdDiI6D0bl',
            songName: 'Waiting',
            playStyle: 1,
            difficulty: 0,
            level: 3,
          },
          {
            songId: '6iO8d9ld00I6lDIO6qbOldP99oqloqb9',
            songName: 'Dead Heat',
            playStyle: 1,
            difficulty: 0,
            level: 4,
          },
          {
            songId: '1iDPo19Pb9ooi8OqiidbqPb06DDdqiqo',
            songName: 'Neverland',
            playStyle: 1,
            difficulty: 0,
            level: 4,
          },
        ],
      },
      {
        playStyle: 1,
        difficulty: 1,
        level: 8,
        notes: 782,
        freezeArrow: 36,
        shockArrow: 0,
        order: [
          {
            songId: 'PdPdbdQ1lDI18O90Q0li8QI0bo99bidd',
            songName: 'This Beat Is.....',
            playStyle: 1,
            difficulty: 1,
            level: 4,
          },
          {
            songId: 'PPQb966D6Ql6Q8iPo68810PdDiI6D0bl',
            songName: 'Waiting',
            playStyle: 1,
            difficulty: 1,
            level: 6,
          },
          {
            songId: '6iO8d9ld00I6lDIO6qbOldP99oqloqb9',
            songName: 'Dead Heat',
            playStyle: 1,
            difficulty: 1,
            level: 6,
          },
          {
            songId: '1iDPo19Pb9ooi8OqiidbqPb06DDdqiqo',
            songName: 'Neverland',
            playStyle: 1,
            difficulty: 1,
            level: 8,
          },
        ],
      },
      {
        playStyle: 1,
        difficulty: 2,
        level: 12,
        notes: 1146,
        freezeArrow: 56,
        shockArrow: 0,
        order: [
          {
            songId: 'PdPdbdQ1lDI18O90Q0li8QI0bo99bidd',
            songName: 'This Beat Is.....',
            playStyle: 1,
            difficulty: 2,
            level: 7,
          },
          {
            songId: 'PPQb966D6Ql6Q8iPo68810PdDiI6D0bl',
            songName: 'Waiting',
            playStyle: 1,
            difficulty: 2,
            level: 10,
          },
          {
            songId: '6iO8d9ld00I6lDIO6qbOldP99oqloqb9',
            songName: 'Dead Heat',
            playStyle: 1,
            difficulty: 2,
            level: 10,
          },
          {
            songId: '1iDPo19Pb9ooi8OqiidbqPb06DDdqiqo',
            songName: 'Neverland',
            playStyle: 1,
            difficulty: 2,
            level: 12,
          },
        ],
      },
      {
        playStyle: 1,
        difficulty: 3,
        level: 15,
        notes: 1557,
        freezeArrow: 58,
        shockArrow: 0,
        order: [
          {
            songId: 'PdPdbdQ1lDI18O90Q0li8QI0bo99bidd',
            songName: 'This Beat Is.....',
            playStyle: 1,
            difficulty: 3,
            level: 11,
          },
          {
            songId: 'PPQb966D6Ql6Q8iPo68810PdDiI6D0bl',
            songName: 'Waiting',
            playStyle: 1,
            difficulty: 3,
            level: 13,
          },
          {
            songId: '6iO8d9ld00I6lDIO6qbOldP99oqloqb9',
            songName: 'Dead Heat',
            playStyle: 1,
            difficulty: 3,
            level: 14,
          },
          {
            songId: '1iDPo19Pb9ooi8OqiidbqPb06DDdqiqo',
            songName: 'Neverland',
            playStyle: 1,
            difficulty: 3,
            level: 15,
          },
        ],
      },
      {
        playStyle: 2,
        difficulty: 1,
        level: 8,
        notes: 761,
        freezeArrow: 45,
        shockArrow: 0,
        order: [
          {
            songId: 'PdPdbdQ1lDI18O90Q0li8QI0bo99bidd',
            songName: 'This Beat Is.....',
            playStyle: 2,
            difficulty: 1,
            level: 4,
          },
          {
            songId: 'PPQb966D6Ql6Q8iPo68810PdDiI6D0bl',
            songName: 'Waiting',
            playStyle: 2,
            difficulty: 1,
            level: 7,
          },
          {
            songId: '6iO8d9ld00I6lDIO6qbOldP99oqloqb9',
            songName: 'Dead Heat',
            playStyle: 2,
            difficulty: 1,
            level: 6,
          },
          {
            songId: '1iDPo19Pb9ooi8OqiidbqPb06DDdqiqo',
            songName: 'Neverland',
            playStyle: 2,
            difficulty: 1,
            level: 8,
          },
        ],
      },
      {
        playStyle: 2,
        difficulty: 2,
        level: 12,
        notes: 1123,
        freezeArrow: 41,
        shockArrow: 0,
        order: [
          {
            songId: 'PdPdbdQ1lDI18O90Q0li8QI0bo99bidd',
            songName: 'This Beat Is.....',
            playStyle: 2,
            difficulty: 2,
            level: 7,
          },
          {
            songId: 'PPQb966D6Ql6Q8iPo68810PdDiI6D0bl',
            songName: 'Waiting',
            playStyle: 2,
            difficulty: 2,
            level: 10,
          },
          {
            songId: '6iO8d9ld00I6lDIO6qbOldP99oqloqb9',
            songName: 'Dead Heat',
            playStyle: 2,
            difficulty: 2,
            level: 10,
          },
          {
            songId: '1iDPo19Pb9ooi8OqiidbqPb06DDdqiqo',
            songName: 'Neverland',
            playStyle: 2,
            difficulty: 2,
            level: 12,
          },
        ],
      },
      {
        playStyle: 2,
        difficulty: 3,
        level: 14,
        notes: 1493,
        freezeArrow: 47,
        shockArrow: 0,
        order: [
          {
            songId: 'PdPdbdQ1lDI18O90Q0li8QI0bo99bidd',
            songName: 'This Beat Is.....',
            playStyle: 2,
            difficulty: 3,
            level: 10,
          },
          {
            songId: 'PPQb966D6Ql6Q8iPo68810PdDiI6D0bl',
            songName: 'Waiting',
            playStyle: 2,
            difficulty: 3,
            level: 13,
          },
          {
            songId: '6iO8d9ld00I6lDIO6qbOldP99oqloqb9',
            songName: 'Dead Heat',
            playStyle: 2,
            difficulty: 3,
            level: 14,
          },
          {
            songId: '1iDPo19Pb9ooi8OqiidbqPb06DDdqiqo',
            songName: 'Neverland',
            playStyle: 2,
            difficulty: 3,
            level: 14,
          },
        ],
      },
    ],
  }
  describe('snapshot test', () => {
    test('renders correctly', () => {
      // Arrange - Act
      const wrapper = shallowMount(CourseDetailPage, {
        localVue,
        data: () => ({ course }),
      })

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
  })
  describe('validate()', () => {
    test.each(['', 'foo', '99', '-1', '000000000000000000000000000000000'])(
      '/courses/%s returns false',
      id => {
        // Arrange
        const wrapper = shallowMount(CourseDetailPage, { localVue })
        const ctx = ({ params: { id } } as unknown) as Context

        // Act - Assert
        expect(wrapper.vm.$options.validate!(ctx)).toBe(false)
      }
    )
    test.each(['00000000000000000000000000000000', course.id])(
      '/courses/%s returns true',
      id => {
        // Arrange
        const wrapper = shallowMount(CourseDetailPage, { localVue })
        const ctx = ({ params: { id } } as unknown) as Context

        // Act - Assert
        expect(wrapper.vm.$options.validate!(ctx)).toBe(true)
      }
    )
  })
  describe('asyncData()', () => {
    const apiMock = mocked(getCourseInfo)
    beforeEach(() => {
      apiMock.mockClear()
      apiMock.mockResolvedValue(course)
    })
    test('calls getCourseInfo($http, params.id)', async () => {
      // Arrange
      const $http = { $get: jest.fn() }
      const wrapper = shallowMount(CourseDetailPage, { localVue })
      const ctx = ({ $http, params: { id: course.id } } as unknown) as Context

      // Act
      const result: any = await wrapper.vm.$options.asyncData!(ctx)

      // Assert
      expect(result.course).toBe(course)
      expect(apiMock).toBeCalledTimes(1)
      expect(apiMock).toBeCalledWith($http, course.id)
    })
  })
})
