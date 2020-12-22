import type { CourseListData } from '@ddradar/core/api/course'
import { createLocalVue, mount, RouterLinkStub } from '@vue/test-utils'
import Buefy from 'buefy'
import VueI18n from 'vue-i18n'

import CourseListComponent from '~/components/pages/courses/CourseList.vue'

const localVue = createLocalVue()
localVue.use(Buefy)
localVue.use(VueI18n)

describe('/components/pages/courses/CourseList.vue', () => {
  describe('snapshot test', () => {
    test('renders loading spin if { loading: true }', async () => {
      // Arrange - Act
      const i18n = new VueI18n({ locale: 'ja', silentFallbackWarn: true })
      const wrapper = mount(CourseListComponent, {
        localVue,
        stubs: { NuxtLink: RouterLinkStub },
        propsData: { loading: true },
        i18n,
      })
      await wrapper.vm.$nextTick()

      // Assert
      expect(wrapper).toMatchSnapshot()
    })
    test.each(['ja', 'en'])(
      'renders course list if loaded courses and { locale: %s }',
      async locale => {
        // Arrange - Act
        const i18n = new VueI18n({ locale, silentFallbackWarn: true })
        const courses: CourseListData[] = [
          {
            id: '19id1DO6q9Pb1681db61D8D8oQi9dlb6',
            name: '初段',
            series: 'DanceDanceRevolution A20',
            charts: [
              {
                playStyle: 1,
                difficulty: 4,
                level: 10,
              },
            ],
          },
          {
            id: '6bo6ID6l11qd6lolilI6o6q8I6ddo88i',
            name: '初段',
            series: 'DanceDanceRevolution A20 PLUS',
            charts: [
              {
                playStyle: 1,
                difficulty: 4,
                level: 10,
              },
            ],
          },
          {
            id: '8OoDQb16lP0i96qiDQqo90Q6bOP1o89D',
            name: '四段',
            series: 'DanceDanceRevolution A20',
            charts: [
              {
                playStyle: 2,
                difficulty: 4,
                level: 13,
              },
            ],
          },
          {
            id: 'DQqi68IP1qbDiQ9li6PI1Q9Iddd6o9QQ',
            name: '九段',
            series: 'DanceDanceRevolution A20 PLUS',
            charts: [
              {
                playStyle: 2,
                difficulty: 4,
                level: 18,
              },
            ],
          },
          {
            id: 'O6Pi0O800b8b6d9dd9P89dD1900I1q80',
            name: 'HYPER',
            series: 'DanceDanceRevolution A20 PLUS',
            charts: [
              {
                playStyle: 1,
                difficulty: 0,
                level: 5,
              },
              {
                playStyle: 1,
                difficulty: 1,
                level: 8,
              },
              {
                playStyle: 1,
                difficulty: 2,
                level: 12,
              },
              {
                playStyle: 1,
                difficulty: 3,
                level: 15,
              },
              {
                playStyle: 2,
                difficulty: 1,
                level: 8,
              },
              {
                playStyle: 2,
                difficulty: 2,
                level: 12,
              },
              {
                playStyle: 2,
                difficulty: 3,
                level: 15,
              },
            ],
          },
          {
            id: 'i1DqPb01I6I1dP8qoO1qiIPDlOD9D9oQ',
            name: 'PLANET',
            series: 'DanceDanceRevolution A20',
            charts: [
              {
                playStyle: 1,
                difficulty: 0,
                level: 3,
              },
              {
                playStyle: 1,
                difficulty: 1,
                level: 7,
              },
              {
                playStyle: 1,
                difficulty: 2,
                level: 11,
              },
              {
                playStyle: 1,
                difficulty: 3,
                level: 15,
              },
              {
                playStyle: 2,
                difficulty: 1,
                level: 6,
              },
              {
                playStyle: 2,
                difficulty: 2,
                level: 10,
              },
              {
                playStyle: 2,
                difficulty: 3,
                level: 15,
              },
            ],
          },
        ]
        const wrapper = mount(CourseListComponent, {
          localVue,
          stubs: { NuxtLink: RouterLinkStub },
          propsData: { courses },
          i18n,
        })
        await wrapper.vm.$nextTick()

        // Assert
        expect(wrapper).toMatchSnapshot()
      }
    )
    test.each(['ja', 'en'])(
      'renders empty if courses is empty and { locale: %s }',
      async locale => {
        // Arrange - Act
        const i18n = new VueI18n({ locale, silentFallbackWarn: true })
        const wrapper = mount(CourseListComponent, {
          localVue,
          stubs: { NuxtLink: RouterLinkStub },
          i18n,
        })
        await wrapper.vm.$nextTick()

        // Assert
        expect(wrapper).toMatchSnapshot()
      }
    )
  })
})
