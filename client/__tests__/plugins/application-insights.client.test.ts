/**
 * @jest-environment node
 */
import { ApplicationInsights } from '@microsoft/applicationinsights-web'

import plugin from '~/plugins/application-insights.client'

jest.mock('@microsoft/applicationinsights-web')

describe('plugins/application-insights.client.ts', () => {
  beforeEach(() => {
    jest.mocked(ApplicationInsights).mockClear()
    jest.mocked(ApplicationInsights).mockImplementation(
      () =>
        ({
          loadAppInsights: jest.fn(),
          trackPageView: jest.fn(),
        } as any)
    )
  })

  test('calls ApplicationInsights constractor', () => {
    // Arrange - Act
    const $config = { instrumentationKey: 'APP_INSIGHTS_KEY' }
    plugin({ $config })

    // Assert
    expect(jest.mocked(ApplicationInsights)).toBeCalledTimes(1)
    expect(jest.mocked(ApplicationInsights)).toBeCalledWith({
      config: {
        instrumentationKey: $config.instrumentationKey,
        enableAutoRouteTracking: true,
      },
    })
  })
})
