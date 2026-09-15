# 唐社长者学院后端接口测试用例（cURL 手册）

> 基础 URL 以 `http://localhost:8080` 为例，部署到其他环境请替换主机/端口。所有请求默认携带
`Content-Type: application/json`（除文件上传外）。
>
> 令牌说明：
> - `{{USER_TOKEN}}` 表示普通用户登录后返回的访问令牌。
> - `{{ADMIN_TOKEN}}` 表示管理员登录后返回的访问令牌。
> - 需要刷新令牌的接口暂未提供，若后续增加应补充测试用例。
>
> 建议准备两套账号：
> - 普通用户：`user1 / 123456`
> - 管理员：`admin1 / 123456`

---

## 0. 环境与前置检查

1. **健康检查**（若提供）：
   ```bash
   curl http://localhost:8080/actuator/health
   ```
2. **数据库初始数据**：确保存在用于测试的课程 / 用户，否则按以下测试步骤逐步创建。

---

## 1. 登录 / 注册模块

### 1.1 用户注册

- **目的**：验证新用户注册成功并返回 `user_id` 和访问令牌。
- **请求**
  ```bash
  curl -X POST http://localhost:8080/api/register \
    -H 'Content-Type: application/json' \
    -d '{
      "name": "张阿姨",
      "password": "123456"
    }'
  ```
- **期望响应 (200)**
  ```json
  {
    "code": 200,
    "message": "注册成功",
    "data": {
      "user_id": 1,
      "access_token": "xxxxx.yyyyy.zzzzz",
      "refresh_token": "xxxxx.yyyyy.zzzzz"
    }
  }
  ```
- **重复注册**（期望 409）
  ```bash
  curl -X POST http://localhost:8080/api/register \
    -H 'Content-Type: application/json' \
    -d '{
      "name": "张阿姨",
      "password": "123456"
    }'
  ```
- **缺少密码**（期望 400）
  ```bash
  curl -X POST http://localhost:8080/api/register \
    -H 'Content-Type: application/json' \
    -d '{ "name": "张阿姨" }'
  ```

### 1.2 用户登录

- **成功登录**
  ```bash
  curl -X POST http://localhost:8080/api/login \
    -H 'Content-Type: application/json' \
    -d '{
      "username": "张阿姨",
      "password": "123456"
    }'
  ```
- **密码错误**（期望 401）
  ```bash
  curl -X POST http://localhost:8080/api/login \
    -H 'Content-Type: application/json' \
    -d '{
      "username": "张阿姨",
      "password": "wrong-password"
    }'
  ```
- **用户不存在**（期望 404）
  ```bash
  curl -X POST http://localhost:8080/api/login \
    -H 'Content-Type: application/json' \
    -d '{
      "username": "不存在",
      "password": "123456"
    }'
  ```

### 1.3 获取个人信息

- **本人访问成功**
  ```bash
  curl http://localhost:8080/api/user/1 \
    -H 'Authorization: Bearer {{USER_TOKEN}}'
  ```
- **管理员访问其他用户**（成功）
  ```bash
  curl http://localhost:8080/api/user/1 \
    -H 'Authorization: Bearer {{ADMIN_TOKEN}}'
  ```
- **普通用户访问他人信息**（期望 403）
  ```bash
  curl http://localhost:8080/api/user/2 \
    -H 'Authorization: Bearer {{USER_TOKEN}}'
  ```
- **未登录访问**（期望 401）
  ```bash
  curl http://localhost:8080/api/user/1
  ```

### 1.4 更新个人资料

- **本人更新成功**
  ```bash
  curl -X PUT http://localhost:8080/api/user/1 \
    -H 'Authorization: Bearer {{USER_TOKEN}}' \
    -H 'Content-Type: application/json' \
    -d '{
      "name": "李四",
      "gender": "女",
      "hobbies": "书法, 太极",
      "avatar_url": "/uploads/avatar1.png",
      "health_condition": "膝盖不好"
    }'
  ```
- **管理员更新其他用户**（成功）
  ```bash
  curl -X PUT http://localhost:8080/api/user/1 \
    -H 'Authorization: Bearer {{ADMIN_TOKEN}}' \
    -H 'Content-Type: application/json' \
    -d '{ "name": "张阿姨" }'
  ```
