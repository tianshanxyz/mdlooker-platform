# 爬虫运行指南

## 前提条件

1. **Python 3.8+** 已安装
2. **Service Role Key**（从 Supabase Dashboard 获取）
3. **稳定的网络连接**

## 获取 Service Role Key

1. 访问 https://supabase.com/dashboard
2. 进入你的项目
3. 点击 **Project Settings** → **API**
4. 复制 **service_role** key（注意保密！）

## 运行 EUDAMED 爬虫

```bash
cd /Users/maxiaoha/Desktop/mdlooker-platform/scripts

# 编辑脚本，填入你的 Service Role Key
# 将 "你的Service Role Key" 替换为实际的 key

# 运行爬虫
bash run_eudamed_scraper.sh
```

**预期输出**：
- 打开 Chrome 浏览器窗口
- 自动访问 EUDAMED 网站
- 抓取德国、法国、意大利等国家的制造商数据
- 抓取完成后自动保存到 Supabase

**数据量**：约 10,000+ 条

**运行时间**：约 30-60 分钟

## 运行 NMPA 爬虫

```bash
cd /Users/maxiaoha/Desktop/mdlooker-platform/scripts

# 编辑脚本，填入你的 Service Role Key

# 运行爬虫
bash run_nmpa_scraper.sh
```

**注意事项**：
- 会打开 Chrome 浏览器窗口
- **如果遇到验证码，需要手动完成**
- 抓取速度较慢（约 1-2 秒/条）
- 建议分批抓取（每次 100-200 条）

**数据量**：约 20,000+ 条

**运行时间**：约 2-4 小时（含验证码处理时间）

## 常见问题

### Q: 爬虫卡住不动？
A: EUDAMED 或 NMPA 网站可能加载缓慢，请耐心等待。如果超过 5 分钟无响应，可以按 `Ctrl+C` 停止后重新运行。

### Q: 遇到验证码怎么办？
A: NMPA 爬虫会弹出浏览器窗口，遇到验证码时需要你手动完成，然后爬虫会继续运行。

### Q: 数据保存到哪里？
A: 数据会自动保存到 Supabase 数据库，同时也会保存为本地 JSON 文件备份。

### Q: 可以中断后继续吗？
A: 可以。爬虫支持断点续传，重新运行时会跳过已抓取的数据。

## 数据表说明

| 表名 | 数据量 | 说明 |
|------|--------|------|
| `eudamed_actors` | 10,000+ | 欧盟制造商 |
| `eudamed_devices` | 5,000+ | 欧盟器械 |
| `nmpa_devices` | 20,000+ | 中国药监局器械 |
| `fda_510k` | 1,000+ | FDA 510k 数据 |
| `fda_pma` | 1,000+ | FDA PMA 数据 |
| `fda_registrations` | 1,224 | FDA 注册企业 |

## 建议运行顺序

1. **先运行 EUDAMED 爬虫**（较简单，无需验证码）
2. **验证数据已导入 Supabase**
3. **再运行 NMPA 爬虫**（需要人工协助验证码）

## 验证数据导入

在 Supabase Dashboard 中查看：
1. 访问 https://supabase.com/dashboard
2. 进入 **Table Editor**
3. 查看各表的数据量

或者在本地终端运行：
```bash
# 需要安装 supabase-cli
supabase inspect
```
