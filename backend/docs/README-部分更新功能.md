# 用户信息部分更新功能 - 完整说明

## 📌 快速开始

### 前端使用（最重要）

前端发送更新请求时，**只需要包含要更新的字段**，未包含的字段会保持不变。

**示例 1: 只更新名字**
```javascript
fetch('/api/user/1', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "新名字"  // 只更新 name，其他字段不变
  })
});
```

**示例 2: 只更新性别（使用中文）**
```javascript
fetch('/api/user/1', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    gender: "男"  // 前端发送中文值
  })
});
```

**示例 3: 更新多个字段**
```javascript
fetch('/api/user/1', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "张三",
    gender: "女",
    hobbies: "书法, 太极"
    // avatarUrl 和 healthCondition 不会被更新
  })
});
```

## 🎯 核心特性

### 1. 部分更新
✅ **只更新请求中包含的字段**
- 请求中包含的字段：会被更新
- 请求中未包含的字段：保持原值不变
- 值为 `null` 的字段：不会更新（保持原值）

### 2. Gender 字段特殊处理
✅ **前端发送中文值，后端自动处理**

| 前端发送 | 后端处理 | 数据库存储 |
|---------|---------|-----------|
| `"男"` | ✅ 转换为 MALE | `"男"` |
| `"女"` | ✅ 转换为 FEMALE | `"女"` |
| `"未知"` | ✅ 转换为 UNKNOWN | `"未知"` |
| `""` (空字符串) | ❌ 不更新 | 保持原值 |
| `null` | ❌ 不更新 | 保持原值 |

### 3. 安全性
✅ **保留原有权限控制**
- 普通用户只能修改自己的信息
- 管理员可以修改所有用户信息
- 无权限操作返回 403 Forbidden

## 📋 支持的字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| `name` | String | 用户名 | `"张三"` |
| `gender` | String | 性别（中文） | `"男"`, `"女"`, `"未知"` |
| `avatarUrl` | String | 头像 URL | `"/uploads/avatar.png"` |
| `hobbies` | String | 爱好 | `"书法, 太极"` |
| `healthCondition` | String | 健康状况 | `"膝盖不好"` |

## 🔧 实现细节

### 修改的文件
1. **UserMapper.java** - 添加 `updateUserSelective` 方法
2. **UserSqlProvider.java** (新增) - 动态 SQL 生成
3. **UserService.java** - 更新业务逻辑
4. **UserDTO.java** - 增强 Gender 字段转换

### 技术栈
- MyBatis-Plus 动态 SQL
- `@UpdateProvider` 注解
- `@EnumValue` 注解处理枚举

## 📝 完整示例

### 场景：用户修改个人资料

**初始数据**:
```json
{
  "userId": 1,
  "name": "李四",
  "gender": "男",
  "avatarUrl": "/uploads/old.png",
  "hobbies": "书法",
  "healthCondition": "健康"
}
```

**前端只想修改性别和爱好**:
```javascript
const response = await fetch('/api/user/1', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    gender: "女",
    hobbies: "书法, 太极, 绘画"
  })
});
```

**更新后的数据**:
```json
{
  "userId": 1,
  "name": "李四",           // ✅ 未改变
  "gender": "女",           // ✅ 已更新
  "avatarUrl": "/uploads/old.png",  // ✅ 未改变
  "hobbies": "书法, 太极, 绘画",    // ✅ 已更新
  "healthCondition": "健康"  // ✅ 未改变
}
```

## 🧪 测试

### 方法 1: 使用测试脚本

**Linux/Mac**:
```bash
chmod +x 测试脚本示例.sh
./测试脚本示例.sh http://localhost:8080 YOUR_TOKEN 1
```

**Windows**:
```cmd
测试脚本示例.bat http://localhost:8080 YOUR_TOKEN 1
```

### 方法 2: 使用 curl

