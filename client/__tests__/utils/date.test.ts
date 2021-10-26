/**
 * @jest-environment node
 */
import { unixTimeToString } from '~/utils/date'

describe('/utils/date.ts', () => {
  describe('unixTimeToString', () => {
    const dateList: Date[] = [
      new Date(2020, 7, 13), // 2020/8/13 0:00
      new Date(2020, 7, 13, 1), // 2020/8/13 1:00
      new Date(2020, 7, 13, 2), // 2020/8/13 2:00
      new Date(2020, 7, 13, 3), // 2020/8/13 3:00
      new Date(2020, 7, 13, 4), // 2020/8/13 4:00
      new Date(2020, 7, 13, 5), // 2020/8/13 5:00
      new Date(2020, 7, 13, 6), // 2020/8/13 6:00
      new Date(2020, 7, 13, 7), // 2020/8/13 7:00
      new Date(2020, 7, 13, 8), // 2020/8/13 8:00
      new Date(2020, 7, 13, 9), // 2020/8/13 9:00
      new Date(2020, 7, 13, 10), // 2020/8/13 10:00
      new Date(2020, 7, 13, 11), // 2020/8/13 11:00
      new Date(2020, 7, 13, 12), // 2020/8/13 12:00
      new Date(2020, 7, 13, 13), // 2020/8/13 13:00
      new Date(2020, 7, 13, 14), // 2020/8/13 14:00
      new Date(2020, 7, 13, 15), // 2020/8/13 15:00
      new Date(2020, 7, 13, 16), // 2020/8/13 16:00
      new Date(2020, 7, 13, 17), // 2020/8/13 17:00
      new Date(2020, 7, 13, 18), // 2020/8/13 18:00
      new Date(2020, 7, 13, 19), // 2020/8/13 19:00
      new Date(2020, 7, 13, 20), // 2020/8/13 20:00
      new Date(2020, 7, 13, 21), // 2020/8/13 21:00
      new Date(2020, 7, 13, 22), // 2020/8/13 22:00
      new Date(2020, 7, 13, 23), // 2020/8/13 23:00
      new Date(2020, 7, 14), // 2020/8/14 0:00
    ]
    test.each(
      dateList.map<[number, string]>(d => [
        Math.floor(d.valueOf() / 1000),
        d.toLocaleString(),
      ])
    )('(%i) returns "%s"', (unixTime, dateString) => {
      expect(unixTimeToString(unixTime)).toBe(dateString)
    })
  })
})
