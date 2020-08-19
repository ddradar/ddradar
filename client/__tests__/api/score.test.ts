import {
  ChartScore,
  deleteChartScore,
  getChartScore,
  getDanceLevel,
  postChartScore,
  postSongScores,
  Score,
  setValidScoreFromChart,
  UserScore,
} from '~/api/score'

describe('./api/score.ts', () => {
  describe('getDanceLevel', () => {
    test.each([
      [0, 'D'],
      [550000, 'D+'],
      [590000, 'C-'],
      [600000, 'C'],
      [650000, 'C+'],
      [690000, 'B-'],
      [700000, 'B'],
      [750000, 'B+'],
      [790000, 'A-'],
      [800000, 'A'],
      [850000, 'A+'],
      [890000, 'AA-'],
      [900000, 'AA'],
      [950000, 'AA+'],
      [990000, 'AAA'],
      [1000000, 'AAA'],
    ])('(%i) returns "%s"', (score, expected) => {
      expect(getDanceLevel(score)).toBe(expected)
    })
  })
  describe('setValidScoreFromChart', () => {
    const chart = { notes: 1000, freezeArrow: 10, shockArrow: 10 } as const

    const mfcScore: Score = {
      score: 1000000,
      rank: 'AAA',
      clearLamp: 7,
      exScore: 3060,
      maxCombo: 1010,
    }
    /** Perfect:1 Score */
    const pfcScore: Score = {
      ...mfcScore,
      score: 999990,
      clearLamp: 6,
      exScore: 3059,
    }
    /** Great:1 Score */
    const gfcScore: Score = {
      ...pfcScore,
      score: 999590,
      clearLamp: 5,
      exScore: 3058,
    }
    /** Good:1 Score */
    const fcScore: Score = {
      ...gfcScore,
      score: 999200,
      clearLamp: 4,
      exScore: 3057,
    }
    /** 0 point falied Score */
    const noPlayScore: Score = {
      score: 0,
      rank: 'E',
      clearLamp: 0,
      exScore: 0,
      maxCombo: 0,
    }
    test.each([
      [{ clearLamp: 7 } as Partial<Score>, mfcScore], // MFC
      [{ score: 1000000 } as Partial<Score>, mfcScore], // MFC
      [{ exScore: 3060 } as Partial<Score>, mfcScore], // MFC
      [{ score: 999990 } as Partial<Score>, pfcScore], // P1
      [{ exScore: 3059 } as Partial<Score>, pfcScore], // P1
      [
        // Maybe PFC (score is greater than Great:1 score)
        { score: 999600 } as Partial<Score>,
        { ...pfcScore, score: 999600, exScore: 3020 },
      ],
      [
        // P20
        { exScore: 3040, clearLamp: 6 } as Partial<Score>,
        { ...pfcScore, score: 999800, exScore: 3040 },
      ],
      [{ exScore: 3058, clearLamp: 5 } as Partial<Score>, gfcScore], // Gr1
      [{ score: 999590, clearLamp: 5 } as Partial<Score>, gfcScore], // Gr1
      [
        // Gr1 P9
        { score: 999500, clearLamp: 5 } as Partial<Score>,
        { ...gfcScore, score: 999500, exScore: 3049 },
      ],
      [
        // Maybe Great:1 FC (score is greater than Good:1 score)
        { score: 999210 } as Partial<Score>,
        { ...gfcScore, score: 999210, exScore: 3020 },
      ],
      [
        // Cannot guess EX SCORE
        { score: 987600, clearLamp: 5 } as Partial<Score>,
        { score: 987600, rank: 'AA+', clearLamp: 5, maxCombo: 1010 } as Score,
      ],
      [{ exScore: 3057, clearLamp: 4 } as Partial<Score>, fcScore], // Gd1
      [{ score: 999200, clearLamp: 4 } as Partial<Score>, fcScore], // Gd1
      [
        // Gd1 P20
        { score: 999000, clearLamp: 4 } as Partial<Score>,
        { ...fcScore, score: 999000, exScore: 3037 },
      ],
      [
        // Maybe Full Combo (score is greater than Miss:1 score)
        { score: 999100 } as Partial<Score>,
        { score: 999100, rank: 'AAA', clearLamp: 4, maxCombo: 1010 } as Score,
      ],
      [
        // Cannot guess EX SCORE
        { score: 987600, clearLamp: 4 } as Partial<Score>,
        { score: 987600, clearLamp: 4, rank: 'AA+', maxCombo: 1010 } as Score,
      ],
      [
        // Miss1 P1
        { score: 999000, clearLamp: 2 } as Partial<Score>,
        { score: 999000, rank: 'AAA', clearLamp: 2, exScore: 3056 } as Score,
      ],
      [
        // Miss1 P1 (missed last FA)
        { score: 999000, clearLamp: 0, maxCombo: 1010 } as Partial<Score>,
        {
          score: 999000,
          rank: 'E',
          clearLamp: 0,
          exScore: 3056,
          maxCombo: 1010,
        } as Score,
      ],
      [
        { score: 948260, clearLamp: 3, maxCombo: 260 } as Partial<Score>,
        { score: 948260, rank: 'AA', clearLamp: 3, maxCombo: 260 } as Score,
      ],
      [
        { score: 948260, maxCombo: 260 } as Partial<Score>,
        { score: 948260, rank: 'AA', clearLamp: 2, maxCombo: 260 } as Score,
      ],
      [
        { score: 8460, rank: 'E' } as Partial<Score>,
        { score: 8460, rank: 'E', clearLamp: 0 } as Score,
      ],
      [{ score: 0, clearLamp: 0 } as Partial<Score>, noPlayScore], // 0 point
      [{ score: 0, rank: 'E' } as Partial<Score>, noPlayScore], // 0 point
      [
        // 0 point clear (Maybe use Assist option)
        { score: 0, clearLamp: 1 } as Partial<Score>,
        { ...noPlayScore, rank: 'D', clearLamp: 1 } as Score,
      ],
      [
        // 0 point clear (Maybe use Assist option)
        { score: 0, clearLamp: 2 } as Partial<Score>,
        { ...noPlayScore, rank: 'D', clearLamp: 1 } as Score,
      ],
      [
        // 0 point clear (Maybe use Assist option)
        { score: 0, rank: 'D' } as Partial<Score>,
        { ...noPlayScore, rank: 'D', clearLamp: 1 } as Score,
      ],
    ])(
      '({ notes: 1000, freezeArrow: 10, shockArrow: 10 }, %p) returns %p',
      (score: Partial<Score>, expected: Score) =>
        expect(setValidScoreFromChart(chart, score)).toStrictEqual(expected)
    )
    test('({ notes: 1000, freezeArrow: 10, shockArrow: 10 }, { exScore: 800 }) throws error', () =>
      expect(() =>
        setValidScoreFromChart(chart, { exScore: 800 })
      ).toThrowError(/^Cannot guess Score object. set score property/))
    test.each([
      [
        { score: 993100, clearLamp: 5 } as Partial<Score>, // Gr3 P55
        {
          score: 993100,
          rank: 'AAA',
          clearLamp: 5,
          exScore: 509,
          maxCombo: 180,
        } as Score,
      ],
      [
        { score: 989100, clearLamp: 5 } as Partial<Score>, // Gr5 P32
        {
          score: 989100,
          rank: 'AA+',
          clearLamp: 5,
          exScore: 528,
          maxCombo: 180,
        } as Score,
      ],
    ])(
      '({ notes: 180, freezeArrow: 10, shockArrow: 0 }, %p) returns %p',
      (incompleteScore: Partial<Score>, expected: Score) => {
        // Arrange
        const chart = { notes: 180, freezeArrow: 10, shockArrow: 0 }

        // Act
        const actual = setValidScoreFromChart(chart, incompleteScore)

        // Assert
        expect(actual).toStrictEqual(expected)
      }
    )
  })
  describe('getChartScore', () => {
    const $http = { $get: jest.fn<Promise<any>, [string]>() }
    const scores: UserScore[] = []
    $http.$get.mockResolvedValue(scores)
    test.each([
      [
        '00000000000000000000000000000000',
        1,
        0,
        undefined,
        '/api/v1/scores/00000000000000000000000000000000/1/0',
      ] as const,
      [
        '00000000000000000000000000000000',
        2,
        1,
        'full',
        '/api/v1/scores/00000000000000000000000000000000/2/1?scope=full',
      ] as const,
    ])(
      '($http, %s, %i, %i, %p) calls GET "%s"',
      async (songId, playStyle, difficulty, scope, uri) => {
        // Arrange
        $http.$get.mockClear()

        // Act
        const result = await getChartScore(
          $http,
          songId,
          playStyle,
          difficulty,
          scope
        )

        // Assert
        expect(result).toBe(scores)
        expect($http.$get.mock.calls).toHaveLength(1)
        expect($http.$get.mock.calls[0][0]).toBe(uri)
      }
    )
  })
  describe('postChartScore', () => {
    const songId = '00000000000000000000000000000000'
    const playStyle = 1
    const difficulty = 0
    test(`($http, "${songId}", ${playStyle}, ${difficulty}, score) calls POST "/api/v1/scores/${songId}/${playStyle}/${difficulty}"`, async () => {
      // Arrange
      const $http = { $post: jest.fn<Promise<any>, [string, any]>() }
      const score: Score = {
        clearLamp: 7,
        rank: 'AAA',
        score: 999800,
      }

      // Act
      await postChartScore($http, songId, playStyle, difficulty, score)

      // Assert
      expect($http.$post.mock.calls).toHaveLength(1)
      expect($http.$post.mock.calls[0][0]).toBe(
        '/api/v1/scores/00000000000000000000000000000000/1/0'
      )
      expect($http.$post.mock.calls[0][1]).toBe(score)
    })
  })
  describe('deleteChartScore', () => {
    const songId = '00000000000000000000000000000000'
    const playStyle = 2
    const difficulty = 1
    test(`($http, "${songId}", ${playStyle}, ${difficulty}) calls DELETE "/api/v1/scores/${songId}/${playStyle}/${difficulty}"`, async () => {
      // Arrange
      const $http = { delete: jest.fn<any, [string]>() }

      // Act
      await deleteChartScore($http, songId, playStyle, difficulty)

      // Assert
      expect($http.delete.mock.calls).toHaveLength(1)
      expect($http.delete.mock.calls[0][0]).toBe(
        '/api/v1/scores/00000000000000000000000000000000/2/1'
      )
    })
  })
  describe('postSongScores', () => {
    const songId = '00000000000000000000000000000000'
    test(`($http, "${songId}", scores) calls POST "/api/v1/scores/${songId}"`, async () => {
      // Arrange
      const $http = { $post: jest.fn<Promise<any>, [string, any]>() }
      const scores: ChartScore[] = [
        {
          playStyle: 1,
          difficulty: 0,
          clearLamp: 7,
          rank: 'AAA',
          score: 999800,
        },
      ]

      // Act
      await postSongScores($http, songId, scores)

      // Assert
      expect($http.$post).toBeCalledTimes(1)
      expect($http.$post).toBeCalledWith(
        '/api/v1/scores/00000000000000000000000000000000',
        scores
      )
    })
  })
})
