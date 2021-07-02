export const describeIf = (cond: () => boolean): jest.Describe =>
  cond() ? describe : describe.skip

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createMockContainer<T>(resources: T[]) {
  return {
    items: {
      query: jest.fn(() => ({ fetchAll: async () => ({ resources }) })),
    },
  }
}
