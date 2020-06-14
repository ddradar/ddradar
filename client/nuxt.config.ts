import { Configuration } from '@nuxt/types'

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
  css: [],
  plugins: [],
  buildModules: ['@nuxt/typescript-build'],
  modules: ['nuxt-buefy', '@nuxtjs/axios', '@nuxtjs/pwa'],
  /**
   * Axios module configuration
   * See https://axios.nuxtjs.org/options
   */
  axios: {},
  build: {
    extend(config, { isClient }) {
      if (isClient) config.devtool = 'source-map'
    },
  },
}

export default configuration
