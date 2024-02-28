import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
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
  routeRules: {
    '/admin/**': { ssr: false },
  },
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css',
        },
      ],
    },
  },
  css: ['@/assets/css/main.scss'],
  modules: ['@nuxtjs/i18n', '@nuxt/test-utils/module'],
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', name: 'English' },
      { code: 'ja', iso: 'ja-JP', name: '日本語' },
    ],
    defaultLocale: 'ja',
    strategy: 'no_prefix',
  },
})
