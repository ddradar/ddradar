const ignoredRoutes = [
  /^\/_/,
  /^\/auth\//,
  /^\/api\/_nuxt_icon/,
  /^\/api\/_auth/,
  /^\/api\/\{\*param1\}/,
]

export default defineNitroPlugin(nitroApp => {
  nitroApp.hooks.hook('beforeResponse', (event, { body }) => {
    if (event.path === '/_openapi.json') {
      const paths = (body as { paths: Record<string, unknown> }).paths
      for (const keys of Object.keys(paths)) {
        for (const entry of ignoredRoutes) {
          if (entry.test(keys)) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete paths[keys]
            break
          }
        }
      }
    }
  })
})
