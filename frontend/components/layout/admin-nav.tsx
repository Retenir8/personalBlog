"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/store"
import { usePermission } from "@/hooks/use-permission"
import { BookOpen, Users, LogOut, GraduationCap, LayoutDashboard } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()
  const { canAccessAdmin, canManageCourses, isTeacher } = usePermission()

  // 使用 useEffect 来处理权限检查和重定向，避免在渲染期间调用 router.push
  useEffect(() => {
    // 只在客户端执行重定向
    if (typeof window !== 'undefined' && !canManageCourses) {
      router.push("/home")
    }
  }, [canManageCourses, router])

  // 如果用户没有管理员权限，显示加载状态而不是 null
  if (!canManageCourses) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-card">
        <div className="container mx-auto flex h-20 items-center justify-center px-4">
          <div className="text-muted-foreground">正在验证权限...</div>
        </div>
      </header>
    )
  }

  const handleLogout = () => {
    clearAuth()
    router.push("/login")
  }

  const navItems = [
    ...(canAccessAdmin ? [{ href: "/admin", label: "仪表盘", icon: LayoutDashboard }] : []),
    { href: "/admin/courses", label: "课程管理", icon: BookOpen },
    ...(canAccessAdmin ? [{ href: "/admin/users", label: "用户管理", icon: Users }] : []),
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href={canAccessAdmin ? "/admin" : "/admin/courses"} className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">{canAccessAdmin ? "管理后台" : "教师课程工作台"}</span>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button variant={isActive ? "default" : "ghost"} size="lg" className="gap-2 text-base">
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/courses">
            <Button variant="outline" size="lg" className="gap-2 text-base bg-transparent">
              返回前台
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-14 gap-3 px-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatarUrl || "/defaultAvatar.svg"} alt={user?.name} />
                  <AvatarFallback className="text-lg">{user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="hidden flex-col items-start md:flex">
                  <span className="text-base">{user?.name}</span>
                  <span className="text-xs text-muted-foreground">{isTeacher ? "教师" : "管理员"}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-base">
                {isTeacher ? "教师" : "管理员"}
                <div className="text-xs text-muted-foreground font-normal">{isTeacher ? "课程管理权限" : "系统管理权限"}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="h-12 cursor-pointer text-base text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-5 w-5" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
