"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MainNav } from "@/components/layout/main-nav"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { enrollmentApi } from "@/lib/api"
import type { EnrolledCourse } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/lib/store"
import { getEnrollmentCancellationId } from "@/lib/enrollment"
import { Calendar, MapPin, Loader2, Trash2 } from "lucide-react"

export default function MyCoursesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuthStore()
  const [courses, setCourses] = useState<EnrolledCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelingId, setCancelingId] = useState<number | null>(null)
  const [courseToCancel, setCourseToCancel] = useState<EnrolledCourse | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // 处理客户端水合
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return

    // 检查用户是否已登录
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")
    
    console.log("检查认证状态:", { token: !!token, userData: !!userData })
    
    if (!token || !userData) {
      console.log("未找到认证信息，重定向到登录页")
      router.push("/login")
      return
    }

    // 如果有认证信息，直接获取课程
    fetchEnrolledCourses()
  }, [isHydrated, router])

  const fetchEnrolledCourses = async () => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")
    
    if (!token || !userData) {
      router.push("/login")
      return
    }

    let currentUser = user
    if (!currentUser) {
      try {
        currentUser = JSON.parse(userData)
      } catch (error) {
        console.error("解析用户数据失败:", error)
        router.push("/login")
        return
      }
    }

    if (!currentUser?.userId) {
      console.error("用户ID不存在")
      router.push("/login")
      return
    }

    setLoading(true)
    try {
      console.log("正在获取用户课程，用户ID:", currentUser.userId)
      const response = await enrollmentApi.getUserEnrollments(currentUser.userId)
      console.log("API响应:", response)
      
      if (response.data.code === 200) {
        setCourses(response.data.data)
      } else {
        toast({
          title: "获取课程失败",
          description: response.data.message,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("获取课程失败:", error)
      toast({
        title: "获取课程失败",
        description: error.response?.data?.message || "网络错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEnrollment = async () => {
    if (!courseToCancel) return

    setCancelingId(courseToCancel.course_id)
    try {
      const response = await enrollmentApi.cancelEnroll(getEnrollmentCancellationId(courseToCancel))
      if (response.data.code === 200) {
        toast({
          title: "取消报名成功",
          description: "您已成功取消该课程的报名",
        })
        // Refresh the list
        fetchEnrolledCourses()
      } else {
        toast({
          title: "取消报名失败",
          description: response.data.message,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "取消报名失败",
        description: error.response?.data?.message || "网络错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setCancelingId(null)
      setCourseToCancel(null)
    }
  }

  const statusMap = {
    0: { label: "未开始", variant: "secondary" as const },
    1: { label: "进行中", variant: "default" as const },
    2: { label: "已结课", variant: "outline" as const },
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
 
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">我的课程</h1>
          <p className="mt-2 text-base text-muted-foreground">查看和管理您已报名的课程</p>
        </div>

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-lg text-muted-foreground">加载课程中...</p>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center">
            <div className="text-center">
              <p className="text-xl text-muted-foreground">您还没有报名任何课程</p>
              <p className="mt-2 text-base text-muted-foreground">快去浏览课程并报名吧！</p>
              <Button onClick={() => router.push("/courses")} className="mt-6" size="lg">
                浏览课程
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const status = statusMap[course.status as keyof typeof statusMap]
              const isCanceling = cancelingId === course.course_id

              return (
                <Card key={course.course_id} className="flex flex-col">
                  <CardHeader className="space-y-2">
                    {course.imageUrl && (
                      <div className="mb-4 overflow-hidden rounded-lg">
                        <img
                          src={course.imageUrl}
                          alt={course.title}
                          className="aspect-video w-full object-cover transition-transform hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-2 text-xl font-bold leading-tight">{course.title}</h3>
                      <Badge className="shrink-0 text-sm" variant={status.variant}>
                        {status.label}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-3">
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 shrink-0" />
                        <span className="text-base">{course.class_time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 shrink-0" />
                        <span className="text-base">{course.location}</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex gap-2">
                    <Button
                      size="lg"
                      className="h-12 flex-1 text-base"
                      onClick={() => router.push(`/courses/${course.course_id}`)}
                    >
                      查看详情
                    </Button>
                    <Button
                      size="lg"
                      variant="destructive"
                      className="h-12 gap-2"
                      onClick={() => setCourseToCancel(course)}
                      disabled={isCanceling}
                    >
                      {isCanceling ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={!!courseToCancel} onOpenChange={(open) => !open && setCourseToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">确认取消报名</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              您确定要取消报名"{courseToCancel?.title}"吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-12 text-base">点错了</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelEnrollment}
              className="h-12 bg-destructive text-base text-white hover:bg-destructive/90"
            >
              确认取消
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
