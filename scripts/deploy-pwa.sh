#!/bin/bash

# MDLooker PWA 部署脚本
# 用法: ./deploy-pwa.sh [目标目录]

set -e

echo "🚀 MDLooker PWA 部署脚本"
echo "========================"

# 默认部署目录
TARGET_DIR="${1:-/tmp/mdlooker-pwa-deploy}"

# 清理并创建目录
echo "📁 准备部署目录: $TARGET_DIR"
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"

# 复制PWA文件
echo "📦 复制PWA文件..."
cp -r public/mobile "$TARGET_DIR/"

# 创建入口文件
cat > "$TARGET_DIR/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url=mobile/index.html">
    <title>MDLooker - 全球医疗器械合规信息平台</title>
</head>
<body>
    <p>正在跳转到MDLooker APP...</p>
    <a href="mobile/index.html">点击这里进入</a>
</body>
</html>
EOF

# 复制图标
echo "🎨 复制图标资源..."
mkdir -p "$TARGET_DIR/icons"
cp public/icons/*.png "$TARGET_DIR/icons/" 2>/dev/null || true

# 显示部署信息
echo ""
echo "✅ 部署完成!"
echo ""
echo "📍 部署目录: $TARGET_DIR"
echo ""
echo "🌐 本地预览:"
echo "   cd $TARGET_DIR && python3 -m http.server 8080"
echo ""
echo "📱 访问地址:"
echo "   http://localhost:8080/mobile/"
echo ""
echo "🚀 上传到服务器:"
echo "   rsync -avz $TARGET_DIR/ user@server:/var/www/html/"
echo ""
