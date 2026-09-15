import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "./types"

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  setAuth: (user: User, token: string, refreshToken?: string) => void
  setTokens: (token: string, refreshToken: string) => void
  clearAuth: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      setAuth: (user, token, refreshToken) => {
        localStorage.setItem("token", token)
        localStorage.setItem("user", JSON.stringify(user))
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken)
        set({ user, token, refreshToken: refreshToken ?? null })
      },
      setTokens: (token, refreshToken) => {
        localStorage.setItem("token", token)
        localStorage.setItem("refreshToken", refreshToken)
        set({ token, refreshToken })
      },
      clearAuth: () => {
        localStorage.removeItem("token")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("user")
        set({ user: null, token: null, refreshToken: null })
      },
      updateUser: (userData) =>
        set((state) => {
          const updatedUser = state.user ? { ...state.user, ...userData } : null
          // 同步更新 localStorage 中的用户信息
          if (updatedUser) {
            localStorage.setItem("user", JSON.stringify(updatedUser))
          }
          return { user: updatedUser }
        }),
    }),
    {
      name: "auth-storage",
    },
  ),
)
