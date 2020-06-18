import { Configuration } from '@nuxt/types'

import { SeriesList, SongInfo } from './types/api/song'

type Song = Omit<SongInfo, 'charts'>

const configuration: Configuration = {
  mode: 'universal',
  head: {
    title: 'DDRadar',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: 'DDR Score Tracker',
      },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },
  loading: { color: '#fff' },
  css: ['~/assets/css/styles.scss'],
  plugins: [],
  buildModules: ['@nuxt/typescript-build'],
  modules: [['nuxt-buefy', { css: false }], '@nuxt/http', '@nuxtjs/pwa'],
  pwa: {
    manifest: {
      name: 'DDRadar',
      description: 'DDR Score Tracker',
      theme_color: '#ff8c00',
      lang: 'ja',
      display: 'standalone',
      scope: '/',
      start_url: '/',
    },
  },
  build: {
    extend(config, { isClient }) {
      if (isClient) config.devtool = 'source-map'
    },
  },
  generate: {
    routes() {
      // eslint-disable-next-line no-process-env
      const baseUri = process.env.API_URL
      const routes: { route: string; payload?: any }[] = []
      if (!baseUri) return routes

      // /series/0
      for (let i = 0; i < SeriesList.length; i++) {
        const title = SeriesList[i]
        routes.push({ route: `/series/${i}`, payload: { title } })
      }

      return routes
    },
  },
}

export default configuration
