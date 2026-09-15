"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { MainNav } from "@/components/layout/main-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { courseApi, enrollmentApi } from "@/lib/api"
import type { Course } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/lib/store"
import { Calendar, MapPin, Users, Phone, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuthStore()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)

  const courseId = Number(params.id)

  useEffect(() => {
    fetchCourseDetail()
    checkEnrollmentStatus()
  }, [courseId])

  const fetchCourseDetail = async () => {
    setLoading(true)
    try {
      const response = await courseApi.getCourse(courseId)
      if (response.data.code === 200) {
        setCourse(response.data.data)
      } else {
        toast({
          title: "获取课程详情失败",
          description: response.data.message,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "获取课程详情失败",
        description: error.response?.data?.message || "网络错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const checkEnrollmentStatus = async () => {
    if (!user) return

    try {
      const response = await enrollmentApi.getUserEnrollments(user.userId)
      if (response.data.code === 200) {
        const enrolled = response.data.data.some((c) => c.course_id === courseId)
        setIsEnrolled(enrolled)
      }
    } catch (error) {
      // Silently fail
    }
  }

  const handleEnroll = async () => {
    if (!course) return

    setEnrolling(true)
    try {
      const response = await enrollmentApi.enroll(courseId)
      if (response.data.code === 200) {
        toast({
          title: "报名成功",
          description: "您已成功报名该课程",
        })
        setIsEnrolled(true)
        // Refresh course data to update enrollment count
        fetchCourseDetail()
      } else {
        toast({
          title: "报名失败",
          description: response.data.message,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "报名失败",
        description: error.response?.data?.message || "网络错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg text-muted-foreground">加载课程详情中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-muted-foreground">课程不存在</p>
            <Button onClick={() => router.push("/courses")} className="mt-4" size="lg">
              返回课程列表
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const statusMap = {
    0: { label: "未开始", variant: "secondary" as const },
    1: { label: "进行中", variant: "default" as const },
    2: { label: "已结课", variant: "outline" as const },
  }

  const status = statusMap[course.status]
  const availableSeats = course.capacity - course.enrolled
  const isFullyBooked = availableSeats <= 0
  const canEnroll = !isEnrolled && !isFullyBooked && course.status !== 2

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" size="lg" onClick={() => router.back()} className="mb-6 gap-2 text-base">
          <ArrowLeft className="h-5 w-5" />
          返回
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <div className="relative h-64 w-full overflow-hidden rounded-t-lg bg-muted md:h-96">
                {course.image_url ? (
                  <img
                    src={course.image_url || "/placeholder.svg"}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                    <span className="text-9xl font-bold text-primary/30">{course.title[0]}</span>
                  </div>
                )}
              </div>

              <CardHeader className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold leading-tight">{course.title}</h1>
                    <Badge variant="outline" className="text-base">
                      {course.category}
                    </Badge>
                  </div>
                  <Badge className="text-base" variant={status.variant}>
                    {status.label}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <h2 className="mb-3 text-xl font-semibold">课程简介</h2>
                  <p className="text-base leading-relaxed text-muted-foreground">{course.description}</p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">课程信息</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <Calendar className="mt-1 h-6 w-6 shrink-0 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">上课时间</p>
                        <p className="text-base font-semibold">{course.class_time}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="mt-1 h-6 w-6 shrink-0 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">上课地点</p>
                        <p className="text-base font-semibold">{course.location}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Users className="mt-1 h-6 w-6 shrink-0 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">报名人数</p>
                        <p className="text-base font-semibold">
                          {course.enrolled}/{course.capacity} 人
                        </p>
                      </div>
                    </div>

                    {course.contact_phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="mt-1 h-6 w-6 shrink-0 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">联系电话</p>
                          <p className="text-base font-semibold">{course.contact_phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-xl">报名信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-base">
                    <span className="text-muted-foreground">剩余名额</span>
                    <span className="font-semibold">
                      {isFullyBooked ? <span className="text-destructive">已满</span> : `${availableSeats} 人`}
                    </span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-muted-foreground">课程状态</span>
                    <span className="font-semibold">{status.label}</span>
                  </div>
                </div>

                <Separator />

                {isEnrolled ? (
                  <div className="flex items-center justify-center gap-2 rounded-lg bg-primary/10 p-4 text-primary">
                    <CheckCircle2 className="h-6 w-6" />
                    <span className="text-base font-semibold">您已报名该课程</span>
                  </div>
                ) : (
                  <Button
                    size="lg"
                    className="h-14 w-full text-lg font-semibold"
                    onClick={handleEnroll}
                    disabled={!canEnroll || enrolling}
                  >
                    {enrolling ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        报名中...
                      </>
                    ) : isFullyBooked ? (
                      "名额已满"
                    ) : course.status === 2 ? (
                      "课程已结束"
                    ) : (
                      "立即报名"
                    )}
                  </Button>
                )}

                {canEnroll && !enrolling && (
                  <p className="text-center text-sm text-muted-foreground">点击报名后，您可以在"我的课程"中查看</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
