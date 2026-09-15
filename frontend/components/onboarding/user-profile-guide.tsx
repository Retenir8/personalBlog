"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, ChevronRight, User, Calendar, Heart, Shield, Check } from "lucide-react"

export interface UserProfileData {
  gender: "男" |"女" | "" | string
  age: string
  interests: string[]
  customInterest: string
  healthStatus: string
  healthDetails: string
}

interface UserProfileGuideProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (data: UserProfileData) => void
}

const INTEREST_TAGS = [
  "书法", "绘画", "音乐", "舞蹈", "太极", "瑜伽", 
  "园艺", "烹饪", "摄影", "旅游", "阅读", "手工",
  "象棋", "围棋", "麻将", "健身", "游泳", "登山"
]

const HEALTH_OPTIONS = [
  { value: "身体健康，无慢性疾病", label: "身体健康，无慢性疾病" },
  { value: "身体状况良好，偶有小毛病", label: "身体状况良好，偶有小毛病" },
  { value: "有一些慢性疾病，但控制良好", label: "有一些慢性疾病，但控制良好" },
  { value: "身体状况一般，需要特别关注", label: "身体状况一般，需要特别关注" }
]

export function UserProfileGuide({ open, onOpenChange, onComplete }: UserProfileGuideProps) {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [profileData, setProfileData] = useState<UserProfileData>({
    gender: "",
    age: "",
    interests: [],
    customInterest: "",
    healthStatus: "",
    healthDetails: ""
  })

  const totalSteps = 4

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1)
      } else {
        handleComplete()
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!profileData.gender) {
          toast({
            title: "请选择性别",
            description: "这将帮助我们为您推荐更合适的课程",
            variant: "destructive",
          })
          return false
        }
        return true
      case 2:
        if (!profileData.age || parseInt(profileData.age) < 1 || parseInt(profileData.age) > 120) {
          toast({
            title: "请输入有效的年龄",
            description: "年龄应该在1-120之间",
            variant: "destructive",
          })
          return false
        }
        return true
      case 3:
        if (profileData.interests.length === 0 && !profileData.customInterest.trim()) {
          toast({
            title: "请选择或输入您的兴趣爱好",
            description: "这将帮助我们为您推荐相关课程",
            variant: "destructive",
          })
          return false
        }
        return true
      case 4:
        if (!profileData.healthStatus) {
          toast({
            title: "请选择您的健康状况",
            description: "这将帮助我们为您推荐适合的课程",
            variant: "destructive",
          })
          return false
        }
        return true
      default:
        return true
    }
  }

  const handleComplete = () => {
    onComplete(profileData)
    toast({
      title: "个人信息完善成功！",
      description: "我们将根据您的信息为您推荐合适的课程",
    })
    onOpenChange(false)
  }

  const toggleInterest = (interest: string) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="mx-auto h-16 w-16 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">告诉我们您的性别</h3>
              <p className="text-muted-foreground">这将帮助我们为您推荐更合适的课程</p>
            </div>
            <RadioGroup
              value={profileData.gender}
              onValueChange={(value) => setProfileData(prev => ({ ...prev, gender: value }))}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-accent cursor-pointer">
                <RadioGroupItem value="男" id="male" />
                <Label htmlFor="male" className="text-lg cursor-pointer flex-1">男性</Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-accent cursor-pointer">
                <RadioGroupItem value="女" id="female" />
                <Label htmlFor="female" className="text-lg cursor-pointer flex-1">女性</Label>
              </div>
            </RadioGroup>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Calendar className="mx-auto h-16 w-16 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">请告诉我们您的年龄</h3>
              <p className="text-muted-foreground">我们会根据年龄推荐适合的课程难度</p>
            </div>
            <div className="space-y-3">
              <Label htmlFor="age" className="text-lg">年龄</Label>
              <Input
                id="age"
                type="number"
                placeholder="请输入您的年龄"
                value={profileData.age}
                onChange={(e) => setProfileData(prev => ({ ...prev, age: e.target.value }))}
                className="h-14 text-lg text-center"
                min="1"
                max="120"
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Heart className="mx-auto h-16 w-16 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">您的兴趣爱好</h3>
              <p className="text-muted-foreground">选择您感兴趣的领域，我们会推荐相关课程</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-lg mb-3 block">选择您感兴趣的标签（可多选）</Label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_TAGS.map((interest) => (
                    <Badge
                      key={interest}
                      variant={profileData.interests.includes(interest) ? "default" : "outline"}
                      className="cursor-pointer text-sm px-3 py-2 hover:bg-primary hover:text-primary-foreground"
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="customInterest" className="text-lg">或者输入其他兴趣爱好</Label>
                <Input
                  id="customInterest"
                  placeholder="请输入您的其他兴趣爱好"
                  value={profileData.customInterest}
                  onChange={(e) => setProfileData(prev => ({ ...prev, customInterest: e.target.value }))}
                  className="h-12 text-base"
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Shield className="mx-auto h-16 w-16 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">健康状况</h3>
              <p className="text-muted-foreground">了解您的健康状况，为您推荐合适强度的课程</p>
            </div>
            <div className="space-y-4">
              <RadioGroup
                value={profileData.healthStatus}
                onValueChange={(value) => setProfileData(prev => ({ ...prev, healthStatus: value }))}
                className="space-y-3"
              >
                {HEALTH_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="text-base cursor-pointer flex-1">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              <div className="space-y-3">
                <Label htmlFor="healthDetails" className="text-lg">补充说明（可选）</Label>
                <Textarea
                  id="healthDetails"
                  placeholder="如有特殊健康状况或需要注意的事项，请在此说明"
                  value={profileData.healthDetails}
                  onChange={(e) => setProfileData(prev => ({ ...prev, healthDetails: e.target.value }))}
                  className="min-h-[80px] text-base"
                />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">完善个人信息</DialogTitle>
          <DialogDescription className="text-center text-lg">
            让我们更好地了解您，为您推荐最合适的课程
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* 进度指示器 */}
          <div className="flex items-center justify-center mb-8">
            {Array.from({ length: totalSteps }, (_, i) => (
              <React.Fragment key={i}>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    i + 1 <= currentStep
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground text-muted-foreground"
                  }`}
                >
                  {i + 1 < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{i + 1}</span>
                  )}
                </div>
                {i < totalSteps - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-2 ${
                      i + 1 < currentStep ? "bg-primary" : "bg-muted-foreground"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* 步骤内容 */}
          <Card>
            <CardContent className="p-8">
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* 导航按钮 */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="h-12 px-6"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              上一步
            </Button>
            <Button
              onClick={handleNext}
              className="h-12 px-6"
            >
              {currentStep === totalSteps ? "完成" : "下一步"}
              {currentStep < totalSteps && <ChevronRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}