- **普通用户修改他人信息**（403）

### 1.5 修改密码

- **成功**
  ```bash
  curl -X PUT http://localhost:8080/api/user/1/password \
    -H 'Authorization: Bearer {{USER_TOKEN}}' \
    -H 'Content-Type: application/json' \
    -d '{
      "oldPassword": "123456",
      "newPassword": "12345678"
    }'
  ```
- **旧密码错误 (401)**
- **普通用户修改他人密码 (403)**

---

## 2. 课程模块

### 2.1 获取课程列表

- **分页 + 分类 + 关键字过滤**
  ```bash
  curl 'http://localhost:8080/api/courses?page=1&pageSize=10&category=%E4%B9%A6%E6%B3%95&keyword=%E5%9F%BA%E7%A1%80'
  ```
- **仅分页**
  ```bash
  curl 'http://localhost:8080/api/courses?page=2&pageSize=5'
  ```
- **无过滤（默认）**
  ```bash
  curl http://localhost:8080/api/courses
  ```
- **页码越界（>total）**：返回空列表，总数保持实际值。
- **非法 pageSize（0 或 200）**：后端将回退到默认/最大值。

### 2.2 获取课程详情

- **存在课程**
  ```bash
  curl http://localhost:8080/api/course/3
  ```
- **已删除或不存在 (404)**
  ```bash
  curl http://localhost:8080/api/course/9999
  ```

### 2.3 创建课程（管理员）

- **成功**
  ```bash
  curl -X POST http://localhost:8080/api/course \
    -H 'Authorization: Bearer {{ADMIN_TOKEN}}' \
    -H 'Content-Type: application/json' \
    -d '{
      "title": "太极养生",
      "category": "运动",
      "description": "基础太极拳入门",
      "start_date": "2024-12-01",
      "end_date": "2024-12-31",
      "class_time": "每周三上午9:00-10:30",
      "location": "社区活动中心201室",
      "capacity": 25,
      "status": 0,
      "image_url": "/uploads/taiji.png",
      "contact_phone": "13888889999"
    }'
  ```
- **缺少必填字段 (400)**：省略 `title` 或 `start_date`。
- **capacity <= 0 (400)**
- **非管理员 (403)**

### 2.4 修改课程（管理员）

- **成功**
  ```bash
  curl -X PUT http://localhost:8080/api/course/3 \
    -H 'Authorization: Bearer {{ADMIN_TOKEN}}' \
    -H 'Content-Type: application/json' \
    -d '{ "title": "书法进阶", "capacity": 30, "status": 1 }'
  ```
- **非法状态值 (400)**：`"status": 9`
- **设置 end_date < start_date (400)**
- **非管理员 (403)**

### 2.5 删除课程（管理员）

- **成功**
  ```bash
  curl -X DELETE http://localhost:8080/api/course/3 \
    -H 'Authorization: Bearer {{ADMIN_TOKEN}}'
  ```
- **重复删除 (404)**：课程已逻辑删除。
- **普通用户删除 (403)**

---

## 3. 选课 / 报名模块

### 3.1 报名课程

- **成功报名**
  ```bash
  curl -X POST http://localhost:8080/api/enroll \
    -H 'Authorization: Bearer {{USER_TOKEN}}' \
    -H 'Content-Type: application/json' \
    -d '{ "course_id": 3 }'
  ```
- **重复报名 (409)**：对同一课程重复请求。
- **课程满员 (400)**：先制造满员再报名。
- **课程已结课 (400)**：课程状态为 2。
- **缺少 course_id (400)**：空请求体。
- **未登录 (401)**

### 3.2 取消报名

- **本人成功取消**
  ```bash
  curl -X DELETE http://localhost:8080/api/enroll/21 \
    -H 'Authorization: Bearer {{USER_TOKEN}}'
  ```
- **管理员取消他人报名（允许）**
  ```bash
  curl -X DELETE http://localhost:8080/api/enroll/21 \
    -H 'Authorization: Bearer {{ADMIN_TOKEN}}'
  ```
