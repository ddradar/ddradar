import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  extends: ['@nuxt/ui-pro'],
  experimental: {
    asyncContext: true,
    typedPages: true,
    sharedPrerenderData: true,
  },
  nitro: {
    preset: 'azure',
    azure: {
      config: {
        auth: {
          rolesSource: '/api/v1/user/roles',
          identityProviders: {
            twitter: {
              registration: {
                consumerKeySettingName: 'TWITTER_API_KEY',
                consumerSecretSettingName: 'TWITTER_API_SECRET',
              },
            },
            customOpenIdConnectProviders: {
              line: {
                registration: {
                  clientIdSettingName: 'LINE_CLIENT_ID',
                  clientCredential: {
                    clientSecretSettingName: 'LINE_CLIENT_SECRET',
                  },
                  openIdConnectConfiguration: {
                    wellKnownOpenIdConfiguration:
                      'https://access.line.me/.well-known/openid-configuration',
                  },
                },
                login: { nameClaimType: 'name' },
              },
            },
          },
        },
        globalHeaders: {
          'Access-Control-Allow-Origin': 'https://p.eagate.573.jp',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Credentials': 'true',
        },
        routes: [
          {
            route: '/api/v1/scores/*',
            methods: ['POST', 'DELETE'],
            allowedRoles: ['authenticated'],
          },
          {
            route: '/api/v1/notification',
            methods: ['POST'],
            allowedRoles: ['administrator'],
          },
          {
            route: '/api/v1/songs',
            methods: ['POST'],
            allowedRoles: ['administrator'],
          },
          { route: '/api/v1/user', allowedRoles: ['authenticated'] },
          { route: '/api/v1/users/exists/*', allowedRoles: ['authenticated'] },
          { route: '/admin/*', allowedRoles: ['administrator'] },
        ],
      },
    },
  },
  build: {
    transpile: [/@oruga-ui\/oruga-next/],
  },
  modules: [
    'nuxt-zod-i18n',
    '@nuxtjs/i18n',
    '@nuxt/test-utils/module',
    '@nuxt/ui',
    'nuxt-swa',
  ],
  i18n: {
    langDir: './locales',
    locales: [
      {
        code: 'en',
        iso: 'en-US',
        name: 'English',
        flag: 'us',
        file: 'en.json',
      },
      { code: 'ja', iso: 'ja-JP', name: '日本語', flag: 'jp', file: 'ja.json' },
    ],
    defaultLocale: 'ja',
    strategy: 'no_prefix',
  },
  ui: {
    icons: ['heroicons', 'simple-icons', 'flag'],
  },
  swa: {
    customRoles: ['administrator'],
  },
})
