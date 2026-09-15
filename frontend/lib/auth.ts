import { NextRequest, NextResponse } from 'next/server'
import { useAuthStore } from './store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import React from 'react'
import type { UserRole } from './types'
import { checkRoutePermission, hasPermission } from './permissions'

// 权限检查函数
export { checkRoutePermission, hasPermission } from './permissions'

// 导出 UserRole 类型
export type { UserRole }

// 路由权限配置
// 服务端权限中间件
export function requireAuth(requiredRole?: UserRole) {
  return async (request: NextRequest) => {
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // 这里应该验证 token 并获取用户信息
    // 暂时跳过 token 验证逻辑
    
    if (requiredRole) {
      // 从 token 中解析用户角色（实际项目中需要解码 JWT）
      // const userRole = parseTokenRole(token)
      // if (!hasPermission(userRole, requiredRole)) {
      //   return NextResponse.redirect(new URL('/unauthorized', request.url))
      // }
    }
    
    return NextResponse.next()
  }
}

// 客户端权限检查 Hook
export function useAuth(requiredRole?: UserRole) {
  const { user, token } = useAuthStore()
  const router = useRouter()
  
  useEffect(() => {
    if (!token || !user) {
      router.push('/login')
      return
    }
    
    if (requiredRole && !hasPermission(user.role, requiredRole)) {
      router.push('/courses') // 重定向到默认页面
      return
    }
  }, [token, user, requiredRole, router])
  
  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
    hasRequiredPermission: requiredRole ? hasPermission(user?.role, requiredRole) : true
  }
}

// 高阶组件：保护需要特定权限的组件
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredRole?: UserRole
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, hasRequiredPermission } = useAuth(requiredRole)
    
    if (!isAuthenticated) {
      return React.createElement('div', { className: "flex items-center justify-center min-h-screen" },
        React.createElement('div', { className: "text-center" },
          React.createElement('h1', { className: "text-2xl font-bold text-gray-900 mb-4" }, "请先登录"),
          React.createElement('p', { className: "text-gray-600" }, "您需要登录后才能访问此页面")
        )
      )
    }
    
    if (!hasRequiredPermission) {
      return React.createElement('div', { className: "flex items-center justify-center min-h-screen" },
        React.createElement('div', { className: "text-center" },
          React.createElement('h1', { className: "text-2xl font-bold text-gray-900 mb-4" }, "访问被拒绝"),
          React.createElement('p', { className: "text-gray-600 mb-4" }, "您没有权限访问此页面"),
          React.createElement('button', {
            onClick: () => window.history.back(),
            className: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          }, "返回上一页")
        )
      )
    }
    
    return React.createElement(WrappedComponent, props)
  }
}
