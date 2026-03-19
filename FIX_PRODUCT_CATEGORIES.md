# ⚠️ 需要执行修复脚本

## 问题说明

数据库迁移脚本成功执行后，发现**产品分类的层级关系未正确建立**：
- 所有 `product_categories` 记录的 `parent_id` 为 NULL
- `market_access_guides` 的 `product_category_id` 未关联

这导致：
1. 产品选择器无法显示树状结构
2. 市场准入查询可能无法正确匹配产品

---

## 解决方案

### 方法一：通过 Supabase Dashboard 执行（推荐）

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **SQL Editor**
4. 复制文件内容：`database/migrations/003_fix_product_categories_hierarchy.sql`
5. 粘贴到 SQL Editor
6. 点击 **Run** 执行

### 方法二：命令行

```bash
supabase migration up
```

---

## 验证修复成功

执行以下 SQL 验证：

```sql
-- 验证层级关系
SELECT 
  pc.name,
  pc.name_zh,
  pc.code,
  pc.level,
  parent.name as parent_name,
  parent.name_zh as parent_name_zh
FROM product_categories pc
LEFT JOIN product_categories parent ON pc.parent_id = parent.id
ORDER BY pc.level, pc.name;
```

**预期结果**:
```
name              | name_zh    | code       | level | parent_name    | parent_name_zh
------------------|------------|------------|-------|----------------|----------------
Medical Device    | 医疗器械    | MD         | 1     | (null)         | (null)
PPE               | 个人防护用品 | PPE        | 1     | (null)         | (null)
Surgical Mask     | 医用口罩    | MASK-SURG  | 2     | Medical Device | 医疗器械
N95 Respirator    | N95 呼吸器   | MASK-N95   | 2     | PPE            | 个人防护用品
Protective Clothing| 防护服     | PPE-CLOTH  | 2     | PPE            | 个人防护用品
Diagnostic Device | 诊断器械    | DIAG       | 2     | Medical Device | 医疗器械
Implant           | 植入器械    | IMPL       | 2     | Medical Device | 医疗器械
```

---

## 修复后测试

### 1. 测试产品选择器

访问：http://localhost:3000/zh/market-access-wizard

**预期行为**:
- 产品选择器显示树状结构
- 可以展开/收起类别
- 父子关系正确

### 2. 测试市场准入查询

1. 访问：http://localhost:3000/zh/market-access-wizard
2. 选择产品：医用口罩 (MASK-SURG)
3. 选择国家：新加坡 (SG)
4. 点击"一键查询"

**预期结果**:
- 显示新加坡口罩市场准入完整报告
- 分类：Class A - Low Risk
- 费用：$370 USD
- 周期：21 天
- 5 项必需文件
- 4 步流程

---

## 修复脚本内容

修复脚本执行以下操作：

1. **建立层级关系**
   - Surgical Mask → Medical Device
   - Diagnostic Device → Medical Device
   - Implant → Medical Device
   - N95 Respirator → PPE
   - Protective Clothing → PPE

2. **关联市场准入数据**
   - 新加坡指南 → Surgical Mask
   - 马来西亚指南 → Surgical Mask
   - 泰国指南 → Surgical Mask

---

## 常见问题

### Q: 执行修复脚本后仍然显示 NULL parent_id？

**A**: 检查是否正确执行了 INSERT 语句，确保父类别已存在。

### Q: 市场准入查询仍然报错？

**A**: 确保前端使用的是关键词（产品代码）而不是 UUID。

### Q: 产品选择器仍然不显示树状结构？

**A**: 
1. 刷新页面（Ctrl+F5 / Cmd+Shift+R）
2. 检查浏览器控制台是否有错误
3. 确认 API 返回的数据包含 children 字段

---

## 下一步

修复完成后，请继续测试：
1. ✅ 执行修复脚本
2. ⏳ 验证层级关系
3. ⏳ 测试产品选择器
4. ⏳ 测试市场准入查询
5. ⏳ 测试资料模板库
6. ⏳ 测试市场对比

---

**创建时间**: 2026-03-19  
**优先级**: 高  
**预计耗时**: 5 分钟
