"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, BookOpen, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePermission } from "@/hooks/use-permission"

const navItems = [
  { href: "/admin", label: "仪表盘", icon: LayoutDashboard },
  { href: "/admin/courses", label: "课程管理", icon: BookOpen },
  { href: "/admin/users", label: "用户管理", icon: Users },
]

export function AdminMobileNav() {
  const pathname = usePathname()
  const { canAccessAdmin, canManageCourses } = usePermission()

  // 如果用户没有管理员权限，不显示导航
  if (!canManageCourses) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card md:hidden">
      <div className="flex items-center justify-around">
        {navItems.filter((item) => canAccessAdmin || item.href === "/admin/courses").map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-3 text-sm transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-base font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
