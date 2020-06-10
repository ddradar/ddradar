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
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {},
}

export default configuration
