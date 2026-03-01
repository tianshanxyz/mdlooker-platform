# MDLooker Mobile APP API 接口文档

## 基础信息

- **Base URL**: `https://api.mdlooker.com/v1`
- **协议**: HTTPS
- **数据格式**: JSON
- **编码**: UTF-8

## 认证方式

所有需要认证的接口都需要在请求头中携带 Token：

```
Authorization: Bearer {access_token}
```

## 通用响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权/Token过期 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 1. 用户认证接口

### 1.1 用户注册

**POST** `/auth/register`

**请求参数：**

```json
{
  "email": "user@example.com",
  "phone": "+8613800138000",
  "password": "password123",
  "code": "123456"
}
```

**响应：**

```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "user_id": "user_123456",
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 3600
  }
}
```

### 1.2 用户登录

**POST** `/auth/login`

**请求参数：**

```json
{
  "account": "user@example.com",
  "password": "password123",
  "type": "email"
}
```

**响应：**

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "user_id": "user_123456",
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 3600,
    "user": {
      "id": "user_123456",
      "email": "user@example.com",
      "nickname": "用户名",
      "avatar": "https://...",
      "level": 1,
      "exp": 35
    }
  }
}
```

### 1.3 社交登录

**POST** `/auth/social`

**请求参数：**

```json
{
  "provider": "wechat|google|apple",
  "code": "auth_code",
  "redirect_uri": "https://mdlooker.com/auth/callback"
}
```

### 1.4 刷新Token

**POST** `/auth/refresh`

**请求参数：**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 1.5 发送验证码

**POST** `/auth/send-code`

**请求参数：**

```json
{
  "type": "email|sms",
  "target": "user@example.com",
  "purpose": "register|reset_password|bind"
}
```

---

## 2. 搜索接口

### 2.1 智能搜索

**GET** `/search`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| q | string | 是 | 搜索关键词 |
| type | string | 否 | 搜索类型：company/product/all |
| country | string | 否 | 国家代码 |
| page | int | 否 | 页码，默认1 |
| limit | int | 否 | 每页数量，默认20 |

**响应：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 156,
    "page": 1,
    "limit": 20,
    "results": [
      {
        "id": "comp_123456",
        "type": "company",
        "name": "迈瑞医疗",
        "name_en": "Mindray Medical",
        "country": "CN",
        "logo": "https://...",
        "compliance_score": 96,
        "certifications": ["FDA", "NMPA", "CE"],
        "description": "中国医疗器械龙头企业"
      }
    ],
    "suggestions": ["迈瑞", "迈瑞医疗", "Mindray"]
  }
}
```

### 2.2 搜索建议

**GET** `/search/suggestions`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| q | string | 是 | 搜索关键词 |
| limit | int | 否 | 返回数量，默认5 |

**响应：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "suggestions": [
      { "text": "迈瑞医疗", "type": "company" },
      { "text": "Medtronic", "type": "company" },
      { "text": "监护仪", "type": "product" }
    ]
  }
}
```

### 2.3 热门搜索

**GET** `/search/trending`

**响应：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "trending": [
      { "keyword": "迈瑞医疗", "count": 1234 },
      { "keyword": "Medtronic", "count": 987 },
      { "keyword": "西门子医疗", "count": 856 }
    ]
  }
}
```

---

## 3. 企业接口

### 3.1 企业详情

**GET** `/companies/{company_id}`

**响应：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "comp_123456",
    "name": "迈瑞医疗",
    "name_en": "Mindray Medical",
    "logo": "https://...",
    "country": "CN",
    "province": "广东省",
    "city": "深圳市",
    "address": "南山区高新技术产业园区",
    "website": "www.mindray.com",
    "phone": "+86-755-81888998",
    "email": "contact@mindray.com",
    "established": "1991",
    "employees": "10000+",
    "revenue": "$3.5B",
    "description": "中国医疗器械龙头企业",
    "compliance_score": 96,
    "certifications": {
      "fda": { "count": 156, "products": [...] },
      "nmpa": { "count": 287, "products": [...] },
      "ce": { "count": 89, "products": [...] }
    },
    "products": [
      {
        "id": "prod_123",
        "name": "病人监护仪 BeneVision N1",
        "category": "监护设备",
        "certifications": ["FDA", "NMPA", "CE"]
      }
    ],
    "is_favorite": false
  }
}
```

### 3.2 企业对比

**POST** `/companies/compare`

**请求参数：**

```json
{
  "company_ids": ["comp_123", "comp_456"]
}
```

**响应：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "companies": [
      { "id": "comp_123", "name": "迈瑞医疗", ... },
      { "id": "comp_456", "name": "西门子医疗", ... }
    ],
    "comparison": {
      "compliance_score": [96, 98],
      "fda_count": [156, 234],
      "nmpa_count": [287, 198],
      "ce_count": [89, 312]
    }
  }
}
```

---

## 4. 收藏接口

### 4.1 获取收藏列表

**GET** `/favorites`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码 |
| limit | int | 否 | 每页数量 |

