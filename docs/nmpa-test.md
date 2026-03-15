# 测试 NMPA 数据

在浏览器中访问以下 URL 来测试 NMPA 数据：

## 1. 测试搜索 API
```
https://www.mdlooker.com/api/search?q=晶硕&pageSize=5
https://www.mdlooker.com/api/search?q=创面修复&pageSize=5
https://www.mdlooker.com/api/search?q=3M&pageSize=5
```

## 2. 直接查询 Supabase

打开浏览器控制台 (F12)，运行以下代码：

```javascript
// 替换为你的 Supabase URL 和 Key
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

async function testNMPA() {
  const response = await fetch(`${supabaseUrl}/rest/v1/nmpa_registrations?product_name_zh=ilike.%25晶硕%25&limit=5`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  console.log('晶硕搜索结果:', data);
  
  // 获取样本数据
  const sample = await fetch(`${supabaseUrl}/rest/v1/nmpa_registrations?select=product_name_zh,manufacturer_zh&limit=10`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
  const sampleData = await sample.json();
  console.log('NMPA 样本数据:', sampleData);
}

testNMPA();
```

## 3. 在 Supabase Dashboard 中检查

1. 登录 https://app.supabase.com
2. 进入你的项目
3. 点击 Table Editor
4. 选择 `nmpa_registrations` 表
5. 查看前几行数据，检查 `product_name_zh` 和 `manufacturer_zh` 字段是否有值

## 可能的问题

1. **NMPA 表中有数据，但中文字段为空**
   - 解决方案：需要重新导入 NMPA 数据

2. **NMPA 表字段名不对**
   - 检查实际字段名是否为 `product_name_zh` 和 `manufacturer_zh`

3. **数据存在但搜索逻辑有问题**
   - 检查搜索 API 的日志输出
