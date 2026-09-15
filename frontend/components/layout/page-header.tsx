"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface PageHeaderProps {
  title: string
  showBack?: boolean
}

export function PageHeader({ title, showBack = false }: PageHeaderProps) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card">
      <div className="flex h-16 items-center gap-4 px-4">
        {showBack && (
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-12 w-12">
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">返回</span>
          </Button>
        )}
        <h1 className="text-xl font-semibold text-balance">{title}</h1>
      </div>
    </header>
  )
}
