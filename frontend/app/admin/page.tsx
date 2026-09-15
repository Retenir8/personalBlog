"use client"

import { useEffect, useState } from "react"
import { AdminNav } from "@/components/layout/admin-nav"
import { AdminMobileNav } from "@/components/layout/admin-mobile-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { courseApi, adminApi } from "@/lib/api"
import { BookOpen, Users, GraduationCap, TrendingUp } from "lucide-react"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalUsers: 0,
    totalEnrollments: 0,
    activeCourses: 0,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch courses
      const coursesResponse = await courseApi.getCourses()
      if (coursesResponse.data.code === 200) {
        const courses = coursesResponse.data.data.list
        const activeCourses = courses.filter((c) => c.status === 1).length
        const totalEnrollments = courses.reduce((sum, c) => sum + c.enrolled, 0)

        setStats((prev) => ({
          ...prev,
          totalCourses: courses.length,
          activeCourses,
          totalEnrollments,
        }))
      }

      // Fetch users
      const usersResponse = await adminApi.getUsers()
      if (usersResponse.data.code === 200) {
        setStats((prev) => ({
          ...prev,
          totalUsers: usersResponse.data.data.total,
        }))
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  const statCards = [
    {
      title: "总课程数",
      value: stats.totalCourses,
      icon: BookOpen,
      description: "平台所有课程",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "进行中课程",
      value: stats.activeCourses,
      icon: TrendingUp,
      description: "当前活跃课程",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "总用户数",
      value: stats.totalUsers,
      icon: Users,
      description: "注册用户总数",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "总报名数",
      value: stats.totalEnrollments,
      icon: GraduationCap,
      description: "累计报名人次",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />

      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">仪表盘</h1>
          <p className="mt-2 text-base text-muted-foreground">查看平台整体数据概览</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <div className={`rounded-full p-2 ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>

      <AdminMobileNav />
    </div>
  )
}
