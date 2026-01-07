#!/bin/bash
# 更新 CDN 配置中的 URL
# 使用方法: bash update_cdn_url.sh "https://你的云域名.tcb.qcloud.la"

if [ $# -eq 0 ]; then
    echo "用法: bash update_cdn_url.sh \"https://你的云域名.tcb.qcloud.la\""
    exit 1
fi

NEW_URL="$1"
CONFIG_FILE="/Users/dulin03/work/wtest/didida/images/cdn-config.js"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "错误: 配置文件不存在 $CONFIG_FILE"
    exit 1
fi

echo "正在更新 CDN URL..."
echo "旧 URL: YOUR_CLOUD_ENV-xxx.tcb.qcloud.la"
echo "新 URL: $NEW_URL"
echo ""

# 替换所有 URL
sed -i '' "s|https://YOUR_CLOUD_ENV-xxx.tcb.qcloud.la|$NEW_URL|g" "$CONFIG_FILE"

echo "✓ 更新完成！"
echo ""
echo "请检查配置文件: $CONFIG_FILE"
