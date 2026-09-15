import { describe, expect, it } from "vitest"
import { getEnrollmentCancellationId } from "./enrollment"

describe("enrollment cancellation", () => {
  it("uses the enrollment id instead of the course id", () => {
    expect(
      getEnrollmentCancellationId({
        enrollment_id: 73,
        course_id: 18,
        title: "书法入门",
        class_time: "周一 09:00",
        location: "活动室",
        status: 1,
      }),
    ).toBe(73)
  })
})
