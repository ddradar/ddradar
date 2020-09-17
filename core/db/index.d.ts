import type { NotificationSchema } from './notification'
import type { ScoreSchema } from './scores'
import type { CourseSchema, SongSchema } from './songs'
import type { UserSchema } from './users'

export type SongOrCourseSchema = CourseSchema | SongSchema
export type {
  NotificationSchema,
  ScoreSchema,
  CourseSchema,
  SongSchema,
  UserSchema,
}
