# Gender 字段处理说明

## 📋 概述

前端发送的 Gender 字段值为中文：`"男"` 和 `"女"`。后端已经实现了完善的转换逻辑，能够正确处理中文值并转换为对应的枚举类型。

## 🔧 实现原理

### Gender 枚举定义

<augment_code_snippet path="src/main/java/work/foofish/course/data/enums/Gender.java" mode="EXCERPT">
````java
@Getter
public enum Gender {
    MALE("男"),
    FEMALE("女"),
    UNKNOWN("未知");

    @EnumValue
    private final String value;
    ...
````
</augment_code_snippet>

- `@EnumValue` 注解：告诉 MyBatis-Plus 在数据库中存储的是 `value` 值（中文）
- 数据库存储：`"男"`, `"女"`, `"未知"`
- Java 枚举：`MALE`, `FEMALE`, `UNKNOWN`

### 转换逻辑

<augment_code_snippet path="src/main/java/work/foofish/course/data/dto/UserDTO.java" mode="EXCERPT">
````java
public static User toUser (UserDTO userDTO) {
    Gender gender = null;
    if (userDTO.getGender() != null && !userDTO.getGender().trim().isEmpty()) {
        String genderStr = userDTO.getGender().trim();
        
        // 首先尝试通过中文值匹配（前端发送的是 "男"、"女"）
        for (Gender g : Gender.values()) {
            if (g.getValue().equals(genderStr)) {
                gender = g;
                break;
            }
        }
        ...
````
</augment_code_snippet>

**转换流程**：
1. **优先匹配中文值**：遍历所有枚举，通过 `getValue()` 匹配中文值
2. **备用匹配枚举名**：如果中文匹配失败，尝试用 `valueOf()` 匹配枚举名称
3. **无效值处理**：如果都失败，保持 `null`，不更新该字段

## ✅ 支持的输入格式

### 1. 中文值（推荐，前端使用）

| 前端发送 | 后端枚举 | 数据库存储 | 状态 |
|---------|---------|-----------|------|
| `"男"` | `MALE` | `"男"` | ✅ 支持 |
| `"女"` | `FEMALE` | `"女"` | ✅ 支持 |
| `"未知"` | `UNKNOWN` | `"未知"` | ✅ 支持 |

### 2. 枚举名称（兼容）

| 前端发送 | 后端枚举 | 数据库存储 | 状态 |
|---------|---------|-----------|------|
| `"MALE"` | `MALE` | `"男"` | ✅ 支持 |
| `"FEMALE"` | `FEMALE` | `"女"` | ✅ 支持 |
| `"UNKNOWN"` | `UNKNOWN` | `"未知"` | ✅ 支持 |
| `"male"` | `MALE` | `"男"` | ✅ 支持（大小写不敏感） |
| `"female"` | `FEMALE` | `"女"` | ✅ 支持（大小写不敏感） |

### 3. 特殊值处理

| 前端发送 | 后端处理 | 说明 |
|---------|---------|------|
| `null` | 不更新字段 | 字段保持原值 |
| `""` (空字符串) | 不更新字段 | 字段保持原值 |
| `"  "` (空格) | 不更新字段 | trim 后为空 |
| `"其他"` | 不更新字段 | 无效值，忽略 |

## 📝 前端使用示例

### 示例 1: 更新性别为男
```javascript
// 前端代码
const updateUser = async (userId) => {
  const response = await fetch(`/api/user/${userId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      gender: "男"  // 直接发送中文
    })
  });
  return response.json();
};
```

**HTTP 请求**:
```http
PUT /api/user/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "gender": "男"
}
```

**后端处理**:
1. 接收到 `"男"`
2. 匹配到 `Gender.MALE`
3. 数据库更新为 `"男"`

### 示例 2: 更新性别为女
```javascript
const response = await fetch(`/api/user/${userId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    gender: "女"
  })
});
```

### 示例 3: 同时更新多个字段
```javascript
const response = await fetch(`/api/user/${userId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "张三",
    gender: "女",
    hobbies: "书法, 太极"
  })
});
```

### 示例 4: 不更新性别字段
```javascript
// 方式 1: 不包含 gender 字段
const response = await fetch(`/api/user/${userId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "李四",
    hobbies: "绘画"
  })
});

// 方式 2: gender 为 null（不推荐，但也有效）
const response = await fetch(`/api/user/${userId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "李四",
    gender: null
  })
});
```

## 🔍 数据流转示意

```
前端发送: {"gender": "男"}
    ↓
Controller 接收: UserDTO {gender: "男"}
    ↓
UserDTO.toUser() 转换
    ↓
