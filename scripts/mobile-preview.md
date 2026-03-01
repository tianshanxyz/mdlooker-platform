# 📱 MDLooker 手机体验指南

## 方式一：PWA 网页版（最快）

### 步骤 1: 启动本地服务器

在电脑终端运行：

```bash
# 进入项目目录
cd /Users/maxiaoha/Desktop/mdlooker-platform

# 使用 Python 启动简单 HTTP 服务器
python3 -m http.server 8080
```

### 步骤 2: 查看电脑 IP

```bash
# Mac
ifconfig | grep "inet " | grep -v 127.0.0.1

# 会显示类似：inet 192.168.1.100 netmask ...
# 记住这个 IP 地址
```

### 步骤 3: 手机访问

1. 确保手机和电脑连接 **同一个 WiFi**
2. 打开手机浏览器（Safari/Chrome）
3. 访问：`http://192.168.x.x:8080/mobile`
   - 把 `192.168.x.x` 换成你实际的 IP

### 步骤 4: 添加到主屏幕

**iPhone (Safari):**
1. 点击底部分享按钮 ⬆️
2. 选择"添加到主屏幕"
3. 点击"添加"

**Android (Chrome):**
1. 点击右上角菜单 ⋮
2. 选择"添加到主屏幕"
3. 点击"添加"

---

## 方式二：使用 ngrok 公网访问（无需同一 WiFi）

### 步骤 1: 安装 ngrok

```bash
# Mac
brew install ngrok

# 或下载 https://ngrok.com/download
```

### 步骤 2: 启动本地服务器

```bash
cd /Users/maxiaoha/Desktop/mdlooker-platform
python3 -m http.server 8080
```

### 步骤 3: 开启 ngrok 隧道

```bash
ngrok http 8080
```

### 步骤 4: 手机访问

ngrok 会显示一个公网地址，如：
```
Forwarding: https://abc123.ngrok.io -> http://localhost:8080
```

手机直接访问：`https://abc123.ngrok.io/mobile`

---

## 方式三：构建原生 APP（完整体验）

### 前置要求

- Node.js 16+
- Xcode（iOS）或 Android Studio（Android）

### 步骤

```bash
# 1. 安装依赖
cd /Users/maxiaoha/Desktop/mdlooker-platform
npm install

# 2. 构建静态文件
npm run build

# 3. 添加 iOS 平台
npx cap add ios

# 4. 同步代码到原生项目
npx cap sync

# 5. 打开 Xcode 运行
npx cap open ios
```

---

## 🎯 推荐体验流程

### 第一次体验（5分钟）
1. 使用 **方式一** 在手机上打开网页
2. 尝试搜索 "迈瑞" 或 "Medtronic"
3. 收藏一个企业
4. 查看个人中心的每日任务

### 深度体验（15分钟）
1. 使用 **方式二** 获得公网链接
2. 分享给朋友测试
3. 测试语音搜索功能
4. 测试扫码功能（需要部署到服务器）

### 完整体验（需要开发环境）
1. 使用 **方式三** 构建原生 APP
2. 获得最佳性能和体验
3. 上架 App Store / Google Play

---

## 📋 功能检查清单

在手机上测试以下功能：

- [ ] 首页搜索框正常显示
- [ ] 搜索建议自动弹出
- [ ] 语音搜索按钮可点击
- [ ] 扫码按钮可点击
- [ ] 搜索结果正常显示
- [ ] 企业详情页可打开
- [ ] 收藏功能正常
- [ ] 分享功能正常
- [ ] 个人中心页面正常
- [ ] 每日任务显示正常
- [ ] 添加到主屏幕后图标正常
- [ ] PWA 离线访问正常

---

## 🐛 常见问题

### Q: 手机无法访问电脑 IP
A: 检查手机和电脑是否在同一 WiFi，或尝试关闭电脑防火墙

### Q: 页面显示不正常
A: 清除浏览器缓存，或使用无痕模式

### Q: 语音搜索不工作
A: 确保手机浏览器有麦克风权限

### Q: 扫码功能不工作
A: 扫码需要原生 APP 或 HTTPS 环境

---

## 📞 需要帮助？

如果遇到问题，请检查：
1. 电脑和手机是否同一网络
2. 防火墙是否阻止了 8080 端口
3. 浏览器是否支持 PWA 功能
