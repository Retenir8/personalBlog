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
import { authApi } from "@/lib/api"
import { useAuthStore } from "@/lib/store"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { PrivacyAgreement } from "@/components/ui/privacy-agreement"
import { getDefaultRoute } from "@/lib/permissions"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.username || !formData.password) {
      toast({
        title: "请填写完整信息",
        description: "用户名和密码不能为空",
        variant: "destructive",
      })
      return
    }

    if (!agreedToPrivacy) {
      toast({
        title: "请同意隐私政策",
        description: "请阅读并同意隐私政策后再登录",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await authApi.login(formData.username, formData.password)

      if (response.data.code === 200) {
        const { accessToken, refreshToken, user } = response.data.data
        setAuth(user, accessToken, refreshToken)
        toast({
          title: "登录成功",
          description: `欢迎回来，${user.name}！`,
        })
        router.push(getDefaultRoute(user.role))
      } else {
        toast({
          title: "登录失败",
          description: response.data.message || "用户名或密码错误",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "登录失败",
        description: error.response?.data?.message || "网络错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold">长者学院</CardTitle>
          <CardDescription className="text-lg">欢迎回来，请登录您的账户</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="username" className="text-lg">
                用户名
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="请输入用户名"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
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
                  placeholder="请输入密码"
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

            {/* 隐私协议勾选 */}
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

            <Button type="submit" className="h-14 w-full text-lg font-semibold" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  登录中...
                </>
              ) : (
                "登录"
              )}
            </Button>

            <div className="text-center">
              <p className="text-base text-muted-foreground">
                还没有账户？{" "}
                <Link href="/register" className="font-semibold text-primary hover:underline">
                  立即注册
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
