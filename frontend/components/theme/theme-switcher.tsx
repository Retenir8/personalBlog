'use client'

import { Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/lib/theme-context'

export function ThemeSwitcher() {
  const { currentTheme, setTheme, availableThemes } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Palette className="h-4 w-4" />
          <span className="sr-only">切换主题</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>选择主题配色</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {availableThemes.map((theme) => (
          <DropdownMenuItem
            key={theme.name}
            onClick={() => setTheme(theme.name)}
            className={`cursor-pointer ${
              currentTheme.name === theme.name ? 'bg-accent' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full border border-border"
                style={{ 
                  backgroundColor: theme.colors.light.primary 
                }}
              />
              <span>{theme.displayName}</span>
              {currentTheme.name === theme.name && (
                <span className="ml-auto text-xs text-muted-foreground">✓</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}