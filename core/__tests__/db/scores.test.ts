import { beforeAll, describe, expect, test, vi } from 'vitest'

import type { ScoreBody } from '../../src/api/score'
import {
  createScoreSchema,
  isClearLamp,
  isDanceLevel,
} from '../../src/db/scores'
import { calcMyGrooveRadar } from '../../src/score'
import {
  publicUser as user,
  testCourseData as course,
  testSongData as song,
} from '../data'

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
      { score: 800000, clearLamp: 5, rank: 'A', maxCombo: 100, exScore: 300 },
    ]
    const areaUser = { id: '13', name: '13', isPublic: false }

    test.each([
      [
        scores[0],
        user,
        {
          ...scores[0],
          songId: song.id,
          songName: song.name,
          playStyle: song.charts[0].playStyle,
          difficulty: song.charts[0].difficulty,
          level: song.charts[0].level,
          userId: user.id,
          userName: user.name,
          isPublic: user.isPublic,
          radar,
        },
      ],
      [
        scores[1],
        areaUser,
        {
          ...scores[1],
          songId: song.id,
          songName: song.name,
          playStyle: song.charts[0].playStyle,
          difficulty: song.charts[0].difficulty,
          level: song.charts[0].level,
          userId: areaUser.id,
          userName: areaUser.name,
          isPublic: areaUser.isPublic,
        },
      ],
    ])('(song, chart, %p, %p) returns %p', (score, user, expected) =>
      expect(
        createScoreSchema(song, song.charts[0], user, score)
      ).toStrictEqual(expected)
    )
    test.each([
      [
        scores[0],
        user,
        {
          ...scores[0],
          songId: course.id,
          songName: course.name,
          playStyle: course.charts[0].playStyle,
          difficulty: course.charts[0].difficulty,
          level: course.charts[0].level,
          userId: user.id,
          userName: user.name,
          isPublic: user.isPublic,
        },
      ],
      [
        scores[1],
        areaUser,
        {
          ...scores[1],
          songId: course.id,
          songName: course.name,
          playStyle: course.charts[0].playStyle,
          difficulty: course.charts[0].difficulty,
          level: course.charts[0].level,
          userId: areaUser.id,
          userName: areaUser.name,
          isPublic: areaUser.isPublic,
        },
      ],
    ])('(course, chart, %p, %p) returns %p', (score, user, expected) =>
      expect(
        createScoreSchema(course, course.charts[0], user, score)
      ).toStrictEqual(expected)
    )
    test.each([
      [
        scores[0],
        user,
        {
          ...scores[0],
          songId: song.id,
          songName: song.name,
          playStyle: song.charts[0].playStyle,
          difficulty: song.charts[0].difficulty,
          level: song.charts[0].level,
          userId: user.id,
          userName: user.name,
          isPublic: user.isPublic,
          radar,
          deleted: true,
        },
      ],
      [
        scores[1],
        areaUser,
        {
          ...scores[1],
          songId: song.id,
          songName: song.name,
          playStyle: song.charts[0].playStyle,
          difficulty: song.charts[0].difficulty,
          level: song.charts[0].level,
          userId: areaUser.id,
          userName: areaUser.name,
          isPublic: areaUser.isPublic,
          deleted: true,
        },
      ],
    ])('(deletedSong, chart, %p, %p) returns %p', (score, user, expected) =>
      expect(
        createScoreSchema(
          { ...song, deleted: true },
          song.charts[0],
          user,
          score
        )
      ).toStrictEqual(expected)
    )
  })
})
