import { ApplicationInsights } from '@microsoft/applicationinsights-web'
import { defineNuxtPlugin } from '@nuxtjs/composition-api'

export default defineNuxtPlugin(({ $config }) => {
  const appInsights = new ApplicationInsights({
    config: {
      instrumentationKey: $config.instrumentationKey,
      enableAutoRouteTracking: true,
    },
  })
  appInsights.loadAppInsights()
  appInsights.trackPageView()
})
