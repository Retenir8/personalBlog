import type React from "react"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/lib/theme-context"
import { RouteGuard } from "@/components/auth/route-guard"

const geistSans = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata = {
  title: "长者学院 - 选课平台",
  description: "为老年人打造的简单易用的选课平台",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider>
          <RouteGuard>{children}</RouteGuard>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
