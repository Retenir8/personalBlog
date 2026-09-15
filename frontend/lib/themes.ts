export interface Theme {
  name: string
  displayName: string
  colors: {
    light: {
      background: string
      foreground: string
      card: string
      cardForeground: string
      popover: string
      popoverForeground: string
      primary: string
      primaryForeground: string
      secondary: string
      secondaryForeground: string
      muted: string
      mutedForeground: string
      accent: string
      accentForeground: string
      destructive: string
      destructiveForeground: string
      border: string
      input: string
      ring: string
      chart1: string
      chart2: string
      chart3: string
      chart4: string
      chart5: string
      sidebar: {
        background: string
        foreground: string
        primary: string
        primaryForeground: string
        accent: string
        accentForeground: string
        border: string
        ring: string
      }
    }
    dark: {
      background: string
      foreground: string
      card: string
      cardForeground: string
      popover: string
      popoverForeground: string
      primary: string
      primaryForeground: string
      secondary: string
      secondaryForeground: string
      muted: string
      mutedForeground: string
      accent: string
      accentForeground: string
      destructive: string
      destructiveForeground: string
      border: string
      input: string
      ring: string
      chart1: string
      chart2: string
      chart3: string
      chart4: string
      chart5: string
      sidebar: {
        background: string
        foreground: string
        primary: string
        primaryForeground: string
        accent: string
        accentForeground: string
        border: string
        ring: string
      }
    }
  }
}