```bash
# 1. 查询当前信息
curl -X GET http://localhost:8080/api/user/1 \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. 只更新性别
curl -X PUT http://localhost:8080/api/user/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"gender": "女"}'

# 3. 再次查询，验证只有 gender 被更新
curl -X GET http://localhost:8080/api/user/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 方法 3: 使用 Postman

1. 创建 PUT 请求：`http://localhost:8080/api/user/1`
2. 添加 Header：`Authorization: Bearer YOUR_TOKEN`
3. 设置 Body (raw JSON)：
   ```json
   {
     "gender": "女"
   }
   ```
4. 发送请求
5. 验证响应

## ⚠️ 重要注意事项

### 1. Gender 字段
- ✅ **推荐**: 发送中文值 `"男"`, `"女"`, `"未知"`
- ⚠️ **不推荐**: 发送枚举名 `"MALE"`, `"FEMALE"` (虽然也能工作)
- ❌ **错误**: 发送数字或布尔值

### 2. 空值处理
```javascript
// ✅ 正确：不包含不想更新的字段
{
  "name": "新名字"
}

// ⚠️ 可以但不推荐：显式设置为 null
{
  "name": "新名字",
  "gender": null  // 不会更新 gender
}

// ❌ 错误：空字符串会被当作有效值（除了 gender）
{
  "hobbies": ""  // hobbies 会被更新为空字符串
}
```

### 3. 权限控制
```javascript
// 普通用户修改自己的信息 - ✅ 允许
PUT /api/user/1  (当前用户 ID = 1)

// 普通用户修改其他用户信息 - ❌ 禁止 (403)
PUT /api/user/2  (当前用户 ID = 1)

// 管理员修改任何用户信息 - ✅ 允许
PUT /api/user/2  (当前用户是管理员)
```

## 🐛 常见问题

### Q1: 为什么我的字段没有被更新？
**检查清单**:
- [ ] 字段是否在请求体中？
- [ ] 字段值是否为 `null`？
- [ ] Gender 字段是否为空字符串？
- [ ] 是否有权限修改该用户？

### Q2: Gender 字段应该发送什么值？
**答**: 发送中文值 `"男"` 或 `"女"`

```javascript
// ✅ 正确
{ "gender": "男" }
{ "gender": "女" }

// ⚠️ 可以但不推荐
{ "gender": "MALE" }
{ "gender": "FEMALE" }
```

### Q3: 如何清空某个字段？
**答**: 
- 对于普通字符串字段：发送空字符串 `""`
- 对于 Gender 字段：目前不支持清空

```javascript
// 清空 hobbies
{ "hobbies": "" }

// Gender 不能清空，只能更新为其他值
{ "gender": "未知" }
```

### Q4: 更新失败返回 404
**原因**: 用户不存在
**解决**: 检查 userId 是否正确

### Q5: 更新失败返回 403
**原因**: 权限不足
**解决**: 
- 普通用户只能修改自己的信息
- 使用管理员账号或修改自己的信息

## 📚 相关文档

| 文档 | 说明 |
|------|------|
| `部分更新功能实现总结.md` | 完整的技术实现说明 |
| `Gender字段处理说明.md` | Gender 字段详细处理逻辑 |
| `部分更新功能测试说明.md` | 详细的测试用例 |
| `部分更新功能快速参考.md` | 快速参考指南 |

## 🎉 总结

### 对前端开发者
1. ✅ 只需要发送要更新的字段
2. ✅ Gender 字段发送中文值（"男"/"女"）
3. ✅ 不需要发送完整的用户对象
4. ✅ 不需要担心覆盖其他字段

### 对后端开发者
1. ✅ 使用 MyBatis 动态 SQL 实现
2. ✅ Gender 字段自动转换中文值
3. ✅ 保持原有权限控制逻辑
4. ✅ 向后兼容，不影响现有功能

### 核心优势
- 🚀 **性能提升**: 只更新必要的字段
- 🛡️ **数据安全**: 不会意外覆盖其他字段
- 🎯 **使用简单**: 前端只需发送要更新的字段
- 🔧 **易于维护**: 清晰的代码结构和文档

---

**如有问题，请参考相关文档或联系开发团队。**

