import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2024-08-25',
  extends: ['@nuxt/ui-pro'],
  future: { compatibilityVersion: 4 },
  nitro: {
    preset: 'azure',
    azure: {
      config: {
        auth: {
          rolesSource: '/api/v2/user/roles',
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
        routes: [{ route: '/admin/*', allowedRoles: ['administrator'] }],
      },
    },
  },
  modules: [
    'nuxt-zod-i18n',
    '@nuxtjs/i18n',
    '@nuxt/test-utils/module',
    '@nuxt/ui',
    'nuxt-swa',
    '@nuxt/eslint',
  ],
  i18n: {
    langDir: '../i18n/locales',
    locales: [
      {
        code: 'en',
        language: 'en-US',
        name: 'English',
        flag: 'us',
        file: 'en.json',
      },
      {
        code: 'ja',
        language: 'ja-JP',
        name: '日本語',
        flag: 'jp',
        file: 'ja.json',
      },
    ],
    defaultLocale: 'ja',
    strategy: 'no_prefix',
  },
  swa: {
    customRoles: ['administrator'],
  },
  runtimeConfig: {
    cosmosDBConn: process.env.COSMOS_DB_CONN,
  },
  devtools: { enabled: true },
})
