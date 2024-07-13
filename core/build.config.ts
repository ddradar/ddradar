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
})
