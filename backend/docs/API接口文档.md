# 唐社长者学院选课平台 - 后端接口文档（当前已实现）

> 本文档基于代码实际实现自动整理，覆盖目前已实现的全部接口，并重点列出每个接口可能返回的响应。规划中但尚未实现的接口未纳入本文档。

---

## 1. 通用说明

- 接口前缀：`/api`
- 跨域：已开启（各 Controller 标注 `@CrossOrigin`）
- 认证方式：JWT
    - 登录/注册成功后返回 `accessToken`/`refreshToken`
    - 受保护接口通过 HTTP 头携带：`Authorization: Bearer <accessToken>`
    - 当使用 `@Auth(role = Role.ADMIN)` 时仅管理员可访问
- 统一响应结构（所有接口）：
  ```json
  {
    "code": 200,
    "message": "成功",
    "data": { }
  }
  ```
- 业务码与 HTTP 状态映射（以 `code` 为准）：
    - 200 -> 200 OK
    - 400 -> 400 Bad Request（参数非法/校验失败等）
    - 401 -> 401 Unauthorized（未携带/非法/过期 token、密码错误等）
    - 403 -> 403 Forbidden（权限不足/非管理员）
    - 404 -> 404 Not Found（资源不存在）
    - 409 -> 409 Conflict（资源冲突，如注册重名）
    - 500/554 -> 500 Internal Server Error（服务器错误）
- 时间与格式：后端 Jackson 已设置为 ISO-8601 时间格式、时区 Asia/Shanghai，日期字段为 `yyyy-MM-dd`。
- 分页参数（如适用）：`page`（页码，默认1）、`pageSize` 或 `page_size`（每页数量，默认10，最大100）。

### 1.1 全局错误（所有接口可能返回）

- 400 参数校验失败（`@Valid` 或类型不匹配等）：返回首个字段错误信息
- 401 认证失败：
    - `token未提供`（缺少 Authorization 头）
    - `token格式错误`（非 `Bearer <token>`）
    - `Token 已过期，请重新登录` / `Token 无效，请检查后重试`
- 403 权限不足：`需要管理员权限`、或数据级校验失败（如访问/修改他人信息）
- 404 数据不存在：如用户/课程不存在
- 409 资源冲突：如注册用户已存在
- 500 未知/数据库/服务内部错误
- 文件上传专属：
    - 400 `文件不能为空` / `文件大小不能超过 5MB` / `不支持的文件类型，仅支持: JPG, PNG, GIF, WEBP` / `文件名不能为空` /
      `文件扩展名不合法`
    - 400 `文件大小超过限制，最大允许 5MB`（Spring 统一异常）

---

## 2. 认证模块

### 2.1 注册

- 方法与路径：`POST /api/register`
- 请求体：
  ```json
  { "username": "zhangsan", "password": "123456" }
  ```
- 成功响应（200 登录态）
  ```json
  {
    "code": 200,
    "message": "注册成功",
    "data": {
      "userId": 1,
      "accessToken": "<jwt>",
      "refreshToken": "<jwt>"
    }
  }
  ```
- 可能的错误：
    - 409 `用户已存在`
    - 400 `非法参数: ...`（缺少/类型不符等）
    - 500 `数据库操作失败，请稍后再试` 或其他通用错误

### 2.2 登录

- 方法与路径：`POST /api/login`
- 请求体：
  ```json
  { "username": "zhangsan", "password": "123456" }
  ```
- 成功响应（200 登录态）
  ```json
  {
    "code": 200,
    "message": "登录成功",
    "data": {
      "assessToken": "<jwt>",
      "refreshToken": "<jwt>",
      "user": { "userId": 1, "name": "zhangsan", "avatarUrl": "/uploads/avatar.jpg" }
    }
  }
  ```
  注：字段名为 `assessToken`（代码中如此定义）。
- 可能的错误：
    - 404 `用户不存在`
    - 401 `用户名或密码错误`
    - 500 通用错误

---

## 3. 用户模块（需要登录）

基础路径：`/api/user`

### 3.1 获取用户信息

- 方法与路径：`GET /api/user/{userId}`（`@Auth`）
- 业务规则：普通用户仅能查看自己的信息；管理员可查看任意用户
- 成功响应（200）
  ```json
  {
    "code": 200,
    "message": "获取用户信息成功",
    "data": { "userId": 1, "name": "张三", "gender": "男", "avatarUrl": "...", "hobbies": "...", "healthCondition": "..." }
  }
  ```
- 可能的错误：
    - 403 `无权访问其他用户信息`
    - 404 `用户不存在`

### 3.2 更新用户信息（部分更新）

- 方法与路径：`PUT /api/user/{userId}`（`@Auth`）
- 业务规则：普通用户仅能修改自己的信息；管理员可修改任意用户
- 请求体（包含需更新字段即可；未提供的不变）：
  ```json
  { "name": "张三", "gender": "男", "avatarUrl": "...", "hobbies": "...", "healthCondition": "..." }
  ```
- 成功响应（200）
  ```json
  { "code": 200, "message": "更新用户信息成功", "data": null }
  ```
- 可能的错误：
    - 403 `无权修改其他用户信息`
    - 404 `用户不存在`
    - 500 `更新用户信息失败`

### 3.3 修改密码

