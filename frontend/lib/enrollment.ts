import type { EnrolledCourse } from "./types"

export function getEnrollmentCancellationId(course: EnrolledCourse): number {
  return course.enrollment_id
}