export const themes: Theme[] = [
  {
    name: 'classic-black-white',
    displayName: '经典黑白',
    colors: {
      light: {
        background: 'oklch(1 0 0)',
        foreground: 'oklch(0.145 0 0)',
        card: 'oklch(1 0 0)',
        cardForeground: 'oklch(0.145 0 0)',
        popover: 'oklch(1 0 0)',
        popoverForeground: 'oklch(0.145 0 0)',
        primary: 'oklch(0.205 0 0)',
        primaryForeground: 'oklch(0.985 0 0)',
        secondary: 'oklch(0.97 0 0)',
        secondaryForeground: 'oklch(0.205 0 0)',
        muted: 'oklch(0.97 0 0)',
        mutedForeground: 'oklch(0.556 0 0)',
        accent: 'oklch(0.97 0 0)',
        accentForeground: 'oklch(0.205 0 0)',
        destructive: 'oklch(0.577 0.245 27.325)',
        destructiveForeground: 'oklch(0.985 0 0)',
        border: 'oklch(0.922 0 0)',
        input: 'oklch(0.922 0 0)',
        ring: 'oklch(0.708 0 0)',
        chart1: 'oklch(0.646 0.222 41.116)',
        chart2: 'oklch(0.6 0.118 184.704)',
        chart3: 'oklch(0.398 0.07 227.392)',
        chart4: 'oklch(0.828 0.189 84.429)',
        chart5: 'oklch(0.769 0.188 70.08)',
        sidebar: {
          background: 'oklch(0.985 0 0)',
          foreground: 'oklch(0.145 0 0)',
          primary: 'oklch(0.205 0 0)',
          primaryForeground: 'oklch(0.985 0 0)',
          accent: 'oklch(0.97 0 0)',
          accentForeground: 'oklch(0.205 0 0)',
          border: 'oklch(0.922 0 0)',
          ring: 'oklch(0.708 0 0)'
        }
      },
      dark: {
        background: 'oklch(0.09 0 0)',
        foreground: 'oklch(0.92 0 0)',
        card: 'oklch(0.11 0 0)',
        cardForeground: 'oklch(0.92 0 0)',
        popover: 'oklch(0.11 0 0)',
        popoverForeground: 'oklch(0.92 0 0)',
        primary: 'oklch(0.85 0 0)',
        primaryForeground: 'oklch(0.09 0 0)',
        secondary: 'oklch(0.16 0 0)',
        secondaryForeground: 'oklch(0.85 0 0)',
        muted: 'oklch(0.16 0 0)',
        mutedForeground: 'oklch(0.65 0 0)',
        accent: 'oklch(0.16 0 0)',
        accentForeground: 'oklch(0.85 0 0)',
        destructive: 'oklch(0.55 0 0)',
        destructiveForeground: 'oklch(0.92 0 0)',
        border: 'oklch(0.18 0 0)',
        input: 'oklch(0.18 0 0)',
        ring: 'oklch(0.75 0 0)',
        chart1: 'oklch(0.75 0 0)',
        chart2: 'oklch(0.65 0 0)',
        chart3: 'oklch(0.55 0 0)',
        chart4: 'oklch(0.45 0 0)',
        chart5: 'oklch(0.35 0 0)',
        sidebar: {
          background: 'oklch(0.07 0 0)',
          foreground: 'oklch(0.92 0 0)',
          primary: 'oklch(0.85 0 0)',
          primaryForeground: 'oklch(0.09 0 0)',
          accent: 'oklch(0.14 0 0)',
          accentForeground: 'oklch(0.85 0 0)',
          border: 'oklch(0.16 0 0)',
          ring: 'oklch(0.75 0 0)'
        }
      }
    }
  },
  {
    name: 'warm-red',
    displayName: '温暖红色',
    colors: {
      light: {
        background: 'oklch(98% 0.01 15)',
        foreground: 'oklch(20% 0.02 15)',
        card: 'oklch(98% 0.01 15)',
        cardForeground: 'oklch(20% 0.02 15)',
        popover: 'oklch(98% 0.01 15)',
        popoverForeground: 'oklch(20% 0.02 15)',
        primary: 'oklch(55% 0.18 15)',
        primaryForeground: 'oklch(98% 0.01 15)',
        secondary: 'oklch(92% 0.05 15)',
        secondaryForeground: 'oklch(25% 0.02 15)',
        muted: 'oklch(95% 0.02 15)',
        mutedForeground: 'oklch(45% 0.02 15)',
        accent: 'oklch(92% 0.05 15)',
        accentForeground: 'oklch(25% 0.02 15)',
        destructive: 'oklch(62% 0.25 29)',
        destructiveForeground: 'oklch(98% 0.01 15)',
        border: 'oklch(90% 0.03 15)',
        input: 'oklch(90% 0.03 15)',
        ring: 'oklch(55% 0.18 15)',
        chart1: 'oklch(55% 0.18 15)',
        chart2: 'oklch(65% 0.15 35)',
        chart3: 'oklch(70% 0.12 55)',
        chart4: 'oklch(75% 0.10 75)',
        chart5: 'oklch(80% 0.08 95)',
        sidebar: {
          background: 'oklch(98% 0.01 15)',
          foreground: 'oklch(20% 0.02 15)',
          primary: 'oklch(55% 0.18 15)',
          primaryForeground: 'oklch(98% 0.01 15)',
          accent: 'oklch(92% 0.05 15)',
          accentForeground: 'oklch(25% 0.02 15)',
          border: 'oklch(90% 0.03 15)',
          ring: 'oklch(55% 0.18 15)'
        }
      },
      dark: {
        background: 'oklch(12% 0.02 15)',
        foreground: 'oklch(90% 0.01 15)',
        card: 'oklch(12% 0.02 15)',
        cardForeground: 'oklch(90% 0.01 15)',
        popover: 'oklch(12% 0.02 15)',
        popoverForeground: 'oklch(90% 0.01 15)',
        primary: 'oklch(65% 0.18 15)',
        primaryForeground: 'oklch(12% 0.02 15)',
        secondary: 'oklch(18% 0.05 15)',
        secondaryForeground: 'oklch(85% 0.01 15)',
        muted: 'oklch(18% 0.05 15)',
        mutedForeground: 'oklch(65% 0.02 15)',
        accent: 'oklch(18% 0.05 15)',
        accentForeground: 'oklch(85% 0.01 15)',
        destructive: 'oklch(62% 0.25 29)',
        destructiveForeground: 'oklch(98% 0.01 15)',
        border: 'oklch(20% 0.05 15)',
        input: 'oklch(20% 0.05 15)',
        ring: 'oklch(65% 0.18 15)',
        chart1: 'oklch(65% 0.18 15)',
        chart2: 'oklch(70% 0.15 35)',
        chart3: 'oklch(75% 0.12 55)',
        chart4: 'oklch(80% 0.10 75)',
        chart5: 'oklch(85% 0.08 95)',
        sidebar: {
          background: 'oklch(10% 0.02 15)',
          foreground: 'oklch(90% 0.01 15)',
          primary: 'oklch(65% 0.18 15)',
          primaryForeground: 'oklch(12% 0.02 15)',
          accent: 'oklch(18% 0.05 15)',
          accentForeground: 'oklch(85% 0.01 15)',
          border: 'oklch(20% 0.05 15)',
          ring: 'oklch(65% 0.18 15)'
        }
      }
    }
  },
  {
    name: 'ocean-blue',
    displayName: '海洋蓝色',
    colors: {
      light: {
        background: 'oklch(98% 0.01 220)',
        foreground: 'oklch(20% 0.02 220)',
        card: 'oklch(98% 0.01 220)',
        cardForeground: 'oklch(20% 0.02 220)',
        popover: 'oklch(98% 0.01 220)',
        popoverForeground: 'oklch(20% 0.02 220)',
        primary: 'oklch(55% 0.18 220)',
        primaryForeground: 'oklch(98% 0.01 220)',
        secondary: 'oklch(92% 0.05 220)',
        secondaryForeground: 'oklch(25% 0.02 220)',
        muted: 'oklch(95% 0.02 220)',
        mutedForeground: 'oklch(45% 0.02 220)',
        accent: 'oklch(92% 0.05 220)',
        accentForeground: 'oklch(25% 0.02 220)',
        destructive: 'oklch(62% 0.25 29)',
        destructiveForeground: 'oklch(98% 0.01 220)',
        border: 'oklch(90% 0.03 220)',
        input: 'oklch(90% 0.03 220)',
        ring: 'oklch(55% 0.18 220)',
        chart1: 'oklch(55% 0.18 220)',
        chart2: 'oklch(65% 0.15 200)',
        chart3: 'oklch(70% 0.12 180)',
        chart4: 'oklch(75% 0.10 160)',
        chart5: 'oklch(80% 0.08 140)',
        sidebar: {
          background: 'oklch(98% 0.01 220)',
          foreground: 'oklch(20% 0.02 220)',
          primary: 'oklch(55% 0.18 220)',
          primaryForeground: 'oklch(98% 0.01 220)',
          accent: 'oklch(92% 0.05 220)',
          accentForeground: 'oklch(25% 0.02 220)',
          border: 'oklch(90% 0.03 220)',
          ring: 'oklch(55% 0.18 220)'
        }
      },
      dark: {
        background: 'oklch(12% 0.02 220)',
        foreground: 'oklch(90% 0.01 220)',
        card: 'oklch(12% 0.02 220)',
        cardForeground: 'oklch(90% 0.01 220)',
        popover: 'oklch(12% 0.02 220)',
        popoverForeground: 'oklch(90% 0.01 220)',
        primary: 'oklch(65% 0.18 220)',
        primaryForeground: 'oklch(12% 0.02 220)',
        secondary: 'oklch(18% 0.05 220)',
        secondaryForeground: 'oklch(85% 0.01 220)',
        muted: 'oklch(18% 0.05 220)',
        mutedForeground: 'oklch(65% 0.02 220)',
        accent: 'oklch(18% 0.05 220)',
        accentForeground: 'oklch(85% 0.01 220)',
        destructive: 'oklch(62% 0.25 29)',
        destructiveForeground: 'oklch(98% 0.01 220)',
        border: 'oklch(20% 0.05 220)',
        input: 'oklch(20% 0.05 220)',
        ring: 'oklch(65% 0.18 220)',
        chart1: 'oklch(65% 0.18 220)',
        chart2: 'oklch(70% 0.15 200)',
        chart3: 'oklch(75% 0.12 180)',
        chart4: 'oklch(80% 0.10 160)',
        chart5: 'oklch(85% 0.08 140)',
        sidebar: {
          background: 'oklch(10% 0.02 220)',
          foreground: 'oklch(90% 0.01 220)',
          primary: 'oklch(65% 0.18 220)',
          primaryForeground: 'oklch(12% 0.02 220)',
          accent: 'oklch(18% 0.05 220)',
          accentForeground: 'oklch(85% 0.01 220)',
          border: 'oklch(20% 0.05 220)',
          ring: 'oklch(65% 0.18 220)'
        }
      }
    }
  },
  {
    name: 'forest-green',
    displayName: '森林绿色',
    colors: {
      light: {
        background: 'oklch(98% 0.01 140)',
        foreground: 'oklch(20% 0.02 140)',
        card: 'oklch(98% 0.01 140)',
        cardForeground: 'oklch(20% 0.02 140)',
        popover: 'oklch(98% 0.01 140)',
        popoverForeground: 'oklch(20% 0.02 140)',
        primary: 'oklch(55% 0.18 140)',
        primaryForeground: 'oklch(98% 0.01 140)',
        secondary: 'oklch(92% 0.05 140)',
        secondaryForeground: 'oklch(25% 0.02 140)',
        muted: 'oklch(95% 0.02 140)',
        mutedForeground: 'oklch(45% 0.02 140)',
        accent: 'oklch(92% 0.05 140)',
        accentForeground: 'oklch(25% 0.02 140)',
        destructive: 'oklch(62% 0.25 29)',
        destructiveForeground: 'oklch(98% 0.01 140)',
        border: 'oklch(90% 0.03 140)',
        input: 'oklch(90% 0.03 140)',
        ring: 'oklch(55% 0.18 140)',
        chart1: 'oklch(55% 0.18 140)',
        chart2: 'oklch(65% 0.15 120)',
        chart3: 'oklch(70% 0.12 100)',
        chart4: 'oklch(75% 0.10 80)',
        chart5: 'oklch(80% 0.08 60)',
        sidebar: {
          background: 'oklch(98% 0.01 140)',
          foreground: 'oklch(20% 0.02 140)',
          primary: 'oklch(55% 0.18 140)',
          primaryForeground: 'oklch(98% 0.01 140)',
          accent: 'oklch(92% 0.05 140)',
          accentForeground: 'oklch(25% 0.02 140)',
          border: 'oklch(90% 0.03 140)',
          ring: 'oklch(55% 0.18 140)'
        }
      },
      dark: {
        background: 'oklch(12% 0.02 140)',
        foreground: 'oklch(90% 0.01 140)',
        card: 'oklch(12% 0.02 140)',
        cardForeground: 'oklch(90% 0.01 140)',
        popover: 'oklch(12% 0.02 140)',
        popoverForeground: 'oklch(90% 0.01 140)',
        primary: 'oklch(65% 0.18 140)',
        primaryForeground: 'oklch(12% 0.02 140)',
        secondary: 'oklch(18% 0.05 140)',
        secondaryForeground: 'oklch(85% 0.01 140)',
        muted: 'oklch(18% 0.05 140)',
        mutedForeground: 'oklch(65% 0.02 140)',
        accent: 'oklch(18% 0.05 140)',
        accentForeground: 'oklch(85% 0.01 140)',
        destructive: 'oklch(62% 0.25 29)',
        destructiveForeground: 'oklch(98% 0.01 140)',
        border: 'oklch(20% 0.05 140)',
        input: 'oklch(20% 0.05 140)',
        ring: 'oklch(65% 0.18 140)',
        chart1: 'oklch(65% 0.18 140)',
        chart2: 'oklch(70% 0.15 120)',
        chart3: 'oklch(75% 0.12 100)',
        chart4: 'oklch(80% 0.10 80)',
        chart5: 'oklch(85% 0.08 60)',
        sidebar: {
          background: 'oklch(10% 0.02 140)',
          foreground: 'oklch(90% 0.01 140)',
          primary: 'oklch(65% 0.18 140)',
          primaryForeground: 'oklch(12% 0.02 140)',
          accent: 'oklch(18% 0.05 140)',
          accentForeground: 'oklch(85% 0.01 140)',
          border: 'oklch(20% 0.05 140)',
          ring: 'oklch(65% 0.18 140)'
        }
      }
    }
  },
  {
    name: 'elegant-purple',
    displayName: '优雅紫色',
    colors: {
      light: {
        background: 'oklch(98% 0.01 280)',
        foreground: 'oklch(20% 0.02 280)',
        card: 'oklch(98% 0.01 280)',
        cardForeground: 'oklch(20% 0.02 280)',
        popover: 'oklch(98% 0.01 280)',
        popoverForeground: 'oklch(20% 0.02 280)',
        primary: 'oklch(55% 0.18 280)',
        primaryForeground: 'oklch(98% 0.01 280)',
        secondary: 'oklch(92% 0.05 280)',
        secondaryForeground: 'oklch(25% 0.02 280)',
        muted: 'oklch(95% 0.02 280)',
        mutedForeground: 'oklch(45% 0.02 280)',
        accent: 'oklch(92% 0.05 280)',
        accentForeground: 'oklch(25% 0.02 280)',
        destructive: 'oklch(62% 0.25 29)',
        destructiveForeground: 'oklch(98% 0.01 280)',
        border: 'oklch(90% 0.03 280)',
        input: 'oklch(90% 0.03 280)',
        ring: 'oklch(55% 0.18 280)',
        chart1: 'oklch(55% 0.18 280)',
        chart2: 'oklch(65% 0.15 300)',
        chart3: 'oklch(70% 0.12 320)',
        chart4: 'oklch(75% 0.10 340)',
        chart5: 'oklch(80% 0.08 360)',
        sidebar: {
          background: 'oklch(98% 0.01 280)',
          foreground: 'oklch(20% 0.02 280)',
          primary: 'oklch(55% 0.18 280)',
          primaryForeground: 'oklch(98% 0.01 280)',
          accent: 'oklch(92% 0.05 280)',
          accentForeground: 'oklch(25% 0.02 280)',
          border: 'oklch(90% 0.03 280)',
          ring: 'oklch(55% 0.18 280)'
        }
      },
      dark: {
        background: 'oklch(12% 0.02 280)',
        foreground: 'oklch(90% 0.01 280)',
        card: 'oklch(12% 0.02 280)',
        cardForeground: 'oklch(90% 0.01 280)',
        popover: 'oklch(12% 0.02 280)',
        popoverForeground: 'oklch(90% 0.01 280)',
        primary: 'oklch(65% 0.18 280)',
        primaryForeground: 'oklch(12% 0.02 280)',
        secondary: 'oklch(18% 0.05 280)',
        secondaryForeground: 'oklch(85% 0.01 280)',
        muted: 'oklch(18% 0.05 280)',
        mutedForeground: 'oklch(65% 0.02 280)',
        accent: 'oklch(18% 0.05 280)',
        accentForeground: 'oklch(85% 0.01 280)',
        destructive: 'oklch(62% 0.25 29)',
        destructiveForeground: 'oklch(98% 0.01 280)',
        border: 'oklch(20% 0.05 280)',
        input: 'oklch(20% 0.05 280)',
        ring: 'oklch(65% 0.18 280)',
        chart1: 'oklch(65% 0.18 280)',
        chart2: 'oklch(70% 0.15 300)',
        chart3: 'oklch(75% 0.12 320)',
        chart4: 'oklch(80% 0.10 340)',
        chart5: 'oklch(85% 0.08 360)',
        sidebar: {
          background: 'oklch(10% 0.02 280)',
          foreground: 'oklch(90% 0.01 280)',
          primary: 'oklch(65% 0.18 280)',
          primaryForeground: 'oklch(12% 0.02 280)',
          accent: 'oklch(18% 0.05 280)',
          accentForeground: 'oklch(85% 0.01 280)',
          border: 'oklch(20% 0.05 280)',
          ring: 'oklch(65% 0.18 280)'
        }
      }
    }
  }
]

export const getThemeByName = (name: string): Theme | undefined => {
  return themes.find(theme => theme.name === name)
}

export const defaultTheme = themes[0] // 默认使用经典黑白主题
