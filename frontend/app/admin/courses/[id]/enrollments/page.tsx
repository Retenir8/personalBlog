"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AdminNav } from "@/components/layout/admin-nav"
import { AdminMobileNav } from "@/components/layout/admin-mobile-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { enrollmentApi, courseApi, userApi } from "@/lib/api"
import type { EnrollmentUser, Course, User } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Loader2, Users, Phone, Heart, Activity } from "lucide-react"

export default function CourseEnrollmentsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [course, setCourse] = useState<Course | null>(null)
  const [enrollments, setEnrollments] = useState<EnrollmentUser[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<EnrollmentUser | null>(null)
  const [selectedUserDetails, setSelectedUserDetails] = useState<User | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loadingUserDetails, setLoadingUserDetails] = useState(false)

  const courseId = Number(params.id)

  useEffect(() => {
    fetchData()
  }, [courseId])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch course details
      const courseResponse = await courseApi.getCourse(courseId)
      if (courseResponse.data.code === 200) {
        setCourse(courseResponse.data.data)
      }

      // Fetch enrollments
      const enrollmentsResponse = await enrollmentApi.getCourseEnrollments(courseId)
      if (enrollmentsResponse.data.code === 200) {
        setEnrollments(enrollmentsResponse.data.data)
      }
    } catch (error: any) {
      toast({
        title: "获取数据失败",
        description: error.response?.data?.message || "网络错误",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUserClick = async (user: EnrollmentUser) => {
    setSelectedUser(user)
    setSelectedUserDetails(null) // 清空之前的详细信息
    setIsDialogOpen(true)
    setLoadingUserDetails(true)

    try {
      // 调用API获取用户详细信息
      const response = await userApi.getUser(user.user_id)
      if (response.data.code === 200) {
        setSelectedUserDetails(response.data.data)
      } else {
        toast({
          title: "获取用户详情失败",
          description: response.data.message || "未知错误",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "获取用户详情失败",
        description: error.response?.data?.message || "网络错误",
        variant: "destructive",
      })
    } finally {
      setLoadingUserDetails(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNav />
        <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />

      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <Button variant="ghost" size="lg" onClick={() => router.back()} className="mb-6 gap-2 text-base">
          <ArrowLeft className="h-5 w-5" />
          返回
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">{course?.title}</h1>
          <p className="mt-2 text-base text-muted-foreground">
            报名学员列表 ({enrollments.length}/{course?.capacity})
          </p>
        </div>

        {enrollments.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <Users className="mx-auto h-16 w-16 text-muted-foreground" />
                <p className="mt-4 text-xl text-muted-foreground">暂无报名学员</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((user) => (
              <Card key={user.user_id} className="cursor-pointer transition-colors hover:bg-muted/50" onClick={() => handleUserClick(user)}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user.avatar_url || "/defaultAvatar.svg"} alt={user.name} />
                      <AvatarFallback className="text-xl">{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{user.name}</CardTitle>
                      {user.gender && (
                        <Badge variant="outline" className="mt-1">
                          {user.gender}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
        
              </Card>
            ))}
          </div>
        )}

        {/* 用户详细信息弹窗 */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-xl">学员详细信息</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6">
                {/* 头像和基本信息 */}
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={selectedUser.avatar_url || "/defaultAvatar.svg"} alt={selectedUser.name} />
                    <AvatarFallback className="text-2xl">{selectedUser.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold">{selectedUser.name}</h3>
                    {selectedUser.gender && (
                      <Badge variant="outline" className="mt-2">
                        {selectedUser.gender}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* 加载状态 */}
                {loadingUserDetails && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">正在获取详细信息...</span>
                  </div>
                )}

                {/* 详细信息 */}
                {!loadingUserDetails && selectedUserDetails && (
                  <div className="space-y-4">
                    {/* 联系电话 */}
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 mt-0.5 text-blue-500 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-muted-foreground">联系电话</p>
                        <p className="mt-1">{selectedUserDetails.phone || "未设置"}</p>
                      </div>
                    </div>

                    {/* 兴趣爱好 */}
                    <div className="flex items-start gap-3">
                      <Heart className="h-5 w-5 mt-0.5 text-pink-500 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-muted-foreground">兴趣爱好</p>
                        <p className="mt-1">{selectedUserDetails.hobbies || selectedUser.hobbies || "未设置"}</p>
                      </div>
                    </div>
                    
                    {/* 健康状况 */}
                    <div className="flex items-start gap-3">
                      <Activity className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-muted-foreground">健康状况</p>
                        <p className="mt-1">{selectedUserDetails.healthCondition || selectedUser.health_condition || "未设置"}</p>
                      </div>
                    </div>

                    {/* 紧急联系人 */}
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 mt-0.5 flex-shrink-0 flex items-center justify-center">
                        <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-muted-foreground">紧急联系人</p>
                        <p className="mt-1">{selectedUserDetails.emergencyContact || "未设置"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 错误状态 */}
                {!loadingUserDetails && !selectedUserDetails && (
                  <div className="space-y-4">
                    <p className="text-center text-muted-foreground">无法获取详细信息，显示基本信息：</p>
                    
                    {/* 兴趣爱好 */}
                    <div className="flex items-start gap-3">
                      <Heart className="h-5 w-5 mt-0.5 text-pink-500 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-muted-foreground">兴趣爱好</p>
                        <p className="mt-1">{selectedUser.hobbies || "未设置"}</p>
                      </div>
                    </div>
                    
                    {/* 健康状况 */}
                    <div className="flex items-start gap-3">
                      <Activity className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-muted-foreground">健康状况</p>
                        <p className="mt-1">{selectedUser.health_condition || "未设置"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>

      <AdminMobileNav />
    </div>
  )
}
