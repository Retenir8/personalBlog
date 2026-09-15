import { describe, expect, it } from "vitest"
import { checkRoutePermission, getRequiredRole, hasPermission } from "./permissions"

describe("route permissions", () => {
  it("allows public pages without a user", () => {
    expect(checkRoutePermission("/login", undefined)).toBe(true)
  })

  it("protects nested course pages", () => {
    expect(getRequiredRole("/courses/42")).toBe("authenticated")
    expect(checkRoutePermission("/courses/42", undefined)).toBe(false)
  })

  it("allows regular users to access user pages", () => {
    expect(hasPermission("user", "user")).toBe(true)
    expect(checkRoutePermission("/my-courses", "user")).toBe(true)
  })

  it("prevents regular users from accessing admin pages", () => {
    expect(checkRoutePermission("/admin/courses/1/enrollments", "user")).toBe(false)
  })

  it("allows administrators to access all protected pages", () => {
    expect(checkRoutePermission("/admin/users", "admin")).toBe(true)
    expect(checkRoutePermission("/profile", "admin")).toBe(true)
  })

  it("allows teachers to manage courses but not users", () => {
    expect(checkRoutePermission("/admin/courses", "teacher")).toBe(true)
    expect(checkRoutePermission("/admin/users", "teacher")).toBe(false)
  })

  it("allows caregivers to open care workspace only", () => {
    expect(checkRoutePermission("/care", "caregiver")).toBe(true)
    expect(checkRoutePermission("/admin/courses", "caregiver")).toBe(false)
  })
})
