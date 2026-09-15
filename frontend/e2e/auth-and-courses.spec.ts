import { expect, test, type Locator } from "@playwright/test"

async function expectReadableDestructiveToast(toast: Locator) {
  await expect(toast).toBeVisible()
  const colors = await toast.evaluate((element) => {
    const style = window.getComputedStyle(element)
    return { foreground: style.color, background: style.backgroundColor }
  })
  expect(colors.foreground).not.toBe(colors.background)
  expect(colors.foreground).toBe("rgb(255, 255, 255)")
}

test("登录表单错误提示包含可见文字", async ({ page }) => {
  await page.goto("/login")
  await page.getByRole("button", { name: "登录", exact: true }).click()

  const title = page.getByText("请填写完整信息", { exact: true })
  await expect(title).toBeVisible()
  await expect(page.getByText("用户名和密码不能为空", { exact: true })).toBeVisible()
  await expectReadableDestructiveToast(title.locator("xpath=ancestor::*[@data-state='open'][1]"))
})

test("注册失败提示包含可见的后端错误信息", async ({ page }) => {
  await page.goto("/register")
  await page.getByLabel("用户名").fill("demo_zhang")
  await page.getByLabel("密码", { exact: true }).fill("Demo@123456")
  await page.getByLabel("确认密码").fill("Demo@123456")
  await page.locator("#privacy-agreement").click()
  await page.locator("#terms-agreement").click()
  await page.getByRole("button", { name: "注册", exact: true }).click()

  const title = page.getByText("注册失败", { exact: true })
  await expect(title).toBeVisible()
  await expect(page.getByText("用户已存在", { exact: true })).toBeVisible()
  await expectReadableDestructiveToast(title.locator("xpath=ancestor::*[@data-state='open'][1]"))
})

test("演示用户可以登录并看到模拟课程", async ({ page }) => {
  await page.goto("/login")
  await page.getByLabel("用户名").fill("demo_zhang")
  await page.getByLabel("密码", { exact: true }).fill("Demo@123456")
  await page.locator("#privacy-agreement").click()
  await page.getByRole("button", { name: "登录", exact: true }).click()

  await expect(page).toHaveURL(/\/home$/)
  await expect(page.getByRole("heading", { name: "近期活动预告" })).toBeVisible()
  await expect(page.getByText("中秋诗词茶话会", { exact: true })).toBeVisible()
  await page.getByRole("link", { name: "课程浏览" }).first().click()
  await expect(page.getByRole("heading", { name: "课程浏览" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "智能手机轻松学" })).toBeVisible()
})

test("教师登录后进入课程工作台", async ({ page }) => {
  await page.goto("/login")
  await page.getByLabel("用户名").fill("demo_teacher")
  await page.getByLabel("密码", { exact: true }).fill("Demo@123456")
  await page.locator("#privacy-agreement").click()
  await page.getByRole("button", { name: "登录", exact: true }).click()

  await expect(page).toHaveURL(/\/admin\/courses$/)
  await expect(page.getByRole("heading", { name: "课程管理" })).toBeVisible()
  await expect(page.getByText("教师课程工作台", { exact: true })).toBeVisible()
  await expect(page.getByRole("link", { name: "用户管理" })).toHaveCount(0)
})

test("护理员登录后进入照护工作台", async ({ page }) => {
  await page.goto("/login")
  await page.getByLabel("用户名").fill("demo_caregiver")
  await page.getByLabel("密码", { exact: true }).fill("Demo@123456")
  await page.locator("#privacy-agreement").click()
  await page.getByRole("button", { name: "登录", exact: true }).click()

  await expect(page).toHaveURL(/\/care$/)
  await expect(page.getByRole("heading", { name: "照护工作台" })).toBeVisible()
  await expect(page.getByRole("tab", { name: "健康记录" })).toBeVisible()
  await expect(page.getByRole("tab", { name: "活动预告" })).toBeVisible()
})
