const insertJobCron = '0 6 * * 4' // Every Thursday at 15:00(JST)
const updateJobCron = '30 6 * * 4' // Every Thursday at 15:30(JST)
const databaseId = '4dce0809-a8f5-4246-8aa3-a98d80d75f58'
const databasePreviewId = '8fe9ebda-1ec6-4a2d-96a4-2a5b393762bb'
const kvNamespaceId = '3a68c2e208034ac4a5008807742d2b93'
const kvPreviewNamespaceId = '052f5579bfdb447692b026df4b8574cf'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-12-11',
  experimental: { typedPages: true, typescriptPlugin: true },
  vite: { vue: { features: { optionsAPI: false } } },
  modules: [
    '@nuxthub/core',
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/test-utils/module',
    'nuxt-auth-utils',
  ],
  nitro: {
    preset: 'cloudflare-module',
    compressPublicAssets: true,
    experimental: {
      openAPI: true,
      tasks: true,
    },
    scheduledTasks: {
      [insertJobCron]: ['db:insert'],
      [updateJobCron]: ['db:update'],
    },
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
      wrangler: {
        compatibility_date: '2025-11-17',
        name: 'ddradar',
        workers_dev: true,
        preview_urls: true,
        routes: [
          {
            pattern: 'ddradar.app',
            zone_name: 'ddradar.app',
            custom_domain: true,
          },
        ],
        triggers: { crons: [insertJobCron, updateJobCron] },
        d1_databases: [
          {
            binding: 'DB',
            database_id: databaseId,
            preview_database_id: databasePreviewId,
          },
        ],
        kv_namespaces: [
          ...['CACHE', 'KV'].map(binding => ({
            binding,
            id: kvNamespaceId,
            preview_id: kvPreviewNamespaceId,
          })),
        ],
        observability: {
          enabled: false,
          head_sampling_rate: 1,
          logs: {
            enabled: true,
            head_sampling_rate: 1,
            // @ts-expect-error untyped config
            persist: true,
            invocation_logs: true,
          },
          traces: {
            enabled: false,
            persist: true,
            head_sampling_rate: 1,
          },
        },
      },
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
    cache: {
      driver: 'cloudflare-kv-binding',
      namespaceId: kvNamespaceId,
    },
    db: {
      dialect: 'sqlite',
      driver: 'd1',
      casing: 'snake_case',
      connection: { databaseId },
    },
    kv: {
      driver: 'cloudflare-kv-binding',
      namespaceId: kvNamespaceId,
    },
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
