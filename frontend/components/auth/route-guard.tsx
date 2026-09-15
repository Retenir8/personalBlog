"use client"

import { useEffect, useState, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { getRequiredRole, hasPermission } from "@/lib/permissions"
import { useAuthStore } from "@/lib/store"

export function RouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { token, user } = useAuthStore()
  const [hydrated, setHydrated] = useState(false)
  const requiredRole = getRequiredRole(pathname)

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated || !requiredRole) return
    if (!token || !user) {
      router.replace("/login")
    } else if (!hasPermission(user.role, requiredRole)) {
      router.replace("/courses")
    }
  }, [hydrated, requiredRole, router, token, user])

  if (requiredRole && (!hydrated || !token || !user || !hasPermission(user.role, requiredRole))) {
    return null
  }

  return children
}
