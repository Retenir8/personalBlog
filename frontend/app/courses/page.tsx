"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { MainNav } from "@/components/layout/main-nav"
import { CourseCard } from "@/components/courses/course-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { courseApi } from "@/lib/api"
import type { Course } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Search, Loader2 } from "lucide-react"

const categories = ["全部", "健康养生", "艺术文化", "运动健身", "科技数码", "手工制作", "音乐舞蹈", "语言学习", "其他"]

export default function CoursesPage() {
  const { toast } = useToast()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("全部")

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (selectedCategory !== "全部") {
        params.category = selectedCategory
      }
      if (searchKeyword) {
        params.keyword = searchKeyword
      }

      const response = await courseApi.getCourses(params)
      if (response.data.code === 200) {
        setCourses(response.data.data.list)
      } else {
        toast({
          title: "获取课程失败",
          description: response.data.message,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "获取课程失败",
        description: error.response?.data?.message || "网络错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [selectedCategory])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchCourses()
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <main className="container mx-auto px-4 py-8">
        {/* Search and Filter Section */}
        <div className="mb-8 space-y-6 rounded-lg bg-card p-6 shadow-sm">
          <h1 className="text-3xl font-bold">课程浏览</h1>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-base">
                  搜索课程
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="search"
                    type="text"
                    placeholder="输入课程名称或关键词"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="h-12 text-base"
                  />
                  <Button type="submit" size="lg" className="h-12 px-6">
                    <Search className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-base">
                  课程分类
                </Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category" className="h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category} className="text-base">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-lg text-muted-foreground">加载课程中...</p>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-xl text-muted-foreground">暂无课程</p>
              <p className="mt-2 text-base text-muted-foreground">请尝试其他搜索条件</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.course_id} course={course} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
