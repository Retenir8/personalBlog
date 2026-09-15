'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Theme, themes, defaultTheme, getThemeByName } from './themes'

interface ThemeContextType {
  currentTheme: Theme
  setTheme: (themeName: string) => void
  availableThemes: Theme[]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultTheme)

  // 从localStorage加载保存的主题设置
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    
    if (savedTheme) {
      const theme = getThemeByName(savedTheme)
      if (theme) {
        setCurrentTheme(theme)
      }
    }
  }, [])

  // 应用CSS变量到根元素
  useEffect(() => {
    const root = document.documentElement
    const colors = currentTheme.colors.light

    // 应用主要颜色变量
    root.style.setProperty('--background', colors.background)
    root.style.setProperty('--foreground', colors.foreground)
    root.style.setProperty('--card', colors.card)
    root.style.setProperty('--card-foreground', colors.cardForeground)
    root.style.setProperty('--popover', colors.popover)
    root.style.setProperty('--popover-foreground', colors.popoverForeground)
    root.style.setProperty('--primary', colors.primary)
    root.style.setProperty('--primary-foreground', colors.primaryForeground)
    root.style.setProperty('--secondary', colors.secondary)
    root.style.setProperty('--secondary-foreground', colors.secondaryForeground)
    root.style.setProperty('--muted', colors.muted)
    root.style.setProperty('--muted-foreground', colors.mutedForeground)
    root.style.setProperty('--accent', colors.accent)
    root.style.setProperty('--accent-foreground', colors.accentForeground)
    root.style.setProperty('--destructive', colors.destructive)
    root.style.setProperty('--destructive-foreground', colors.destructiveForeground)
    root.style.setProperty('--border', colors.border)
    root.style.setProperty('--input', colors.input)
    root.style.setProperty('--ring', colors.ring)

    // 应用图表颜色
    root.style.setProperty('--chart-1', colors.chart1)
    root.style.setProperty('--chart-2', colors.chart2)
    root.style.setProperty('--chart-3', colors.chart3)
    root.style.setProperty('--chart-4', colors.chart4)
    root.style.setProperty('--chart-5', colors.chart5)

    // 应用侧边栏颜色
    root.style.setProperty('--sidebar-background', colors.sidebar.background)
    root.style.setProperty('--sidebar-foreground', colors.sidebar.foreground)
    root.style.setProperty('--sidebar-primary', colors.sidebar.primary)
    root.style.setProperty('--sidebar-primary-foreground', colors.sidebar.primaryForeground)
    root.style.setProperty('--sidebar-accent', colors.sidebar.accent)
    root.style.setProperty('--sidebar-accent-foreground', colors.sidebar.accentForeground)
    root.style.setProperty('--sidebar-border', colors.sidebar.border)
    root.style.setProperty('--sidebar-ring', colors.sidebar.ring)

    // 移除dark模式的class
    document.body.classList.remove('dark')
  }, [currentTheme])

  const setTheme = (themeName: string) => {
    const theme = getThemeByName(themeName)
    if (theme) {
      setCurrentTheme(theme)
      localStorage.setItem('theme', themeName)
    }
  }

  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    availableThemes: themes
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}