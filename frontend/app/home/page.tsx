"use client"

import { useEffect, useState } from "react"
import { MainNav } from "@/components/layout/main-nav"
import { MobileNav } from "@/components/layout/mobile-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { activityApi } from "@/lib/api"
import type { Activity } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { CalendarDays, Clock, MapPin, Phone, Sparkles } from "lucide-react"

export default function HomePage() {
  const { toast } = useToast()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    activityApi.getUpcoming()
      .then((response) => setActivities(response.data.data))
      .catch((error) => toast({
        title: "获取活动失败",
        description: error.response?.data?.message || "网络错误",
        variant: "destructive",
      }))
      .finally(() => setLoading(false))
  }, [toast])

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container mx-auto px-4 py-8 pb-24">
        <section className="mb-8 rounded-2xl bg-primary px-6 py-8 text-primary-foreground">
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">长者学院活动首页</h1>
              <p className="mt-2 text-lg opacity-90">提前了解近期活动，安排好您的精彩生活</p>
            </div>
          </div>
        </section>

        <div className="mb-6 flex items-center gap-3">
          <CalendarDays className="h-7 w-7 text-primary" />
          <h2 className="text-2xl font-bold">近期活动预告</h2>
          <Badge variant="secondary">{activities.length} 场</Badge>
        </div>

        {loading ? (
          <p className="py-16 text-center text-lg text-muted-foreground">正在加载近期活动...</p>
        ) : activities.length === 0 ? (
          <Card><CardContent className="py-16 text-center text-lg text-muted-foreground">暂时没有活动预告，请稍后再来看看。</CardContent></Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {activities.map((activity) => {
              const date = new Date(activity.activityDate)
              return (
                <Card key={activity.activityId} className="overflow-hidden border-2 transition-shadow hover:shadow-lg">
                  <CardHeader className="bg-muted/40">
                    <Badge className="mb-2 w-fit">即将开展</Badge>
                    <CardTitle className="text-xl">{activity.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    {activity.summary && <p className="text-base leading-7 text-muted-foreground">{activity.summary}</p>}
                    <div className="flex gap-3"><CalendarDays className="mt-0.5 h-5 w-5 text-primary" /><span>{date.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}</span></div>
                    <div className="flex gap-3"><Clock className="mt-0.5 h-5 w-5 text-primary" /><span>{date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</span></div>
                    <div className="flex gap-3"><MapPin className="mt-0.5 h-5 w-5 text-primary" /><span>{activity.location}</span></div>
                    {activity.contactPhone && <div className="flex gap-3"><Phone className="mt-0.5 h-5 w-5 text-primary" /><span>{activity.contactPhone}</span></div>}
                    <p className="border-t pt-3 text-sm text-muted-foreground">发布人：{activity.publisherName}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  )
}
