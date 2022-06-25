import type { CompatibilityEvent } from 'h3'

export function createEvent(
  params?: Record<string, string>
): CompatibilityEvent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { req: {}, context: { params }, res: { statusCode: 200 } } as any
}
