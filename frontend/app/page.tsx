"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { getDefaultRoute } from "@/lib/permissions"

export default function HomePage() {
  const router = useRouter()
  const { token, user } = useAuthStore()

  useEffect(() => {
    if (token) {
      router.replace(getDefaultRoute(user?.role))
    } else {
      router.replace("/login")
    }
  }, [token, user?.role, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">加载中...</h1>
      </div>
    </div>
  )
}