**响应：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 12,
    "favorites": [
      {
        "id": "fav_123",
        "company_id": "comp_123456",
        "company_name": "迈瑞医疗",
        "company_logo": "https://...",
        "compliance_score": 96,
        "certifications": ["FDA", "NMPA", "CE"],
        "created_at": "2026-02-20T10:30:00Z"
      }
    ]
  }
}
```

### 4.2 添加收藏

**POST** `/favorites`

**请求参数：**

```json
{
  "company_id": "comp_123456"
}
```

### 4.3 取消收藏

**DELETE** `/favorites/{favorite_id}`

### 4.4 检查是否已收藏

**GET** `/favorites/check/{company_id}`

**响应：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "is_favorite": true,
    "favorite_id": "fav_123"
  }
}
```

---

## 5. 用户接口

### 5.1 获取用户信息

**GET** `/user/profile`

**响应：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "user_123456",
    "email": "user@example.com",
    "nickname": "用户名",
    "avatar": "https://...",
    "level": 3,
    "exp": 350,
    "exp_to_next": 150,
    "stats": {
      "search_count": 45,
      "favorite_count": 12,
      "download_count": 8,
      "view_count": 128
    },
    "created_at": "2026-01-15T08:00:00Z"
  }
}
```

### 5.2 更新用户信息

**PUT** `/user/profile`

**请求参数：**

```json
{
  "nickname": "新昵称",
  "avatar": "https://..."
}
```

### 5.3 获取搜索历史

**GET** `/user/search-history`

**响应：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "history": [
      {
        "id": "hist_123",
        "query": "迈瑞医疗",
        "type": "company",
        "result_count": 3,
        "created_at": "2026-02-23T10:30:00Z"
      }
    ]
  }
}
```

### 5.4 清除搜索历史

**DELETE** `/user/search-history`

### 5.5 获取成就列表

**GET** `/user/achievements`

**响应：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 12,
    "unlocked": 8,
    "achievements": [
      {
        "id": "ach_1",
        "name": "初识合规",
        "description": "完成首次搜索",
        "icon": "🔍",
        "unlocked": true,
        "unlocked_at": "2026-02-20T10:30:00Z"
      }
    ]
  }
}
```

### 5.6 获取每日任务

**GET** `/user/daily-tasks`

**响应：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "date": "2026-02-23",
    "tasks": [
      {
        "id": "task_1",
        "name": "完成1次搜索",
        "reward": 10,
        "completed": false
      }
    ],
    "total_reward": 75
  }
}
```

### 5.7 完成任务

**POST** `/user/tasks/{task_id}/complete`

**响应：**

```json
{
  "code": 200,
  "message": "任务完成",
  "data": {
    "reward": 10,
    "new_exp": 45,
    "level_up": false
  }
}
```

---

## 6. 通知接口

### 6.1 获取通知列表

**GET** `/notifications`

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 否 | 类型：all/system/company |
| page | int | 否 | 页码 |
| limit | int | 否 | 每页数量 |

**响应：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 25,
    "unread": 3,
    "notifications": [
      {
        "id": "notif_123",
        "type": "system",
        "title": "欢迎加入 MDLooker",
        "content": "恭喜您完成注册！",
        "is_read": false,
        "created_at": "2026-02-23T10:30:00Z"
      }
    ]
  }
}
```

### 6.2 标记已读

**PUT** `/notifications/{notification_id}/read`

### 6.3 全部已读

**PUT** `/notifications/read-all`

---

## 7. 报告接口

### 7.1 生成企业报告

**POST** `/reports/company/{company_id}`

**请求参数：**

```json
{
  "type": "full|summary",
  "sections": ["basic", "compliance", "products"]
}
```

**响应：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "report_id": "rep_123456",
    "download_url": "https://api.mdlooker.com/reports/rep_123456/download",
    "expires_at": "2026-02-24T10:30:00Z"
  }
}
```

### 7.2 下载报告

**GET** `/reports/{report_id}/download`

---

## 8. 扫码接口

### 8.1 解析UDI码

**POST** `/scan/udi`

**请求参数：**

```json
{
  "udi": "(01)12345678901234(11)260201(17)280201(10)ABC123"
}
```

**响应：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "udi": "(01)12345678901234(11)260201(17)280201(10)ABC123",
    "parsed": {
      "gtin": "12345678901234",
      "lot": "ABC123",
      "manufacturing_date": "2026-02-01",
      "expiration_date": "2028-02-01"
    },
    "company": {
      "id": "comp_123",
      "name": "迈瑞医疗"
    },
    "product": {
      "id": "prod_456",
      "name": "病人监护仪"
    }
  }
}
```

---

## 错误处理

### 错误响应格式

```json
{
  "code": 400,
  "message": "请求参数错误",
  "errors": {
    "email": ["邮箱格式不正确"],
    "password": ["密码长度不能少于6位"]
  }
}
```

### 常见错误码

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| 40001 | 参数缺失 | 检查必填参数 |
| 40002 | 参数格式错误 | 检查参数格式 |
| 40101 | Token过期 | 刷新Token |
| 40102 | Token无效 | 重新登录 |
| 40301 | 权限不足 | 检查用户权限 |
| 40401 | 企业不存在 | 检查企业ID |
| 42901 | 请求过于频繁 | 降低请求频率 |
| 50001 | 服务器内部错误 | 稍后重试 |

---

## 限流规则

- 未认证用户：100次/小时
- 普通用户：1000次/小时
- VIP用户：10000次/小时

---

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0.0 | 2026-02-23 | 初始版本 |
