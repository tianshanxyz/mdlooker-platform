# MDLooker 上线前全面检查清单

## 1. Vercel部署问题 ⚠️

**问题**: Vercel无法拉取GitHub最新commit

**解决方案**:
- [ ] 方案A: 在Vercel Dashboard手动重新连接GitHub
  1. 访问 https://vercel.com/dashboard
  2. 找到 mdlooker-platform 项目
  3. Settings → Git → Disconnect → 重新Connect
- [ ] 方案B: 使用Vercel CLI强制部署
  ```bash
  npm i -g vercel
  vercel --force
  ```

---

## 2. API配置检查

### 2.1 百度翻译API ❌ 未配置
**状态**: 环境变量缺失
**影响**: 翻译功能无法使用
**申请步骤**:
1. 访问 https://fanyi-api.baidu.com/
2. 注册/登录百度账号
3. 开通"标准版"（免费5万字符/月）
4. 获取APP_ID和密钥
5. 添加到Vercel环境变量:
   - `BAIDU_TRANSLATE_APP_ID`
   - `BAIDU_TRANSLATE_SECRET_KEY`

### 2.2 FDA API ✅ 已配置
- API Key: 已配置

### 2.3 Supabase ✅ 已配置
- URL: https://tiosujipxpvivdjmwtfa.supabase.co
- Anon Key: 已配置
- Service Role Key: 已配置

---

## 3. 数据库检查 ✅

| 表名 | 记录数 | 状态 |
|-----|-------|------|
| nmpa_registrations | 72,000 | ✅ 已优化(61MB) |
| hsa_registrations | 200 | ✅ 已导入 |
| pmda_registrations | 170 | ✅ 已导入 |
| sfda_mdma | 155 | ✅ 已导入(临时表) |
| companies | - | ✅ 正常 |

**总计**: 约73,000条医疗器械注册数据

---

## 4. 环境变量检查

### 必需的环境变量

| 变量名 | 状态 | 说明 |
|-------|------|------|
| NEXT_PUBLIC_SUPABASE_URL | ✅ | Supabase项目URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ✅ | Supabase匿名密钥 |
| SUPABASE_SERVICE_ROLE_KEY | ✅ | Supabase服务角色密钥 |
| FDA_API_KEY | ✅ | FDA API密钥 |
| BAIDU_TRANSLATE_APP_ID | ❌ | 百度翻译APP_ID |
| BAIDU_TRANSLATE_SECRET_KEY | ❌ | 百度翻译密钥 |

### Vercel环境变量配置位置
1. 访问 https://vercel.com/dashboard
2. 选择项目 → Settings → Environment Variables
3. 添加缺失的变量

---

## 5. 功能检查清单

### 5.1 核心功能
- [ ] 搜索功能正常
- [ ] 多语言切换(中/英)正常
- [ ] 响应式设计(PC/移动端)
- [ ] 数据加载速度<3秒

### 5.2 数据库查询
- [ ] NMPA数据查询正常
- [ ] HSA数据查询正常
- [ ] PMDA数据查询正常
- [ ] SFDA数据查询正常

### 5.3 AI功能
- [ ] AI助手对话功能
- [ ] 翻译功能(需配置百度API)
- [ ] 智能推荐

### 5.4 用户功能
- [ ] 企业对比
- [ ] 合规时间线
- [ ] 搜索历史
- [ ] 热门搜索

---

## 6. 性能优化 ✅

- [x] NMPA表压缩(7.2GB → 61MB)
- [x] 添加数据库索引
- [x] 移除大文件(314MB → 2.36MB)
- [ ] 图片优化
- [ ] CDN配置

---

## 7. SEO和元数据

- [ ] 页面标题和描述
- [ ] Open Graph标签
- [ ] 网站地图sitemap.xml
- [ ] robots.txt

---

## 8. 监控和日志

- [ ] Vercel Analytics
- [ ] 错误监控(Sentry)
- [ ] 性能监控

---

## 9. 法律合规

- [ ] 隐私政策页面
- [ ] 服务条款页面
- [ ] Cookie同意提示
- [ ] 免责声明

---

## 10. 备份和恢复

- [ ] 数据库备份策略
- [ ] 代码仓库备份
- [ ] 灾难恢复计划

---

## 紧急待办事项

1. **🔴 高优先级**
   - [ ] 解决Vercel部署问题
   - [ ] 申请百度翻译API
   - [ ] 配置Vercel环境变量

2. **🟡 中优先级**
   - [ ] 测试所有核心功能
   - [ ] 配置SEO元数据
   - [ ] 添加错误监控

3. **🟢 低优先级**
   - [ ] 性能进一步优化
   - [ ] 法律合规页面
   - [ ] 备份策略

---

## 上线前必须完成

- [ ] Vercel成功部署最新代码
- [ ] 百度翻译API申请并配置
- [ ] 核心功能测试通过
- [ ] 移动端适配测试
- [ ] 多语言切换测试

**预计完成时间**: 1-2天
