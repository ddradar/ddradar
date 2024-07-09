import UnpluginTypia from '@ryoppippi/unplugin-typia/rollup'
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    {
      input: 'src/index',
      format: 'esm',
    },
    {
      input: 'src/',
      format: 'cjs',
      ext: 'cjs',
    },
    {
      input: 'test/data',
      format: 'esm',
    },
  ],
  declaration: 'compatible',
  hooks: {
    'rollup:options'(_ctx, options) {
      options.plugins.push(UnpluginTypia())
    },
  },
})
