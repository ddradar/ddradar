import { readFile } from 'fs'
import { join } from 'path'
import { promisify } from 'util'

import { masterMusicToMap } from '../skill-attack'

const readFileAsync = promisify(readFile)

describe('/skill-attack.ts', () => {
  describe('masterMusicToMap', () => {
    test('(master_music.txt) returns Map', async () => {
      // Arrange
      const buffer = await readFileAsync(join(__dirname, 'master_music.txt'))
      const expected: [string, number][] = [
        '8Il6980di8P89lil1PDIqqIbiq1QO8lQ',
        '06loOQ0DQb0DqbOibl6qO81qlIdoP9DI',
        'Pb9II0oiI9ODQ8OP8IqIPQP9P68biqIi',
        'dq190Il9iO1bD698ll6ddObIlqdIQ1O9',
        'DblIbDd6lQQQoO9bloOI9iIqO1IiQoID',
        'DbPodlqiOQdD88bo8lPO9D6iql1DO8P0',
        '8liDbidQoI6Q01lO9iibIdboIiDl66Qo',
        'Dq0Iio09Pb9iD0lbb0I0qd8Q8i10II09',
        '0lDDIlQ91lq6O16q9QQ681d6Db1l0oOb',
        '9doPbId8qid9I9l6ooloPQD1lq1Plb6I',
        'Pl0dPid9lQDo6PDQDqPboPqO6iIDIqoo',
      ].map((s, i) => [s, i])

      // Act
      const map = masterMusicToMap(buffer)

      // Assert
      expect(map.size).toBe(11)
      expect(map).toStrictEqual(new Map(expected))
    })
  })
})
