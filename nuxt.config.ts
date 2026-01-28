const scheduledTasks = {
  '0 6 * * 4': ['db:insert'],
  '30 6 * * 4': ['db:update'],
}

export default defineNuxtConfig({
  compatibilityDate: '2025-12-11',
  experimental: { typedPages: true, typescriptPlugin: true },
  vite: {
    plugins: [
      {
        name: 'vue-spec-plugin',
        transform(_, id) {
          if (id.includes('vue&type=spec')) return 'export default {}'
        },
      },
    ],
    vue: { features: { optionsAPI: false } },
  },
  modules: [
    '@nuxthub/core',
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/test-utils/module',
    'nuxt-auth-utils',
    '@nuxtjs/i18n',
    '@nuxt/content',
  ],
  nitro: {
    preset: 'cloudflare-module',
    cloudflare: {
      wrangler: {
        triggers: { crons: Object.keys(scheduledTasks) },
      },
    },
    compressPublicAssets: true,
    experimental: {
      openAPI: true,
      tasks: true,
    },
    scheduledTasks,
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
  hub: {
    cache: true,
    db: {
      dialect: 'sqlite',
      casing: 'snake_case',
      driver: 'd1',
    },
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
      community: {
        github: 'https://github.com/ddradar/ddradar',
        x: 'https://x.com/nogic1008',
        crowdin: 'https://crowdin.com/project/ddradar',
      },
      token: {
        maxCreationPerUser: 10,
        maxExpirationDays: 365,
      },
    },
  },
  i18n: {
    defaultLocale: 'ja',
    strategy: 'no_prefix',
    locales: [
      { code: 'en', file: 'en.json', name: 'English' },
      { code: 'ja', file: 'ja.json', name: '日本語' },
    ],
  },
})
