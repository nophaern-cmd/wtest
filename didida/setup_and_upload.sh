#!/bin/bash
#
# 完整的上传流程 - 分步执行
#
# 每一步都需要手动确认，请按提示操作
#

set -e

echo "======================================"
echo "  腾讯云 COS 上传完整流程"
echo "======================================"
echo ""

# ==================== 第1步：安装 coscli ====================

echo "======================================"
echo "第 1 步：安装 coscli 工具"
echo "======================================"
echo ""
echo "请执行以下命令安装 coscli："
echo ""
echo "  brew install coscli"
echo ""
read -p "安装完成后按 Enter 继续..."
echo ""

# 检查是否安装成功
if ! command -v coscli &> /dev/null; then
    echo "错误：coscli 未安装成功"
    echo "请检查网络连接或手动下载安装"
    exit 1
fi

echo "✓ coscli 安装成功"
VERSION=$(coscli version 2>/dev/null || echo "未知")
echo "  版本: $VERSION"
echo ""

# ==================== 第2步：获取密钥 ====================

echo "======================================"
echo "第 2 步：获取腾讯云 API 密钥"
echo "======================================"
echo ""
echo "请按以下步骤操作："
echo ""
echo "1. 访问 https://console.cloud.tencent.com/cam/capi"
echo "2. 点击「新建密钥」或查看现有密钥"
echo "3. 复制 SecretId 和 SecretKey"
echo ""
read -p "准备好密钥后按 Enter 继续..."
echo ""

# ==================== 第3步：创建存储桶 ====================

echo "======================================"
echo "第 3 步：创建 COS 存储桶"
echo "======================================"
echo ""
echo "请按以下步骤操作："
echo ""
echo "1. 访问 https://console.cloud.tencent.com/cos/bucket"
echo "2. 点击「创建存储桶」"
echo "3. 配置："
echo "   - 名称：wordgame-日期 (如：wordgame-20250107)"
echo "   - 所属地域：选择离你最近的区域 (如：广州 ap-guangzhou)"
echo "   - 访问权限：公有读私有写 (重要！)"
echo "   - 其他：保持默认"
echo "4. 创建完成后，记录存储桶名称和区域"
echo ""
echo "示例："
echo "  存储桶名称：wordgame-20250107-1234567890"
echo "  区域：ap-guangzhou"
echo ""
read -p "存储桶创建完成后按 Enter 继续..."
echo ""

# 输入存储桶信息
read -p "请输入存储桶名称: " BUCKET_NAME
read -p "请输入区域 (如: ap-guangzhou): " REGION

if [ -z "$BUCKET_NAME" ] || [ -z "$REGION" ]; then
    echo "错误：存储桶名称和区域不能为空"
    exit 1
fi

echo ""
echo "存储桶配置："
echo "  名称: $BUCKET_NAME"
echo "  区域: $REGION"
echo ""

read -p "确认信息正确吗？(y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
    echo "已取消"
    exit 0
fi
echo ""

# ==================== 第4步：配置 coscli ====================

echo "======================================"
echo "第 4 步：配置 coscli"
echo "======================================"
echo ""
echo "现在开始配置 coscli，请按提示输入："
echo ""
echo "需要提供："
echo "  - SecretID"
echo "  - SecretKey"
echo "  - Bucket: $BUCKET_NAME"
echo "  - Region: $REGION"
echo ""
read -p "准备好后按 Enter 开始配置..."

coscli config

echo ""
echo "配置完成！"
echo ""

# ==================== 第5步：更新上传脚本 ====================

echo "======================================"
echo "第 5 步：配置上传脚本"
echo "======================================"
echo ""

SCRIPT_FILE="/Users/dulin03/work/wtest/didida/images/upload_to_cdn.sh"

if [ -f "$SCRIPT_FILE" ]; then
    # 备份原文件
    cp "$SCRIPT_FILE" "${SCRIPT_FILE}.bak"
    echo "已备份原文件: ${SCRIPT_FILE}.bak"

    # 更新配置
    sed -i '' "s|BUCKET=\"cos://你的存储桶名称/你的区域\"|BUCKET=\"cos://${BUCKET_NAME}/${REGION}\"|g" "$SCRIPT_FILE"

    echo "✓ 已更新上传脚本配置"
    echo "  Bucket: $BUCKET_NAME"
    echo "  Region: $REGION"
