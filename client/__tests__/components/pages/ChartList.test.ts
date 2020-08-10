import { createLocalVue, mount, RouterLinkStub } from '@vue/test-utils'
import Buefy from 'buefy'

import type { ChartInfo } from '~/api/song'
import ChartListComponent from '~/components/pages/ChartList.vue'

const localVue = createLocalVue()
localVue.use(Buefy)

describe('/components/pages/ChartList.vue', () => {
  describe('renders', () => {
    test('loading spin if { loading: true }', () => {
      // Arrange
      const wrapper = mount(ChartListComponent, {
        localVue,
        stubs: { NuxtLink: RouterLinkStub },
        propsData: { loading: true },
      })

      // Act - Assert
      expect(wrapper).toMatchSnapshot()
    })
    test('chart list if loaded charts', () => {
      // Arrange
      const charts: ChartInfo[] = [
        {
          id: '9i0q91lPPiO61b9P891O1i86iOP1I08O',
          name: 'EGOISM 440',
          series: 'DanceDanceRevolution (2014)',
          playStyle: 1,
          difficulty: 4,
          level: 19,
        },
        {
          id: 'PO9Pl1q896bDDl89qQb98D80DQoPio1I',
          name: 'ENDYMION',
          series: 'DanceDanceRevolution A',
          playStyle: 1,
          difficulty: 4,
          level: 19,
        },
        {
          id: '1Dl19idl0i0qiqidbDIIbQddiP6o11PP',
          name: 'MAX 360',
          series: 'DanceDanceRevolution A',
          playStyle: 1,
          difficulty: 4,
          level: 19,
        },
        {
          id: '6bid6d9qPQ80DOqiidQQ891o6Od8801l',
          name: 'Over The “Period”',
          series: 'DanceDanceRevolution (2014)',
          playStyle: 1,
          difficulty: 4,
          level: 19,
        },
        {
          id: '606b9d6OiliId69bO9Odi6qq8o8Qd0dq',
          name: 'PARANOiA Revolution',
          series: 'DDR X3 VS 2ndMIX',
          playStyle: 1,
          difficulty: 4,
          level: 19,
        },
        {
          id: '186dd6DQq891Ib9Ilq8Qbo8lIqb0Qoll',
          name: 'Valkyrie dimension',
          series: 'DDR X2',
          playStyle: 1,
          difficulty: 4,
          level: 19,
        },
      ]
      const wrapper = mount(ChartListComponent, {
        localVue,
        stubs: { NuxtLink: RouterLinkStub },
        propsData: { charts },
      })

      // Act - Assert
      expect(wrapper).toMatchSnapshot()
    })
  })
})
