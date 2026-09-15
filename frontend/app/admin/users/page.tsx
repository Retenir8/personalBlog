"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AdminNav } from "@/components/layout/admin-nav"
import { AdminMobileNav } from "@/components/layout/admin-mobile-nav"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { adminApi } from "@/lib/api"
import type { User } from "@/lib/types"
import type { UserRole } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Search, Loader2, Trash2 } from "lucide-react"

export default function AdminUsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async (keyword?: string) => {
    setLoading(true)
    try {
      const params: any = {}
      if (keyword) {
        params.keyword = keyword
      }

      const response = await adminApi.getUsers(params)
      if (response.data.code === 200) {
        setUsers(response.data.data.list)
      }
    } catch (error: any) {
      toast({
        title: "获取用户失败",
        description: error.response?.data?.message || "网络错误",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers(searchKeyword)
  }

  const handleDelete = async () => {
    if (!deletingUser) return

    try {
      const response = await adminApi.deleteUser(deletingUser.userId)
      if (response.data.code === 200) {
        toast({
          title: "删除成功",
        })
        fetchUsers()
      }
    } catch (error: any) {
      toast({
        title: "删除失败",
        description: error.response?.data?.message || "网络错误",
        variant: "destructive",
      })
    } finally {
      setDeletingUser(null)
    }
  }

  const handleRoleChange = async (user: User, role: UserRole) => {
    try {
      await adminApi.updateUserRole(user.userId, role)
      setUsers((current) => current.map((item) => item.userId === user.userId ? { ...item, role } : item))
      toast({ title: "角色更新成功" })
    } catch (error: any) {
      toast({
        title: "角色更新失败",
        description: error.response?.data?.message || "网络错误",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />

      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">用户管理</h1>
          <p className="mt-2 text-base text-muted-foreground">管理平台所有用户</p>
        </div>

        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="搜索用户名或电话"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="h-12 max-w-md text-base"
            />
            <Button type="submit" size="lg" className="h-12 gap-2">
              <Search className="h-5 w-5" />
              搜索
            </Button>
          </form>
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
                  <TableHead className="text-base">用户</TableHead>
                  <TableHead className="text-base">性别</TableHead>
                  <TableHead className="text-base">年龄</TableHead>
                  <TableHead className="text-base">联系电话</TableHead>
                  <TableHead className="text-base">用户类别</TableHead>
                  <TableHead className="text-base">状态</TableHead>
                  <TableHead className="text-right text-base">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatarUrl || "/defaultAvatar.svg"} alt={user.name} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.gender || "-"}</TableCell>
                    <TableCell>{user.age || "-"}</TableCell>
                    <TableCell>{user.phone || "-"}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role || "user"}
                        onValueChange={(value) => handleRoleChange(user, value as UserRole)}
                        disabled={user.role === "admin"}
                      >
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">普通用户</SelectItem>
                          <SelectItem value="teacher">教师</SelectItem>
                          <SelectItem value="caregiver">护理员</SelectItem>
                          {user.role === "admin" && <SelectItem value="admin">管理员</SelectItem>}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-600 text-white hover:bg-green-600" variant={user.status != 1 ? "default" : "secondary"}>
                        {user.status != 1 ? "正常" : "禁用"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingUser(user)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">确认删除</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              您确定要删除用户"{deletingUser?.name}"吗？此操作无法撤销。
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