else
    echo "错误：上传脚本不存在: $SCRIPT_FILE"
    exit 1
fi
echo ""

# ==================== 第6步：测试连接 ====================

echo "======================================"
echo "第 6 步：测试 COS 连接"
echo "======================================"
echo ""

echo "正在测试连接..."
if coscli ls "cos://${BUCKET_NAME}/${REGION}/" &>/dev/null; then
    echo "✓ 连接成功！"
else
    echo "✗ 连接失败"
    echo ""
    echo "可能原因："
    echo "  1. 存储桶不存在"
    echo "  2. 密钥配置错误"
    echo "  3. 权限不足"
    echo "  4. 区域不正确"
    echo ""
    read -p "是否继续上传？(y/n): " CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        echo "已取消"
        exit 0
    fi
fi
echo ""

# ==================== 第7步：上传图片 ====================

echo "======================================"
echo "第 7 步：上传图片"
echo "======================================"
echo ""
echo "即将上传以下目录："
echo "  - letters (26张)"
echo "  - animals (16张)"
echo "  - colors (9张)"
echo "  - food (4张)"
echo "  - body-people (17张)"
echo "  - actions (2张)"
echo "  - numbers (11张)"
echo "  - objects (9张)"
echo "  - weather (6张)"
echo "  - scenes (3张)"
echo "  - icons (15张)"
echo ""
echo "总计：118张图片，约 1.74MB"
echo ""
read -p "开始上传？(y/n): " START_UPLOAD

if [ "$START_UPLOAD" != "y" ]; then
    echo "已取消"
    exit 0
fi
echo ""

cd "/Users/dulin03/work/wtest/didida/images"
bash upload_to_cdn.sh

echo ""

# ==================== 第8步：获取 CDN 域名 ====================

echo "======================================"
echo "第 8 步：获取 CDN 域名"
echo "======================================"
echo ""
echo "请按以下步骤操作："
echo ""
echo "1. 访问 https://console.cloud.tencent.com/cos/bucket"
echo "2. 点击进入你的存储桶"
echo "3. 查看「域名信息」"
echo "4. 复制 CDN 域名（格式：https://xxx.cos.ap-guangzhou.myqcloud.com）"
echo ""
echo "或开启 CDN 加速获取自定义域名"
echo ""
read -p "准备好 CDN 域名后按 Enter 继续..."

read -p "请输入 CDN 域名: " CDN_URL

if [ -z "$CDN_URL" ]; then
    echo "错误：CDN 域名不能为空"
    exit 1
fi

echo ""
echo "CDN 域名: $CDN_URL"
echo ""

read -p "确认域名正确吗？(y/n): " CONFIRM_URL
if [ "$CONFIRM_URL" != "y" ]; then
    echo "已取消"
    exit 0
fi
echo ""

# ==================== 第9步：更新配置文件 ====================

echo "======================================"
echo "第 9 步：更新 CDN 配置"
echo "======================================"
echo ""

bash update_cdn_url.sh "$CDN_URL"

echo ""
echo "✓ 配置已更新"
echo ""

# ==================== 完成 ====================

echo "======================================"
echo "  完成！"
echo "======================================"
echo ""
echo "📊 上传信息："
echo "  存储桶: $BUCKET_NAME"
echo "  区域: $REGION"
echo "  CDN 域名: $CDN_URL"
echo "  图片数量: 118"
echo "  大小: ~1.74MB"
echo ""
echo "📝 下一步："
echo "  1. 在小程序中测试图片显示"
echo "  2. 检查加载速度"
echo "  3. 确认 CDN 配置正确"
echo ""
echo "📖 文档："
echo "  - CDN 使用示例: /Users/dulin03/work/wtest/didida/CDN_USAGE.md"
echo "  - 上传指南: /Users/dulin03/work/wtest/didida/UPLOAD_README.md"
echo ""
echo "✅ 所有步骤完成！"
