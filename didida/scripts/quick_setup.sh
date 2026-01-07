#!/bin/bash
#
# 快速配置脚本 - 检查环境和生成配置
#

set -e

echo "======================================"
echo "  腾讯云 COS 上传环境检查"
echo "======================================"
echo ""

# 检查 coscli
echo "1. 检查 coscli..."
if command -v coscli &> /dev/null; then
    VERSION=$(coscli version 2>/dev/null || echo "未知")
    echo "   ✓ coscli 已安装 (版本: $VERSION)"
else
    echo "   ✗ coscli 未安装"
    echo ""
    echo "   安装方法:"
    echo "   brew install coscli"
    echo ""
    exit 1
fi
echo ""

# 检查配置
echo "2. 检查 coscli 配置..."
if [ -f "$HOME/.cos.yaml" ]; then
    echo "   ✓ 配置文件存在: ~/.cos.yaml"
    echo ""
    echo "   当前配置:"
    cat "$HOME/.cos.yaml" | grep -E "(bucket|region|secret_id)" | sed 's/^/   /'
else
    echo "   ✗ 配置文件不存在"
    echo ""
    echo "   配置方法:"
    echo "   coscli config"
    echo ""
    exit 1
fi
echo ""

# 提取配置
BUCKET=$(cat "$HOME/.cos.yaml" | grep "^bucket" | awk -F: '{print $2}' | xargs)
REGION=$(cat "$HOME/.cos.yaml" | grep "^region" | awk -F: '{print $2}' | xargs)

if [ -z "$BUCKET" ] || [ -z "$REGION" ]; then
    echo "   ⚠ 无法从配置文件读取 bucket 或 region"
    echo "   请手动编辑 upload_to_cdn.sh"
    echo ""
else
    echo "3. 自动配置上传脚本..."
    SCRIPT_FILE="/Users/dulin03/work/wtest/didida/images/upload_to_cdn.sh"
    
    if [ -f "$SCRIPT_FILE" ]; then
        # 备份原文件
        cp "$SCRIPT_FILE" "${SCRIPT_FILE}.bak"
        
        # 更新配置
        sed -i '' "s|BUCKET=\"cos://你的存储桶名称/你的区域\"|BUCKET=\"cos://${BUCKET}/${REGION}\"|g" "$SCRIPT_FILE"
        
        echo "   ✓ 已更新上传脚本配置"
        echo "     Bucket: $BUCKET"
        echo "     Region: $REGION"
    else
        echo "   ✗ 上传脚本不存在: $SCRIPT_FILE"
    fi
fi
echo ""

# 测试连接
echo "4. 测试 COS 连接..."
if coscli ls "cos://${BUCKET}/${REGION}/" &>/dev/null; then
    echo "   ✓ 连接成功"
else
    echo "   ✗ 连接失败"
    echo "   请检查:"
    echo "   - 存储桶是否存在"
    echo "   - 密钥是否正确"
    echo "   - 权限是否足够"
    echo ""
    exit 1
fi
echo ""

echo "======================================"
echo "  环境检查完成"
echo "======================================"
echo ""
echo "下一步："
echo "  运行上传脚本: cd didida/images && bash upload_to_cdn.sh"
echo ""
