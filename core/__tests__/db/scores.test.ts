import { beforeAll, describe, expect, test, vi } from 'vitest'

import type { ScoreBody } from '../../src/api/score'
import {
  createScoreSchema,
  isClearLamp,
  isDanceLevel,
} from '../../src/db/scores'
import { calcMyGrooveRadar } from '../../src/score'
import { publicUser, testCourseData, testSongData } from '../data'

vi.mock('../../src/score')

describe('./db/scores.ts', () => {
  describe('isClearLamp', () => {
    test.each([undefined, null, '1', {}, -1])('(%o) returns false', obj => {
      expect(isClearLamp(obj)).toBe(false)
    })
    test.each([0, 1, 7])('(%o) returns true', obj => {
      expect(isClearLamp(obj)).toBe(true)
    })
  })

  describe('isDanceLevel', () => {
    test.each([undefined, null, '1', {}, -1])('(%o) returns false', obj => {
      expect(isDanceLevel(obj)).toBe(false)
    })
    test.each(['E', 'A-', 'AA+', 'AAA'])('(%o) returns true', obj => {
      expect(isDanceLevel(obj)).toBe(true)
    })
  })

  describe('createScoreSchema', () => {
    const songInfo = { ...testSongData, ...testSongData.charts[0] }
    const courseInfo = { ...testCourseData, ...testCourseData.charts[0] }
    const radar = {
      stream: 100,
      voltage: 100,
      air: 100,
      freeze: 100,
      chaos: 100,
    }
    beforeAll(() => {
      vi.mocked(calcMyGrooveRadar).mockReturnValue(radar)
    })

    const scores: ScoreBody[] = [
      { score: 1000000, clearLamp: 7, rank: 'AAA' },
      { score: 800000, clearLamp: 3, rank: 'A', maxCombo: 100, exScore: 300 },
    ]
    const areaUser = { id: '13', name: '13', isPublic: false }

    test.each([
      [
        publicUser,
        scores[0],
        {
          ...scores[0],
          exScore:
            (songInfo.notes + songInfo.freezeArrow + songInfo.shockArrow) * 3,
          maxCombo: songInfo.notes + songInfo.shockArrow,
          songId: songInfo.id,
          songName: songInfo.name,
          playStyle: songInfo.playStyle,
          difficulty: songInfo.difficulty,
          level: songInfo.level,
          userId: publicUser.id,
          userName: publicUser.name,
          isPublic: publicUser.isPublic,
          radar,
        },
      ],
      [
        areaUser,
        scores[1],
        {
          ...scores[1],
          songId: songInfo.id,
          songName: songInfo.name,
          playStyle: songInfo.playStyle,
          difficulty: songInfo.difficulty,
          level: songInfo.level,
          userId: areaUser.id,
          userName: areaUser.name,
          isPublic: areaUser.isPublic,
        },
      ],
    ])('(songInfo, user: %o, scores: %o) returns %o', (user, score, expected) =>
      expect(createScoreSchema(songInfo, user, score)).toStrictEqual(expected)
    )
    test.each([
      [
        publicUser,
        scores[1],
        {
          ...scores[1],
          songId: courseInfo.id,
          songName: courseInfo.name,
          playStyle: courseInfo.playStyle,
          difficulty: courseInfo.difficulty,
          level: courseInfo.level,
          userId: publicUser.id,
          userName: publicUser.name,
          isPublic: publicUser.isPublic,
        },
      ],
      [
        areaUser,
        scores[0],
        {
          ...scores[0],
          exScore:
            (courseInfo.notes +
              courseInfo.freezeArrow +
              courseInfo.shockArrow) *
            3,
          maxCombo: courseInfo.notes + courseInfo.shockArrow,
          songId: courseInfo.id,
          songName: courseInfo.name,
          playStyle: courseInfo.playStyle,
          difficulty: courseInfo.difficulty,
          level: courseInfo.level,
          userId: areaUser.id,
          userName: areaUser.name,
          isPublic: areaUser.isPublic,
        },
      ],
    ])(
      '(courseInfo, user: %o, scores: %o) returns %o',
      (user, score, expected) =>
        expect(createScoreSchema(courseInfo, user, score)).toStrictEqual(
          expected
        )
    )
    test.each([
      [
        publicUser,
        scores[0],
        {
          ...scores[0],
          exScore:
            (songInfo.notes + songInfo.freezeArrow + songInfo.shockArrow) * 3,
          maxCombo: songInfo.notes + songInfo.shockArrow,
          songId: songInfo.id,
          songName: songInfo.name,
          playStyle: songInfo.playStyle,
          difficulty: songInfo.difficulty,
          level: songInfo.level,
          userId: publicUser.id,
          userName: publicUser.name,
          isPublic: publicUser.isPublic,
          radar,
          deleted: true,
        },
      ],
      [
        areaUser,
        scores[1],
        {
          ...scores[1],
          songId: songInfo.id,
          songName: songInfo.name,
          playStyle: songInfo.playStyle,
          difficulty: songInfo.difficulty,
          level: songInfo.level,
          userId: areaUser.id,
          userName: areaUser.name,
          isPublic: areaUser.isPublic,
          deleted: true,
        },
      ],
    ])(
      '(deletedSong, user: %o, scores: %o) returns %o',
      (user, score, expected) =>
        expect(
          createScoreSchema({ ...songInfo, deleted: true }, user, score)
        ).toStrictEqual(expected)
    )
  })
})
