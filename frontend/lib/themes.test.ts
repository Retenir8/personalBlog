import { describe, expect, it } from "vitest"
import { themes } from "./themes"

describe("theme accessibility", () => {
  it.each(themes)("keeps destructive text distinct from its background in $name", (theme) => {
    expect(theme.colors.light.destructiveForeground).not.toBe(theme.colors.light.destructive)
    expect(theme.colors.dark.destructiveForeground).not.toBe(theme.colors.dark.destructive)
  })
})
