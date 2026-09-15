"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { authApi, userApi } from "@/lib/api"
import { useAuthStore } from "@/lib/store"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { UserProfileGuide,type UserProfileData } from "@/components/onboarding/user-profile-guide"
import { PrivacyAgreement } from "@/components/ui/privacy-agreement"
import { getDefaultRoute } from "@/lib/permissions"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  })
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name || !formData.password || !formData.confirmPassword) {
      toast({
        title: "请填写完整信息",
        description: "所有字段都不能为空",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "密码太短",
        description: "密码至少需要6个字符",
        variant: "destructive",
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "密码不匹配",
        description: "两次输入的密码不一致",
        variant: "destructive",
      })
      return
    }

    if (!agreedToPrivacy || !agreedToTerms) {
      toast({
        title: "请同意协议",
        description: "请阅读并同意隐私政策和服务条款",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await authApi.register(formData.name, formData.password)

      if (response.data.code === 200) {
        // 注册成功后，调用登录接口获取token
        const loginResponse = await authApi.login(formData.name, formData.password)
        
        if (loginResponse.data.code === 200) {
          const { accessToken, refreshToken, user } = loginResponse.data.data
          
          // 使用登录接口返回的完整用户信息和token
          setAuth(user, accessToken, refreshToken)
          toast({
            title: "注册成功",
            description: `欢迎加入，${user.name}！`,
          })
          
          // 显示用户信息完善引导
          setShowGuide(true)
        } else {
          // 登录失败，但注册已成功
          toast({
            title: "注册成功，但自动登录失败",
            description: "请手动登录",
            variant: "destructive",
          })
          router.push("/login")
        }
      } else {
        toast({
          title: "注册失败",
          description: response.data.message || "用户名已存在或注册失败",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "注册失败",
        description: error.response?.data?.message || "网络错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGuideComplete = async (profileData: UserProfileData) => {
    try {
      // 获取当前用户信息
      const currentUser = useAuthStore.getState().user
      if (!currentUser) {
        throw new Error("用户信息不存在")
      }

      // 调用API保存用户的个人信息
      await userApi.updateUser(currentUser.userId, {
        gender: profileData.gender,
        age: Number(profileData.age),
        hobbies: profileData.interests.join(", ")+"。"+profileData.customInterest, // 将兴趣数组转换为字符串
        healthCondition: profileData.healthStatus + "。"+profileData.healthDetails,
      })
      
      toast({
        title: "个人信息保存成功",
        description: "现在为您跳转到课程页面",
      })
      
      // 完成引导后跳转到课程页面
      router.push(getDefaultRoute(currentUser.role))
    } catch (error) {
      console.error("保存个人信息失败:", error)
      toast({
        title: "保存失败",
        description: "个人信息保存失败，但您仍可以正常使用",
        variant: "destructive",
      })
      // 即使保存失败也跳转到课程页面
      router.push("/courses")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold">长者学院</CardTitle>
          <CardDescription className="text-lg">创建您的账户，开始学习之旅</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-lg">
                用户名
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="请输入用户名"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-14 text-lg"
                disabled={loading}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-lg">
                密码
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="请输入密码（至少6个字符）"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-14 pr-12 text-lg"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="confirmPassword" className="text-lg">
                确认密码
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="请再次输入密码"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="h-14 pr-12 text-lg"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
            </div>

            {/* 隐私协议勾选 */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="privacy-agreement"
                  checked={agreedToPrivacy}
                  onCheckedChange={(checked) => {
                    // 使用setTimeout避免flushSync错误
                    setTimeout(() => {
                      setAgreedToPrivacy(checked as boolean);
                    }, 0);
                  }}
                  disabled={loading}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="privacy-agreement"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    我已阅读并同意
                    <PrivacyAgreement type="privacy">
                      <button
                        type="button"
                        className="text-primary hover:underline mx-1"
                      >
                        《隐私政策》
                      </button>
                    </PrivacyAgreement>
                  </label>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms-agreement"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => {
                    // 使用setTimeout避免flushSync错误
                    setTimeout(() => {
                      setAgreedToTerms(checked as boolean);
                    }, 0);
                  }}
                  disabled={loading}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="terms-agreement"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    我已阅读并同意
                    <PrivacyAgreement type="terms">
                      <button
                        type="button"
                        className="text-primary hover:underline mx-1"
                      >
                        《服务条款》
                      </button>
                    </PrivacyAgreement>
                  </label>
                </div>
              </div>
            </div>

            <Button type="submit" className="h-14 w-full text-lg font-semibold" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  注册中...
                </>
              ) : (
                "注册"
              )}
            </Button>

            <div className="text-center">
              <p className="text-base text-muted-foreground">
                已有账户？{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                  立即登录
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* 用户信息完善引导 */}
      <UserProfileGuide
        open={showGuide}
        onOpenChange={setShowGuide}
        onComplete={handleGuideComplete}
      />
    </div>
  )
}
