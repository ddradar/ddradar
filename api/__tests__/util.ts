export const describeIf = (cond: () => boolean): jest.Describe =>
  cond() ? describe : describe.skip