遍历 Gender 枚举，匹配 value
    ↓
找到 Gender.MALE (value="男")
    ↓
User {gender: MALE}
    ↓
MyBatis-Plus 处理 @EnumValue
    ↓
数据库存储: gender = "男"
```

## 🧪 测试用例

### 测试 1: 中文值 "男"
```bash
curl -X PUT http://localhost:8080/api/user/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"gender": "男"}'
```

**预期结果**:
- 返回 200 OK
- 数据库 gender 字段更新为 `"男"`
- 其他字段保持不变

### 测试 2: 中文值 "女"
```bash
curl -X PUT http://localhost:8080/api/user/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"gender": "女"}'
```

**预期结果**:
- 返回 200 OK
- 数据库 gender 字段更新为 `"女"`

### 测试 3: 空字符串
```bash
curl -X PUT http://localhost:8080/api/user/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"gender": ""}'
```

**预期结果**:
- 返回 200 OK
- gender 字段**不会被更新**，保持原值

### 测试 4: 无效值
```bash
curl -X PUT http://localhost:8080/api/user/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"gender": "其他"}'
```

**预期结果**:
- 返回 200 OK
- gender 字段**不会被更新**，保持原值
- 不会抛出异常

## 📊 数据库验证

### 查询当前值
```sql
SELECT user_id, username, gender, updated_at 
FROM users 
WHERE user_id = 1;
```

### 验证更新
```sql
-- 更新前
SELECT gender FROM users WHERE user_id = 1;
-- 结果: 男

-- 执行 API 更新为 "女"

-- 更新后
SELECT gender FROM users WHERE user_id = 1;
-- 结果: 女
```

## ⚠️ 注意事项

### 1. 前端发送格式
✅ **正确**:
```json
{"gender": "男"}
{"gender": "女"}
```

❌ **错误**:
```json
{"gender": "MALE"}  // 虽然能工作，但不推荐
{"gender": "male"}  // 虽然能工作，但不推荐
{"gender": 1}       // 错误：不是字符串
{"gender": true}    // 错误：不是字符串
```

### 2. 部分更新特性
- 如果不想更新 gender 字段，**不要在请求中包含该字段**
- 发送 `null` 或空字符串不会更新字段
- 发送无效值不会导致错误，只是不更新

### 3. 数据一致性
- 数据库中存储的是中文值：`"男"`, `"女"`, `"未知"`
- 查询接口返回的也是中文值
- 前后端保持一致，都使用中文

## 🎯 最佳实践

### 前端下拉选择器
```javascript
// 推荐的前端实现
const genderOptions = [
  { label: '男', value: '男' },
  { label: '女', value: '女' },
  { label: '未知', value: '未知' }
];

// 使用示例（React）
<Select 
  options={genderOptions}
  onChange={(value) => setGender(value)}
/>

// 提交时
const data = {
  gender: selectedGender  // 直接使用中文值
};
```

### 表单验证
```javascript
const validateGender = (value) => {
  const validValues = ['男', '女', '未知'];
  return validValues.includes(value) || value === null || value === '';
};
```

## 🐛 故障排查

### 问题 1: Gender 字段没有更新
**可能原因**:
1. 发送的值不是 `"男"` 或 `"女"`
2. 发送的是空字符串
3. 权限不足

**解决方法**:
```javascript
// 检查发送的值
console.log('Sending gender:', JSON.stringify({gender: genderValue}));

// 确保值正确
const normalizedGender = genderValue === '男' ? '男' : 
                        genderValue === '女' ? '女' : null;
```

### 问题 2: 返回的 gender 值不是预期的
**检查**:
```sql
-- 直接查询数据库
SELECT gender FROM users WHERE user_id = 1;
```

如果数据库中的值正确，但返回的不对，检查 `UserDTO.fromUser()` 方法。

## 📚 相关代码

- **枚举定义**: `src/main/java/work/foofish/course/data/enums/Gender.java`
- **转换逻辑**: `src/main/java/work/foofish/course/data/dto/UserDTO.java` (toUser 方法)
- **数据库映射**: MyBatis-Plus 的 `@EnumValue` 注解

## ✅ 总结

当前实现已经完美支持前端发送中文值 `"男"` 和 `"女"`：

1. ✅ 前端发送中文值，后端正确转换
2. ✅ 数据库存储中文值
3. ✅ 查询返回中文值
4. ✅ 部分更新功能正常工作
5. ✅ 空值和无效值正确处理
6. ✅ 向后兼容枚举名称（MALE/FEMALE）

**前端只需要发送中文值即可，无需任何特殊处理！**

