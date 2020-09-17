import { CourseInfoSchema, CourseSchema } from './db/songs'

/**
 * Object type returned by `/api/v1/courses/:id`
 * @see https://github.com/ddradar/ddradar/blob/master/api/getCourseInfo/README.md
 */
export type CourseInfo = CourseSchema

/**
 * Object type returned by `/api/v1/courses`
 * @see https://github.com/ddradar/ddradar/blob/master/api/getCourseList/README.md
 */
export type CourseListData = Pick<CourseSchema, 'id' | 'name' | 'series'> & {
  charts: Pick<CourseInfoSchema, 'playStyle' | 'difficulty' | 'level'>[]
}
