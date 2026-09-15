"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

interface PrivacyAgreementProps {
  children: React.ReactNode
  type?: "privacy" | "terms"
}

export function PrivacyAgreement({ children, type = "privacy" }: PrivacyAgreementProps) {
  const isPrivacy = type === "privacy"
  
  const title = isPrivacy ? "隐私政策" : "服务条款"
  const content = isPrivacy ? privacyContent : termsContent

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          <DialogDescription>
            请仔细阅读以下{isPrivacy ? "隐私政策" : "服务条款"}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 text-sm leading-relaxed">
            {content}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

const privacyContent = (
  <>
    <div>
      <h3 className="font-semibold mb-2">1. 信息收集</h3>
      <p className="text-muted-foreground">
        我们收集您在使用长者学院平台时提供的信息，包括但不限于：
      </p>
      <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
        <li>注册信息：用户名、密码等账户信息</li>
        <li>个人资料：年龄、性别、兴趣爱好、健康状况等</li>
        <li>学习记录：课程进度、学习时长、成绩等</li>
        <li>设备信息：IP地址、浏览器类型、操作系统等</li>
      </ul>
    </div>

    <div>
      <h3 className="font-semibold mb-2">2. 信息使用</h3>
      <p className="text-muted-foreground">
        我们使用收集的信息用于：
      </p>
      <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
        <li>提供个性化的学习体验和课程推荐</li>
        <li>改进平台功能和用户体验</li>
        <li>发送重要通知和学习提醒</li>
        <li>确保平台安全和防止欺诈行为</li>
      </ul>
    </div>

    <div>
      <h3 className="font-semibold mb-2">3. 信息保护</h3>
      <p className="text-muted-foreground">
        我们采取适当的技术和管理措施保护您的个人信息安全，包括：
      </p>
      <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
        <li>数据加密传输和存储</li>
        <li>访问权限控制</li>
        <li>定期安全审计</li>
        <li>员工保密培训</li>
      </ul>
    </div>

    <div>
      <h3 className="font-semibold mb-2">4. 信息共享</h3>
      <p className="text-muted-foreground">
        除以下情况外，我们不会与第三方共享您的个人信息：
      </p>
      <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
        <li>获得您的明确同意</li>
        <li>法律法规要求</li>
        <li>保护用户或公众的重大利益</li>
        <li>与可信的服务提供商合作（在严格保密协议下）</li>
      </ul>
    </div>

    <div>
      <h3 className="font-semibold mb-2">5. 您的权利</h3>
      <p className="text-muted-foreground">
        您有权：
      </p>
      <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
        <li>查看、更新或删除您的个人信息</li>
        <li>撤回对信息处理的同意</li>
        <li>要求限制信息处理</li>
        <li>投诉数据处理行为</li>
      </ul>
    </div>

    <div>
      <h3 className="font-semibold mb-2">6. 联系我们</h3>
      <p className="text-muted-foreground">
        如果您对本隐私政策有任何疑问或需要行使您的权利，请通过以下方式联系我们：
      </p>
      <p className="text-muted-foreground mt-2">
        邮箱：<br />
        电话：
      </p>
    </div>

    <div>
      <p className="text-xs text-muted-foreground">
        本隐私政策最后更新时间：2025年10月26日
      </p>
    </div>
  </>
)

const termsContent = (
  <>
    <div>
      <h3 className="font-semibold mb-2">1. 服务说明</h3>
      <p className="text-muted-foreground">
        长者学院是一个专为中老年人设计的在线学习平台，提供各类课程和学习资源。
        通过注册和使用本服务，您同意遵守本服务条款。
      </p>
    </div>

    <div>
      <h3 className="font-semibold mb-2">2. 用户责任</h3>
      <p className="text-muted-foreground">
        作为用户，您需要：
      </p>
      <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
        <li>提供真实、准确的注册信息</li>
        <li>妥善保管账户信息，不与他人共享</li>
        <li>遵守平台规则，不发布违法或不当内容</li>
        <li>尊重其他用户和讲师</li>
        <li>不进行任何可能损害平台的行为</li>
      </ul>
    </div>

    <div>
      <h3 className="font-semibold mb-2">3. 知识产权</h3>
      <p className="text-muted-foreground">
        平台上的所有内容，包括但不限于课程材料、视频、文本、图片等，均受知识产权法保护。
        未经授权，您不得复制、传播或商业使用这些内容。
      </p>
    </div>

    <div>
      <h3 className="font-semibold mb-2">4. 服务变更</h3>
      <p className="text-muted-foreground">
        我们保留随时修改、暂停或终止服务的权利。对于重大变更，我们会提前通知用户。
        继续使用服务即表示您接受变更后的条款。
      </p>
    </div>

    <div>
      <h3 className="font-semibold mb-2">5. 免责声明</h3>
      <p className="text-muted-foreground">
        在法律允许的范围内：
      </p>
      <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
        <li>我们不保证服务的连续性和无错误</li>
        <li>我们不对因使用服务而产生的任何损失承担责任</li>
        <li>我们不对第三方内容的准确性负责</li>
      </ul>
    </div>

    <div>
      <h3 className="font-semibold mb-2">6. 争议解决</h3>
      <p className="text-muted-foreground">
        因使用本服务产生的争议，应首先通过友好协商解决。
        协商不成的，提交至平台所在地有管辖权的人民法院解决。
      </p>
    </div>

    <div>
      <h3 className="font-semibold mb-2">7. 联系我们</h3>
      <p className="text-muted-foreground">
        如果您对本服务条款有任何疑问，请联系我们：
      </p>
      <p className="text-muted-foreground mt-2">
        邮箱：<br />
        电话：
      </p>
    </div>

    <div>
      <p className="text-xs text-muted-foreground">
        本服务条款最后更新时间：2025年10月26日
      </p>
    </div>
  </>
)