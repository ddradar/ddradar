import { ApplicationInsights } from '@microsoft/applicationinsights-web'
import type { Context } from '@nuxt/types'

const appInsightsPlugin = ({ $config }: Pick<Context, '$config'>) => {
  const appInsights = new ApplicationInsights({
    config: {
      instrumentationKey: $config.instrumentationKey,
      enableAutoRouteTracking: true,
    },
  })
  appInsights.loadAppInsights()
  appInsights.trackPageView()
}

export default appInsightsPlugin
