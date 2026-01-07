#!/bin/bash
#
# 上传图片到腾讯云 COS（对象存储）
#
# 使用前准备：
# 1. 安装 coscli: brew install coscli
# 2. 配置: coscli config
#    - SecretID: 从 https://console.cloud.tencent.com/cam/capi 获取
#    - SecretKey: 同上
#    - Bucket: 存储桶名称（如：wordgame-1234567890）
#    - Region: 区域（如：ap-guangzhou）
# 3. 开通 CDN 加速
#
# 使用方法:
#   bash upload_to_cdn.sh
#

set -e  # 遇到错误立即退出

# ==================== 配置区域 ====================

# 腾讯云存储桶配置
# 格式: cos://bucket-name/region
# 示例: cos://wordgame-1234567890/ap-guangzhou
BUCKET="cos://你的存储桶名称/你的区域"

# 本地图片目录
IMAGE_DIR="/Users/dulin03/work/wtest/didida/images"

# 云存储目录（CDN 路径）
REMOTE_DIR="images"

# 上传统计
TOTAL_FILES=0
SUCCESS_FILES=0
FAILED_FILES=0

# ==================== 颜色输出 ====================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ==================== 函数 ====================

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# ==================== 检查环境 ====================

check_coscli() {
    if ! command -v coscli &> /dev/null; then
        print_error "coscli 未安装"
        echo ""
        echo "请使用以下命令安装："
        echo "  brew install coscli"
        echo ""
        echo "安装完成后运行："
        echo "  coscli config"
        exit 1
    fi
    print_success "coscli 已安装"
}

check_config() {
    # 检查配置文件
    if [ ! -f "$HOME/.cos.yaml" ]; then
        print_error "coscli 未配置"
        echo ""
        echo "请运行以下命令配置："
        echo "  coscli config"
        echo ""
        echo "需要提供："
        echo "  - SecretID"
        echo "  - SecretKey"
        echo "  - Bucket (存储桶名称)"
        echo "  - Region (区域)"
        exit 1
    fi
    print_success "coscli 配置文件存在"
}

check_image_dir() {
    if [ ! -d "$IMAGE_DIR" ]; then
        print_error "图片目录不存在: $IMAGE_DIR"
        exit 1
    fi
    print_success "图片目录存在: $IMAGE_DIR"
}

# ==================== 上传函数 ====================

upload_file() {
    local local_file="$1"
    local remote_file="$2"
    local file_size=$(du -h "$local_file" | cut -f1)
    
    TOTAL_FILES=$((TOTAL_FILES + 1))
    
    print_info "上传: $local_file (${file_size})"
    
    if coscli cp "$local_file" "$remote_file" --force 2>/dev/null; then
        SUCCESS_FILES=$((SUCCESS_FILES + 1))
        print_success "✓ 上传成功"
        return 0
    else
        FAILED_FILES=$((FAILED_FILES + 1))
        print_error "✗ 上传失败"
        return 1
    fi
}

upload_directory() {
    local category="$1"
    local category_path="$IMAGE_DIR/$category"
    
    if [ ! -d "$category_path" ]; then
        print_warning "跳过不存在的目录: $category"
        return
    fi
    
    print_info "处理目录: $category"
    
    # 上传该目录下所有 png/jpg/jpeg 文件
    find "$category_path" -maxdepth 1 -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) | while read file; do
        local filename=$(basename "$file")
        local remote_path="${BUCKET}/${REMOTE_DIR}/${category}/${filename}"
        upload_file "$file" "$remote_path"
    done
}

# ==================== 主函数 ====================

main() {
    echo ""
    echo "======================================"
    echo "  腾讯云 COS 图片上传工具"
    echo "======================================"
    echo ""
    
    # 检查环境
    print_info "检查环境..."
    check_coscli
    check_config
    check_image_dir
    echo ""
    
    # 显示配置
    print_info "当前配置："
    echo "  存储桶: $BUCKET"
    echo "  本地目录: $IMAGE_DIR"
    echo "  云端目录: $REMOTE_DIR"
    echo ""
    
    # 确认上传
    print_warning "即将开始上传，确认继续？(y/n)"
    read -r confirm
    if [ "$confirm" != "y" ]; then
        print_info "已取消"
        exit 0
    fi
    echo ""
    
    # 开始上传
    local start_time=$(date +%s)
    
    print_info "开始上传图片..."
    echo ""
    
    # 按分类上传
    upload_directory "letters"
    upload_directory "animals"
    upload_directory "colors"
    upload_directory "food"
    upload_directory "body-people"
    upload_directory "actions"
    upload_directory "numbers"
    upload_directory "objects"
    upload_directory "weather"
    upload_directory "scenes"
    upload_directory "icons"
    
    # 统计结果
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo ""
    echo "======================================"
    echo "  上传完成"
    echo "======================================"
    echo ""
    print_info "统计信息："
    echo "  总文件数: $TOTAL_FILES"
    echo "  成功: $SUCCESS_FILES"
    echo "  失败: $FAILED_FILES"
    echo "  耗时: ${duration}秒"
    echo ""
    
    if [ $FAILED_FILES -eq 0 ]; then
        print_success "所有文件上传成功！"
        echo ""
        print_info "下一步："
        echo "  1. 登录腾讯云控制台确认文件已上传"
        echo "  2. 开启 CDN 加速"
        echo "  3. 获取 CDN 域名"
        echo "  4. 运行: bash update_cdn_url.sh 'https://你的CDN域名'"
    else
        print_error "部分文件上传失败，请检查错误信息并重试"
    fi
}

# 执行主函数
main