- 方法与路径：`PUT /api/user/{userId}/password`（`@Auth`）
- 业务规则：普通用户仅能修改自己的密码；管理员可修改任意用户
- 请求体：
  ```json
  { "oldPassword": "******", "newPassword": "******" }
  ```
- 成功响应（200）
  ```json
  { "code": 200, "message": "修改密码成功", "data": null }
  ```
- 可能的错误：
    - 400 `旧密码不能为空` / `新密码不能为空`
    - 404 `用户不存在`
    - 401 `旧密码错误`
    - 500 `修改密码失败`

---

## 4. 课程模块

基础路径：`/api`

### 4.1 获取课程列表（公开）

- 方法与路径：`GET /api/courses`
- 查询参数：
    - `category`（字符串，可选）
    - `keyword`（字符串，可选）
    - `page`（整数，可选，默认 1）
    - `pageSize` 或 `page_size`（整数，可选，默认 10，最大 100）
- 成功响应（200）
  ```json
  {
    "code": 200,
    "message": "获取课程列表成功",
    "data": { "list": [ { "course_id": 1, "title": "...", "category": "...", "description": "...", "class_time": "...", "location": "...", "capacity": 20, "status": 0, "image_url": "...", "contact_phone": "...", "enrolled": 8 } ], "total": 1 }
  }
  ```

### 4.2 获取课程详情（公开）

- 方法与路径：`GET /api/course/{courseId}`
- 成功响应（200）
  ```json
  {
    "code": 200,
    "message": "获取课程详情成功",
    "data": { "course_id": 1, "title": "...", "category": "...", "description": "...", "start_date": "2024-10-24", "end_date": "2024-12-01", "class_time": "...", "location": "...", "capacity": 20, "status": 0, "image_url": "...", "contact_phone": "...", "enrolled": 8, "created_at": "...", "updated_at": "..." }
  }
  ```
- 可能的错误：
    - 404 `课程不存在`

### 4.3 新增课程（管理员）

- 方法与路径：`POST /api/course`（`@Auth(role = ADMIN)`）
- 请求体（必填字段已在注解中校验）：
  ```json
  {
    "title": "书法基础",
    "category": "手工",
    "description": "...",
    "start_date": "2024-11-01",
    "end_date": "2024-12-01",
    "class_time": "每周五上午9:30",
    "location": "文化馆302室",
    "capacity": 20,
    "status": 0,
    "image_url": "/uploads/shufa.png",
    "contact_phone": "13800000000"
  }
  ```
- 成功响应（200）
  ```json
  { "code": 200, "message": "课程创建成功", "data": { "course_id": 12 } }
  ```
- 可能的错误：
    - 400 `课程状态不合法` / `开课日期不能为空` / `结课日期不能早于开课日期` / `招生人数必须大于0`
    - 400 参数校验失败（`@Valid`）
    - 403 `需要管理员权限`

### 4.4 修改课程（管理员，部分更新）

- 方法与路径：`PUT /api/course/{courseId}`（`@Auth(role = ADMIN)`）
- 请求体（任意提供需要更新的字段）：同 4.3 的字段集
- 成功响应（200）
  ```json
  { "code": 200, "message": "修改成功", "data": null }
  ```
- 可能的错误：
    - 404 `课程不存在`
    - 400 `课程状态不合法` / `开课日期不能为空` / `结课日期不能早于开课日期`
    - 500 `修改课程失败`
    - 403 `需要管理员权限`

### 4.5 删除课程（管理员，逻辑删除）

- 方法与路径：`DELETE /api/course/{courseId}`（`@Auth(role = ADMIN)`）
- 成功响应（200）
  ```json
  { "code": 200, "message": "删除成功", "data": null }
  ```
- 可能的错误：
    - 404 `课程不存在`
    - 500 `删除课程失败`
    - 403 `需要管理员权限`

---

## 5. 文件上传模块（需要登录）

基础路径：`/api/upload`

### 5.1 上传图片

- 方法与路径：`POST /api/upload/image`（`@Auth`）
- 请求头：`Authorization: Bearer <accessToken>`
- 请求方式：`multipart/form-data`
- 表单字段：
    - `file` 必填（二进制文件）
    - `fileType` 可选，示例：`avatar` / `course_image` / `other`
- 成功响应（200）
  ```json
  { "code": 200, "message": "上传成功", "data": { "image_url": "/uploads/2024/10/24/xxx.jpg" } }
  ```
- 可能的错误：
    - 400 `文件不能为空` / `文件大小不能超过 5MB` / `不支持的文件类型，仅支持: JPG, PNG, GIF, WEBP` / `文件名不能为空` /
      `文件扩展名不合法`
    - 400 `文件大小超过限制，最大允许 5MB`（统一异常）
    - 401 认证类错误（见全局错误）
    - 500 R2 上传/数据库等内部错误

### 5.2 删除文件（逻辑删除）

- 方法与路径：`DELETE /api/upload/{fileId}`（`@Auth`）
- 成功响应（200）
  ```json
  { "code": 200, "message": "删除成功", "data": null }
  ```
- 可能的错误：
    - 401 认证类错误（见全局错误）
    - 500 数据库/内部错误

---

## 6. 备注

- 本文档围绕当前代码实际实现生成；若后续新增例如“报名/管理员用户列表”等接口，请告知，我会补充至本文档。