- **普通用户取消他人报名 (403)**
- **报名记录不存在 (404)**

### 3.3 获取用户报名课程列表

- **本人查询**
  ```bash
  curl http://localhost:8080/api/enroll/user/1 \
    -H 'Authorization: Bearer {{USER_TOKEN}}'
  ```
- **管理员查询任意用户**
  ```bash
  curl http://localhost:8080/api/enroll/user/1 \
    -H 'Authorization: Bearer {{ADMIN_TOKEN}}'
  ```
- **普通用户查询他人列表 (403)**
- **未登录 (401)**

### 3.4 管理员查看课程报名名单

- **成功**
  ```bash
  curl http://localhost:8080/api/enroll/course/3 \
    -H 'Authorization: Bearer {{ADMIN_TOKEN}}'
  ```
- **普通用户访问 (403)**
- **课程不存在 (404)**

---

## 4. 管理员用户管理

### 4.1 查询用户列表

- **成功**
  ```bash
  curl 'http://localhost:8080/api/admin/users?page=1&pageSize=10&keyword=%E7%94%B5%E8%AF%9D' \
    -H 'Authorization: Bearer {{ADMIN_TOKEN}}'
  ```
- **无过滤参数**：`curl http://localhost:8080/api/admin/users -H 'Authorization: Bearer {{ADMIN_TOKEN}}'`
- **分页边界**：`page=-1` 或 `pageSize=0`
- **普通用户访问 (403)**
- **未登录 (401)**

### 4.2 删除用户（逻辑删除）

- **成功**
  ```bash
  curl -X DELETE http://localhost:8080/api/admin/user/5 \
    -H 'Authorization: Bearer {{ADMIN_TOKEN}}'
  ```
- **重复删除 / 不存在 (404)**
- **普通用户尝试删除 (403)**

---

## 5. 文件上传接口

### 5.1 上传图片

- **成功**
  ```bash
  curl -X POST http://localhost:8080/api/upload/image \
    -H 'Authorization: Bearer {{USER_TOKEN}}' \
    -F 'file=@/path/to/avatar.png'
  ```
- **无文件 (400)**：`curl -X POST ... -F 'file='`
- **超出大小限制 (400/413)**：上传 >5MB 文件。
- **未登录 (401)**

---

## 6. 权限 / 认证专项测试

| 场景                   | 示例命令                                                                              | 预期状态 |
|----------------------|-----------------------------------------------------------------------------------|------|
| 未携带 token 访问受保护接口    | `curl http://localhost:8080/api/course/1`                                         | 401  |
| 使用普通用户 token 访问管理员接口 | `curl http://localhost:8080/api/course -H 'Authorization: Bearer {{USER_TOKEN}}'` | 403  |
| 使用过期 token（若可模拟）     | 手动伪造过期 JWT                                                                        | 401  |
| 携带管理员 token 访问普通接口   | 正常返回                                                                              |

---

## 7. 业务流程验证建议

1. **完整报名流程**：注册 → 登录 → 获取课程列表 → 报名 → 查询我的课程 → 取消报名 → 再查确认删除。
2. **课程管理流程（管理员）**：创建课程 → 修改信息 → 查询列表 → 删除 → 确认查询结果不含删除项。
3. **用户管理流程（管理员）**：查询用户 → 删除普通用户 → 用该用户 token 请求接口确认返回 404 / 403。
4. **异常兜底**：制造各种非法参数、超长字符串、SQL 注入字符（如 `keyword=' OR 1=1 --`）确认服务器稳定性。
5. **并发测试（可选）**：使用工具（如 `ab`、`wrk`）对报名/列表接口施压，观察容量限制是否生效。

---

## 8. 导入 Postman / Apifox 建议

- 将上述 cURL 命令转换为集合，设置全局变量：`baseUrl`、`userToken`、`adminToken`、`courseId`、`enrollmentId`、`userId`。
- 增加 pre-request script 自动刷新 token（若后续提供刷新接口）。
- 针对分页接口增加 `page`, `pageSize` 参数化用例。

如有新增接口（例如 Refresh Token、角色管理等），请在本文件相应模块下追加对应测试用例。EOF
