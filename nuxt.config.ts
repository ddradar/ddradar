// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-12-11',
  modules: [
    '@nuxthub/core',
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/test-utils/module',
    'nuxt-auth-utils',
  ],
  nitro: {
    preset: 'cloudflare-module',
    experimental: {
      openAPI: true,
      tasks: true,
    },
    scheduledTasks: {
      '0 6 * * 4': ['db:insert'], // Every Thursday at 15:00(JST)
      '30 6 * * 4': ['db:update'], // Every Thursday at 15:30(JST)
    },
  },
  routeRules: {
    '/api/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    },
  },
  typescript: { tsConfig: { include: ['../test/**/*'] } },
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  ui: {
    theme: {
      colors: [
        'primary',
        'secondary',
        'info',
        'success',
        'warning',
        'error',
        // custom colors
        'beginner',
        'basic',
        'difficult',
        'expert',
        'challenge',
      ],
    },
  },
  // https://hub.nuxt.com/docs/getting-started/installation#options
  hub: {
    cache: true,
    db: { dialect: 'sqlite', casing: 'snake_case' },
    kv: true,
  },
  runtimeConfig: {
    ddrCardDrawJsonUrl:
      'https://raw.githubusercontent.com/noahm/DDRCardDraw/refs/heads/main/src/songs/ddr_world.json',
    bemaniWiki: {
      totalNotesUrl:
        'https://bemaniwiki.com/?DanceDanceRevolution+WORLD/%C1%B4%B6%CA%C1%ED%A5%CE%A1%BC%A5%C4%BF%F4%A5%EA%A5%B9%A5%C8',
      grooveRadarSPUrl:
        'https://bemaniwiki.com/?DanceDanceRevolution+GRAND+PRIX/%C1%B4%B6%CA%A5%B0%A5%EB%A1%BC%A5%F4%A5%EC%A1%BC%A5%C0%A1%BC%C3%CD%A5%EA%A5%B9%A5%C8%28SP%29',
      grooveRadarDPUrl:
        'https://bemaniwiki.com/?DanceDanceRevolution+GRAND+PRIX/%C1%B4%B6%CA%A5%B0%A5%EB%A1%BC%A5%F4%A5%EC%A1%BC%A5%C0%A1%BC%C3%CD%A5%EA%A5%B9%A5%C8%28DP%29',
    },
    oauth: {
      github: { clientId: '', clientSecret: '' },
      line: { clientId: '', clientSecret: '' },
      x: { clientId: '', clientSecret: '' },
    },
    public: {
      token: {
        maxCreationPerUser: 10,
        maxExpirationDays: 365,
      },
    },
  },
})
