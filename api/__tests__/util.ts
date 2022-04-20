import { describe } from 'vitest'

export const describeIf = (cond: () => boolean) =>
  cond() ? describe : describe.skip
