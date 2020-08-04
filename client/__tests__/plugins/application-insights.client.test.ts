import { ApplicationInsights } from '@microsoft/applicationinsights-web'
import { mocked } from 'ts-jest/utils'

import plugin from '~/plugins/application-insights.client'

jest.mock('@microsoft/applicationinsights-web')

describe('plugins/application-insights.client.ts', () => {
  const $config = { instrumentationKey: 'APP_INSIGHTS_KEY' }
  const mockAppInsights = mocked(ApplicationInsights)
  mockAppInsights.mockImplementation(
    () =>
      ({
        loadAppInsights: jest.fn(),
        trackPageView: jest.fn(),
      } as any)
  )
  beforeEach(() => {
    mockAppInsights.mockReset()
  })
  test('calls ApplicationInsights constractor', () => {
    // Arrange - Act
    plugin({ $config })

    // Assert
    expect(mocked(ApplicationInsights).mock.calls[0]).toHaveLength(1)
    expect(mocked(ApplicationInsights).mock.calls[0][0].config).toStrictEqual({
      instrumentationKey: $config.instrumentationKey,
      enableAutoRouteTracking: true,
    })
    expect(
      mocked(ApplicationInsights).mock.instances[0].loadAppInsights
    ).lastCalledWith()
    expect(
      mocked(ApplicationInsights).mock.instances[0].trackPageView
    ).lastCalledWith()
  })
})
