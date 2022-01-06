/**
 * @jest-environment node
 */
import { ApplicationInsights } from '@microsoft/applicationinsights-web'

import plugin from '~/plugins/application-insights.client'

jest.mock('@microsoft/applicationinsights-web')

describe('plugins/application-insights.client.ts', () => {
  const $config = { instrumentationKey: 'APP_INSIGHTS_KEY' }
  const mockAppInsights = jest.mocked(ApplicationInsights)
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
    expect(jest.mocked(ApplicationInsights).mock.calls[0]).toHaveLength(1)
    expect(
      jest.mocked(ApplicationInsights).mock.calls[0][0].config
    ).toStrictEqual({
      instrumentationKey: $config.instrumentationKey,
      enableAutoRouteTracking: true,
    })
    expect(
      jest.mocked(ApplicationInsights).mock.instances[0].loadAppInsights
    ).lastCalledWith()
    expect(
      jest.mocked(ApplicationInsights).mock.instances[0].trackPageView
    ).lastCalledWith()
  })
})
