"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { MainNav } from "@/components/layout/main-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { userApi, uploadApi } from "@/lib/api"
import { useAuthStore } from "@/lib/store"
import { Loader2, Camera, Save } from "lucide-react"

export default function ProfilePage() {
  const { toast } = useToast()
  const { user, updateUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    age: "",
    phone: "",
    avatarUrl: "",
    hobbies: "",
    healthCondition: "",
  })

  // 页面加载时初始化表单数据
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.userId) {
        try {
          const response = await userApi.getUser(user.userId)
          if (response.data.code === 200) {
            const userData = response.data.data
            // 更新store中的用户信息
            updateUser(userData)
            // 更新表单数据
            setFormData({
              name: userData.name || "",
              gender: userData.gender || "",
              age: userData.age?.toString() || "",
              phone: userData.phone || "",
              avatarUrl: userData.avatarUrl || "",
              hobbies: userData.hobbies || "",
              healthCondition: userData.healthCondition || "",
            })
          }
        } catch (error: any) {
          console.error("获取用户信息失败:", error)
          toast({
            title: "获取用户信息失败",
            description: error.response?.data?.message || "网络错误，请稍后重试",
            variant: "destructive",
          })
        }
      } else if (user) {
        // 如果没有userId但有用户信息，直接使用store中的数据
        setFormData({
          name: user.name || "",
          gender: user.gender || "",
          age: user.age?.toString() || "",
          phone: user.phone || "",
          avatarUrl: user.avatarUrl || "",
          hobbies: user.hobbies || "",
          healthCondition: user.healthCondition || "",
        })
      }
    }

    fetchUserProfile()
  }, [user?.userId]) // 只依赖userId，避免无限循环

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "文件类型错误",
        description: "请选择图片文件",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "文件太大",
        description: "图片大小不能超过5MB",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    try {
      const response = await uploadApi.uploadImage(file)
      if (response.data.code === 200) {
        const imageUrl = response.data.data.image_url
        setFormData({ ...formData, avatarUrl: imageUrl })
        toast({
          title: "上传成功",
          description: "头像已更新",
        })
      } else {
        toast({
          title: "上传失败",
          description: response.data.message,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "上传失败",
        description: error.response?.data?.message || "网络错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    // Validation
    if (!formData.name) {
      toast({
        title: "请填写姓名",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const updateData: any = {
        name: formData.name,
        gender: formData.gender || undefined,
        age: formData.age ? Number(formData.age) : undefined,
        phone: formData.phone || undefined,
        avatarUrl: formData.avatarUrl || undefined,
        hobbies: formData.hobbies || undefined,
        healthCondition: formData.healthCondition || undefined,
      }

      const response = await userApi.updateUser(user.userId, updateData)
      if (response.data.code === 200) {
        // Update local store
        updateUser(updateData)
        toast({
          title: "保存成功",
          description: "您的个人信息已更新",
        })
      } else {
        toast({
          title: "保存失败",
          description: response.data.message,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "保存失败",
        description: error.response?.data?.message || "网络错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">个人资料</CardTitle>
              <CardDescription className="text-base">管理您的个人信息</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={formData.avatarUrl || "/defaultAvatar.svg"} alt={formData.name} />
                      <AvatarFallback className="text-4xl">{formData.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-0 right-0 h-10 w-10 rounded-full"
                      onClick={handleAvatarClick}
                      disabled={uploading}
                    >
                      {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <p className="text-sm text-muted-foreground">点击相机图标更换头像</p>
                </div>

                {/* Basic Info */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-lg">
                      姓名 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="请输入您的姓名"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-14 text-lg"
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-3">
                      <Label htmlFor="gender" className="text-lg">
                        性别
                      </Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => setFormData({ ...formData, gender: value })}
                      >
                        <SelectTrigger id="gender" className="h-14 text-lg" disabled={loading}>
                          <SelectValue placeholder="请选择性别" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="男" className="text-base">
                            男
                          </SelectItem>
                          <SelectItem value="女" className="text-base">
                            女
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="age" className="text-lg">
                        年龄
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="请输入年龄"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        className="h-14 text-lg"
                        disabled={loading}
                        min="1"
                        max="120"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="hobbies" className="text-lg">
                      兴趣爱好
                    </Label>
                    <Textarea
                      id="hobbies"
                      placeholder="请输入您的兴趣爱好"
                      value={formData.hobbies}
                      onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
                      className="min-h-24 text-lg"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="healthCondition" className="text-lg">
                      健康状况
                    </Label>
                    <Textarea
                      id="healthCondition"
                      placeholder="请输入您的健康状况（如有特殊需求请注明）"
                      value={formData.healthCondition}
                      onChange={(e) => setFormData({ ...formData, healthCondition: e.target.value })}
                      className="min-h-24 text-lg"
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button type="submit" size="lg" className="h-14 w-full gap-2 text-lg font-semibold" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      保存修改
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
