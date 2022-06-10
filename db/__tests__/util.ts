import { describe } from '@jest/globals'
import { Global } from '@jest/types'

export const describeIf = (cond: () => boolean): Global.DescribeBase =>
  cond() ? describe : describe.skip
