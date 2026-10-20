import type { RequestEvent } from 'nuxt/schema'

export function createRequestEvent(
  body: unknown,
  params?: Record<string, string>,
  query?: string
) {
  return {
    context: { params: params ?? {} },
    req: {
      headers: {
        get: (key: string) =>
          key === 'content-type' ? 'application/json' : null,
      },
      text: () => Promise.resolve(JSON.stringify(body)),
      url: new URL(`http://localhost/api/mock${query ?? ''}`),
    },
    res: {},
  } as unknown as RequestEvent
}
