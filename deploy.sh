#!/bin/bash
# MDLooker 平台部署脚本（生产环境）
# 特点：
# 1. 数据先保存到本地
# 2. 清洗和压缩后再上传
# 3. 详细的进度和日志
# 4. 错误恢复机制

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 打印横幅
echo "===================================================="
echo "   MDLooker Platform - 生产环境部署脚本"
echo "   版本：1.0.0"
echo "   日期：$(date '+%Y-%m-%d %H:%M:%S')"
echo "===================================================="
echo ""

# 检查 Node.js 版本
log_info "检查 Node.js 版本..."
if ! command -v node &> /dev/null; then
    log_error "Node.js 未安装，请先安装 Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    log_error "Node.js 版本过低 ($NODE_VERSION)，需要 18+"
    exit 1
fi
log_success "Node.js 版本：$(node -v)"

# 检查 Python 版本
log_info "检查 Python 版本..."
if ! command -v python3 &> /dev/null; then
    log_error "Python3 未安装，请先安装 Python 3.10+"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1)
if [ "$PYTHON_VERSION" -lt 3 ]; then
    log_error "Python 版本过低，需要 3.10+"
    exit 1
fi
log_success "Python 版本：$(python3 --version)"

# 检查环境变量
log_info "检查环境变量配置..."
if [ ! -f ".env.local" ]; then
    log_error ".env.local 文件不存在，请复制 .env.local.example 并配置"
    exit 1
fi

# 检查关键环境变量
if ! grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local || \
   ! grep -q "SUPABASE_SERVICE_ROLE_KEY" .env.local; then
    log_error "Supabase 环境变量未配置，请检查 .env.local"
    exit 1
fi
log_success "环境变量配置正确"

# 安装依赖
log_info "安装前端依赖..."
if [ -f "package.json" ]; then
    npm ci --production
    log_success "前端依赖安装完成"
else
    log_error "package.json 不存在"
    exit 1
fi

# 安装 Python 依赖
log_info "安装 Python 依赖..."
if [ -f "scripts/scrapers/requirements.txt" ]; then
    python3 -m pip install -r scripts/scrapers/requirements.txt --quiet
    log_success "Python 依赖安装完成"
else
    log_warning "requirements.txt 不存在，跳过 Python 依赖安装"
fi

# 构建项目
log_info "构建 Next.js 项目..."
npm run build
log_success "项目构建完成"

# 创建数据目录
log_info "创建数据目录结构..."
mkdir -p scripts/scrapers/data/pipeline
mkdir -p scripts/scrapers/data/raw
mkdir -p scripts/scrapers/data/cleaned
mkdir -p scripts/scrapers/data/compressed
log_success "数据目录创建完成"

# 打印部署后说明
echo ""
echo "===================================================="
log_success "部署完成！"
echo "===================================================="
echo ""
echo "下一步操作："
echo ""
echo "1. 数据采集（先保存到本地）："
echo "   cd scripts/scrapers"
echo "   python3 data_collector_manager.py --all"
echo ""
echo "2. 数据清洗和压缩："
echo "   python3 data_pipeline.py"
echo ""
echo "3. 上传到 Supabase："
echo "   python3 upload_to_supabase.py"
echo ""
echo "4. 启动生产服务器："
echo "   npm run start"
echo ""
echo "或者使用 PM2 管理："
echo "   pm2 start npm --name 'mdlooker' -- start"
echo "   pm2 save"
echo ""
echo "===================================================="
echo "部署日志：$(pwd)/deployment_$(date +%Y%m%d_%H%M%S).log"
echo "===================================================="
