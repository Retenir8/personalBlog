"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { MainNav } from "@/components/layout/main-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { activityApi, careApi } from "@/lib/api"
import type { Activity, CareRecord, User } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { CalendarPlus, HeartPulse, Loader2, Trash2 } from "lucide-react"

const emptyRecord = { physicalStatus: "", mentalStatus: "", checkDetails: "", advice: "", checkedAt: "" }
const emptyActivity = { title: "", summary: "", activityDate: "", location: "", contactPhone: "" }

export default function CareWorkspacePage() {
  const { toast } = useToast()
  const [elders, setElders] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState("")
  const [records, setRecords] = useState<CareRecord[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [recordForm, setRecordForm] = useState(emptyRecord)
  const [activityForm, setActivityForm] = useState(emptyActivity)
  const [submitting, setSubmitting] = useState(false)

  const loadActivities = async () => {
    const response = await activityApi.getUpcoming(100)
    setActivities(response.data.data)
  }

  useEffect(() => {
    Promise.all([careApi.getElders(), activityApi.getUpcoming(100)])
      .then(([usersResponse, activitiesResponse]) => {
        setElders(usersResponse.data.data)
        setActivities(activitiesResponse.data.data)
        if (usersResponse.data.data.length > 0) setSelectedUserId(String(usersResponse.data.data[0].userId))
      })
      .catch((error) => toast({ title: "工作台加载失败", description: error.response?.data?.message || "网络错误", variant: "destructive" }))
  }, [toast])

  useEffect(() => {
    if (!selectedUserId) return
    careApi.getRecords(Number(selectedUserId))
      .then((response) => setRecords(response.data.data))
      .catch((error) => toast({ title: "健康记录加载失败", description: error.response?.data?.message || "网络错误", variant: "destructive" }))
  }, [selectedUserId, toast])

  const submitRecord = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedUserId || !recordForm.physicalStatus || !recordForm.mentalStatus) {
      toast({ title: "请填写长者及身心状态", variant: "destructive" })
      return
    }
    setSubmitting(true)
    try {
      await careApi.createRecord({
        userId: Number(selectedUserId),
        ...recordForm,
        checkedAt: recordForm.checkedAt ? new Date(recordForm.checkedAt).toISOString() : undefined,
      })
      const response = await careApi.getRecords(Number(selectedUserId))
      setRecords(response.data.data)
      setRecordForm(emptyRecord)
      toast({ title: "健康记录已保存" })
    } catch (error: any) {
      toast({ title: "保存失败", description: error.response?.data?.message || "网络错误", variant: "destructive" })
    } finally { setSubmitting(false) }
  }

  const submitActivity = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!activityForm.title || !activityForm.activityDate || !activityForm.location) {
      toast({ title: "请填写活动标题、时间和地点", variant: "destructive" })
      return
    }
    setSubmitting(true)
    try {
      await activityApi.create({ ...activityForm, activityDate: new Date(activityForm.activityDate).toISOString() })
      await loadActivities()
      setActivityForm(emptyActivity)
      toast({ title: "活动预告已发布" })
    } catch (error: any) {
      toast({ title: "发布失败", description: error.response?.data?.message || "网络错误", variant: "destructive" })
    } finally { setSubmitting(false) }
  }

  const deleteActivity = async (id: number) => {
    try {
      await activityApi.delete(id)
      await loadActivities()
      toast({ title: "活动已撤下" })
    } catch (error: any) {
      toast({ title: "撤下失败", description: error.response?.data?.message || "网络错误", variant: "destructive" })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-bold"><HeartPulse className="h-8 w-8 text-primary" />照护工作台</h1>
          <p className="mt-2 text-muted-foreground">记录长者身心状态和检查情况，并发布近期活动预告</p>
        </div>

        <Tabs defaultValue="records" className="space-y-6">
          <TabsList className="h-12">
            <TabsTrigger value="records" className="px-6 text-base">健康记录</TabsTrigger>
            <TabsTrigger value="activities" className="px-6 text-base">活动预告</TabsTrigger>
          </TabsList>

          <TabsContent value="records" className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>添加检查记录</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={submitRecord} className="space-y-4">
                  <div className="space-y-2"><Label htmlFor="elder">选择长者 *</Label><select id="elder" value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="h-12 w-full rounded-md border bg-background px-3 text-base"><option value="">请选择</option>{elders.map((elder) => <option key={elder.userId} value={elder.userId}>{elder.name}（{elder.age || "年龄未知"}岁）</option>)}</select></div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2"><Label htmlFor="physical">身体状态 *</Label><Input id="physical" value={recordForm.physicalStatus} onChange={(e) => setRecordForm({ ...recordForm, physicalStatus: e.target.value })} placeholder="如：血压平稳，行动正常" /></div>
                    <div className="space-y-2"><Label htmlFor="mental">心理状态 *</Label><Input id="mental" value={recordForm.mentalStatus} onChange={(e) => setRecordForm({ ...recordForm, mentalStatus: e.target.value })} placeholder="如：情绪愉快，睡眠良好" /></div>
                  </div>
                  <div className="space-y-2"><Label htmlFor="checkedAt">检查时间</Label><Input id="checkedAt" type="datetime-local" value={recordForm.checkedAt} onChange={(e) => setRecordForm({ ...recordForm, checkedAt: e.target.value })} /></div>
                  <div className="space-y-2"><Label htmlFor="details">最近检查情况</Label><Textarea id="details" value={recordForm.checkDetails} onChange={(e) => setRecordForm({ ...recordForm, checkDetails: e.target.value })} placeholder="记录血压、心率、复查结果等" /></div>
                  <div className="space-y-2"><Label htmlFor="advice">照护建议</Label><Textarea id="advice" value={recordForm.advice} onChange={(e) => setRecordForm({ ...recordForm, advice: e.target.value })} /></div>
                  <Button type="submit" disabled={submitting}>{submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}保存记录</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>历次检查记录</CardTitle></CardHeader>
              <CardContent className="max-h-[650px] space-y-4 overflow-y-auto">
                {records.length === 0 ? <p className="py-12 text-center text-muted-foreground">暂无检查记录</p> : records.map((record) => <div key={record.recordId} className="rounded-lg border p-4"><div className="mb-3 flex items-center justify-between"><strong>{new Date(record.checkedAt).toLocaleString("zh-CN")}</strong><Badge variant="secondary">{record.recorderName}</Badge></div><p><b>身体：</b>{record.physicalStatus}</p><p><b>心理：</b>{record.mentalStatus}</p>{record.checkDetails && <p className="mt-2 text-muted-foreground"><b>检查：</b>{record.checkDetails}</p>}{record.advice && <p className="mt-2 text-muted-foreground"><b>建议：</b>{record.advice}</p>}</div>)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities" className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><CalendarPlus />发布活动预告</CardTitle></CardHeader>
              <CardContent><form onSubmit={submitActivity} className="space-y-4"><div className="space-y-2"><Label htmlFor="activityTitle">活动标题 *</Label><Input id="activityTitle" value={activityForm.title} onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })} /></div><div className="space-y-2"><Label htmlFor="activitySummary">活动介绍</Label><Textarea id="activitySummary" value={activityForm.summary} onChange={(e) => setActivityForm({ ...activityForm, summary: e.target.value })} /></div><div className="space-y-2"><Label htmlFor="activityDate">开展日期和时间 *</Label><Input id="activityDate" type="datetime-local" value={activityForm.activityDate} onChange={(e) => setActivityForm({ ...activityForm, activityDate: e.target.value })} /></div><div className="space-y-2"><Label htmlFor="activityLocation">地点 *</Label><Input id="activityLocation" value={activityForm.location} onChange={(e) => setActivityForm({ ...activityForm, location: e.target.value })} /></div><div className="space-y-2"><Label htmlFor="activityPhone">联系电话</Label><Input id="activityPhone" value={activityForm.contactPhone} onChange={(e) => setActivityForm({ ...activityForm, contactPhone: e.target.value })} /></div><Button type="submit" disabled={submitting}>{submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}发布预告</Button></form></CardContent>
            </Card>
            <Card><CardHeader><CardTitle>已发布的近期活动</CardTitle></CardHeader><CardContent className="space-y-4">{activities.length === 0 ? <p className="py-12 text-center text-muted-foreground">暂无活动</p> : activities.map((activity) => <div key={activity.activityId} className="flex items-start justify-between gap-4 rounded-lg border p-4"><div><h3 className="font-semibold">{activity.title}</h3><p className="mt-1 text-sm text-muted-foreground">{new Date(activity.activityDate).toLocaleString("zh-CN")} · {activity.location}</p></div><Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteActivity(activity.activityId)}><Trash2 className="h-5 w-5" /></Button></div>)}</CardContent></Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
