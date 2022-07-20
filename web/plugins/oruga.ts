import Oruga from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'

export default defineNuxtPlugin(({ vueApp }) => {
  vueApp.use(Oruga, bulmaConfig)
})
