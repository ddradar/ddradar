import { isDeletedOnGate } from '../song'

/** PARANOiA */
const existsId = '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI'
/** IF YOU WERE HERE */
const deletedOnA = '6b8lbl11Ii81bIiq1D9do811D986iDOq'
/** SP初段(A20) */
const deletedOnA20 = '19id1DO6q9Pb1681db61D8D8oQi9dlb6'
/** 輪廻転生 */
const deletedOnA20Plus = '91qD6DbDqi96qbIO66oboliPD8IPP6io'

describe('./song.ts', () => {
  describe('isDeletedOnGate', () => {
    test.each([deletedOnA])('(%s) returns true', songId =>
      expect(isDeletedOnGate(songId)).toBe(true)
    )
    test.each([existsId, deletedOnA20, deletedOnA20Plus])(
      '(%s) returns false',
      songId => expect(isDeletedOnGate(songId)).toBe(false)
    )
    test.each([
      [deletedOnA, 'DanceDanceRevolution A20'],
      [deletedOnA, 'DanceDanceRevolution A20 PLUS'],
      [deletedOnA, 'DanceDanceRevolution A3'],
      [deletedOnA20, 'DanceDanceRevolution A3'],
      [deletedOnA20Plus, 'DanceDanceRevolution A3'],
    ] as const)('(%s, %s) returns true', (songId, series) =>
      expect(isDeletedOnGate(songId, series)).toBe(true)
    )
    test.each([
      [existsId, 'DanceDanceRevolution A'],
      [existsId, 'DanceDanceRevolution A20'],
      [existsId, 'DanceDanceRevolution A20 PLUS'],
      [existsId, 'DanceDanceRevolution A3'],
      [deletedOnA, 'DanceDanceRevolution A'],
      [deletedOnA20, 'DanceDanceRevolution A'],
      [deletedOnA20, 'DanceDanceRevolution A20'],
      [deletedOnA20, 'DanceDanceRevolution A20 PLUS'],
      [deletedOnA20Plus, 'DanceDanceRevolution A'],
      [deletedOnA20Plus, 'DanceDanceRevolution A20'],
      [deletedOnA20Plus, 'DanceDanceRevolution A20 PLUS'],
    ] as const)('(%s, %s) returns false', (songId, series) =>
      expect(isDeletedOnGate(songId, series)).toBe(false)
    )
  })
})
