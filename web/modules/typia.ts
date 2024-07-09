import type { Options } from '@ryoppippi/unplugin-typia'
import vite from '@ryoppippi/unplugin-typia/vite'
import webpack from '@ryoppippi/unplugin-typia/webpack'
import { addVitePlugin, addWebpackPlugin, defineNuxtModule } from 'nuxt/kit'

export default defineNuxtModule<Options>({
  meta: {
    name: 'nuxt-typia',
  },
  setup(options, _nuxt) {
    addVitePlugin(() => vite(options))
    addWebpackPlugin(() => webpack(options))
  },
})
