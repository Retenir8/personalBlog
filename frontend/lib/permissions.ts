import type { UserRole } from "./types"

export type Permission = "authenticated" | "admin" | "course_manager" | "care_staff"

const protectedRoutes: Array<{ path: string; permission: Permission }> = [
  { path: "/admin/courses", permission: "course_manager" },
  { path: "/admin", permission: "admin" },
  { path: "/care", permission: "care_staff" },
  { path: "/home", permission: "authenticated" },
  { path: "/courses", permission: "authenticated" },
  { path: "/my-courses", permission: "authenticated" },
  { path: "/profile", permission: "authenticated" },
]

export function hasPermission(userRole: UserRole | undefined, permission: Permission | UserRole): boolean {
  if (!userRole) return false
  if (permission === "authenticated" || permission === "user") return true
  if (permission === "admin") return userRole === "admin"
  if (permission === "course_manager" || permission === "teacher") {
    return userRole === "admin" || userRole === "teacher"
  }
  if (permission === "care_staff" || permission === "caregiver") {
    return userRole === "admin" || userRole === "caregiver"
  }
  return false
}

export function getRequiredRole(pathname: string): Permission | undefined {
  return protectedRoutes.find(({ path }) => pathname === path || pathname.startsWith(`${path}/`))?.permission
}

export function checkRoutePermission(pathname: string, userRole: UserRole | undefined): boolean {
  const requiredRole = getRequiredRole(pathname)
  return requiredRole ? hasPermission(userRole, requiredRole) : true
}

export function getDefaultRoute(role: UserRole | undefined): string {
  if (role === "admin") return "/admin"
  if (role === "teacher") return "/admin/courses"
  if (role === "caregiver") return "/care"
  return "/home"
}
