"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminNav } from "@/components/layout/admin-nav"
import { AdminMobileNav } from "@/components/layout/admin-mobile-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { courseApi, uploadApi } from "@/lib/api"
import type { Course } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Plus, Pencil, Trash2, Loader2, Users } from "lucide-react"

const categories = ["健康养生", "艺术文化", "运动健身", "科技数码", "手工制作", "音乐舞蹈", "语言学习", "其他"]

export default function AdminCoursesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    start_date: "",
    end_date: "",
    class_time: "",
    location: "",
    capacity: "",
    status: "0",
    image_url: "",
    contact_phone: "",
  })

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const response = await courseApi.getCourses()
      if (response.data.code === 200) {
        setCourses(response.data.data.list)
      }
    } catch (error: any) {
      toast({
        title: "获取课程失败",
        description: error.response?.data?.message || "网络错误",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (course?: Course) => {
    if (course) {
      setEditingCourse(course)
      setFormData({
        title: course.title,
        category: course.category,
        description: course.description,
        start_date: course.start_date || "",
        end_date: course.end_date || "",
        class_time: course.class_time,
        location: course.location,
        capacity: course.capacity.toString(),
        status: course.status.toString(),
        image_url: course.image_url || "",
        contact_phone: course.contact_phone || "",
      })
    } else {
      setEditingCourse(null)
      setFormData({
        title: "",
        category: "",
        description: "",
        start_date: "",
        end_date: "",
        class_time: "",
        location: "",
        capacity: "",
        status: "0",
        image_url: "",
        contact_phone: "",
      })
    }
    setDialogOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "文件类型错误",
        description: "请选择图片文件",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    try {
      const response = await uploadApi.uploadImage(file)
      if (response.data.code === 200) {
        setFormData({ ...formData, image_url: response.data.data.image_url })
        toast({
          title: "上传成功",
        })
      }
    } catch (error: any) {
      toast({
        title: "上传失败",
        description: error.response?.data?.message || "网络错误",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.title ||
      !formData.category ||
      !formData.description ||
      !formData.class_time ||
      !formData.location ||
      !formData.capacity
    ) {
      toast({
        title: "请填写完整信息",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const data: any = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
        class_time: formData.class_time,
        location: formData.location,
        capacity: Number(formData.capacity),
        status: Number(formData.status),
        image_url: formData.image_url || undefined,
        contact_phone: formData.contact_phone || undefined,
      }

      if (editingCourse) {
        const response = await courseApi.updateCourse(editingCourse.course_id, data)
        if (response.data.code === 200) {
          toast({
            title: "更新成功",
          })
          fetchCourses()
          setDialogOpen(false)
        }
      } else {
        const response = await courseApi.createCourse(data)
        if (response.data.code === 200) {
          toast({
            title: "创建成功",
          })
          fetchCourses()
          setDialogOpen(false)
        }
      }
    } catch (error: any) {
      toast({
        title: editingCourse ? "更新失败" : "创建失败",
        description: error.response?.data?.message || "网络错误",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingCourse) return

    try {
      const response = await courseApi.deleteCourse(deletingCourse.course_id)
      if (response.data.code === 200) {
        toast({
          title: "删除成功",
        })
        fetchCourses()
      }
    } catch (error: any) {
      toast({
        title: "删除失败",
        description: error.response?.data?.message || "网络错误",
        variant: "destructive",
      })
    } finally {
      setDeletingCourse(null)
    }
  }

  const statusMap = {
    0: { label: "未开始", variant: "secondary" as const },
    1: { label: "进行中", variant: "default" as const },
    2: { label: "已结课", variant: "outline" as const },
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />

      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">课程管理</h1>
            <p className="mt-2 text-base text-muted-foreground">管理平台所有课程</p>
          </div>
          <Button size="lg" onClick={() => handleOpenDialog()} className="gap-2 text-base">
            <Plus className="h-5 w-5" />
            新建课程
          </Button>
        </div>

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-base">课程名称</TableHead>
                  <TableHead className="text-base">分类</TableHead>
                  <TableHead className="text-base">状态</TableHead>
                  <TableHead className="text-base">报名人数</TableHead>
                  <TableHead className="text-base">上课时间</TableHead>
                  <TableHead className="text-right text-base">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => {
                  const status = statusMap[course.status]
                  return (
                    <TableRow key={course.course_id}>
                      <TableCell className="font-medium">{course.title}</TableCell>
                      <TableCell>{course.category}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {course.enrolled}/{course.capacity}
                      </TableCell>
                      <TableCell>{course.class_time}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/admin/courses/${course.course_id}/enrollments`)}
                          >
                            <Users className="h-5 w-5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(course)}>
                            <Pencil className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingCourse(course)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{editingCourse ? "编辑课程" : "新建课程"}</DialogTitle>
            <DialogDescription className="text-base">填写课程信息</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base">
                  课程名称 *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-12 text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-base">
                  分类 *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category" className="h-12 text-base">
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-base">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base">
                课程简介 *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-24 text-base"
                required
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="class_time" className="text-base">
                  上课时间 *
                </Label>
                <Input
                  id="class_time"
                  value={formData.class_time}
                  onChange={(e) => setFormData({ ...formData, class_time: e.target.value })}
                  placeholder="例如：每周一 14:00-16:00"
                  className="h-12 text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-base">
                  上课地点 *
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="h-12 text-base"
                  required
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="capacity" className="text-base">
                  容量 *
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="h-12 text-base"
                  min="1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-base">
                  状态 *
                </Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger id="status" className="h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0" className="text-base">
                      未开始
                    </SelectItem>
                    <SelectItem value="1" className="text-base">
                      进行中
                    </SelectItem>
                    <SelectItem value="2" className="text-base">
                      已结课
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_phone" className="text-base">
                联系电话
              </Label>
              <Input
                id="contact_phone"
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image" className="text-base">
                课程图片
              </Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="h-12 text-base"
                disabled={uploading}
              />
              {formData.image_url && (
                <img
                  src={formData.image_url || "/placeholder.svg"}
                  alt="Preview"
                  className="mt-2 h-32 w-32 rounded object-cover"
                />
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                size="lg"
                className="text-base"
              >
                取消
              </Button>
              <Button type="submit" size="lg" className="text-base" disabled={submitting || uploading}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    保存中...
                  </>
                ) : (
                  "保存"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingCourse} onOpenChange={(open) => !open && setDeletingCourse(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">确认删除</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              您确定要删除课程"{deletingCourse?.title}"吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-12 text-base">取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="h-12 bg-destructive text-base text-destructive-foreground hover:bg-destructive/90"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AdminMobileNav />
    </div>
  )
}
