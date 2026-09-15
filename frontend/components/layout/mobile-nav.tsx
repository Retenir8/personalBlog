"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BookOpen, User, CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/home", label: "活动", icon: CalendarDays },
  { href: "/courses", label: "课程", icon: Home },
  { href: "/my-courses", label: "我的课程", icon: BookOpen },
  { href: "/profile", label: "个人中心", icon: User },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
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
