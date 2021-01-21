import type { NuxtConfig } from '@nuxt/types'
import { join } from 'path'

import type { Locale } from './types/locale'

const title = 'DDRadar'
const description = 'DDR Score Tracker'

const configuration: NuxtConfig = {
  target: 'static',
  head: {
    titleTemplate: titleChunk =>
      titleChunk ? `${titleChunk} - ${title}` : title,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: description,
      },
      {
        name: 'keywords',
        content:
          'Dance Dance Revolution,DDR,ダンレボ,ダンスダンスレボリューション',
      },
    ],
    link: [
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'icon alternate', type: 'image/png', href: '/favicon.png' },
    ],
  },
  loading: { color: '#fff' },
  css: ['~/assets/css/styles.scss'],
  plugins: ['~/plugins/application-insights.client.ts'],
  buildModules: ['@nuxt/typescript-build', 'nuxt-typed-vuex'],
  modules: [
    ['nuxt-buefy', { css: false }],
    '@nuxt/http',
    '@nuxtjs/pwa',
    'nuxt-i18n',
  ],
  /** @nuxtjs/pwa settings */
  pwa: {
    manifest: {
      name: title,
      short_name: title,
      description,
      theme_color: '#ff8c00',
      lang: 'ja',
      display: 'standalone',
      scope: '/',
      start_url: '/',
    },
    meta: {
      name: title,
      description,
      theme_color: '#ff8c00',
      lang: 'ja',
    },
  },
  /** nuxt-i18n settings */
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', flag: 'us', name: 'English' },
      { code: 'ja', iso: 'ja-JP', flag: 'jp', name: '日本語' },
    ] as Locale[],
    defaultLocale: 'ja',
    strategy: 'no_prefix',
    vueI18n: { fallbackLocale: 'ja' },
    vueI18nLoader: true,
  },
  publicRuntimeConfig: {
    /** Application Insights Instrumentation Key */
    // eslint-disable-next-line no-process-env
    instrumentationKey: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
  },
  build: {
    transpile: [/typed-vuex/],
    extend(config, { isClient }) {
      if (isClient) config.devtool = 'source-map'
      config!.resolve!.alias!['@core'] = join(__dirname, '..', 'core/dist')
    },
  },
  generate: { exclude: [/^\/.auth\//] },
}

export default configuration
