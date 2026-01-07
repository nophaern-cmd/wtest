#!/bin/bash
# 批量生成上传命令脚本
# 使用方法: cd /Users/dulin03/work/wtest/didida/images && bash generate_upload_commands.sh > upload.sh

BASE_URL="https://YOUR_CLOUD_ENV-xxx.tcb.qcloud.la"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "# 图片上传命令"
echo "# 1. 修改 BASE_URL 为你的云存储域名"
echo "# 2. 安装 coscli: brew install coscli"
echo "# 3. 配置: coscli config"
echo "# 4. 执行: bash upload.sh"
echo ""

# letters (26张)
echo "# 上传 letters/"
ls -1 letters/*.png 2>/dev/null | while read file; do
    echo "coscli cp \"$file\" cos://your-bucket/images/letters/"
done

echo ""
echo "# 上传 animals/"
ls -1 animals/*.png 2>/dev/null | while read file; do
    echo "coscli cp \"$file\" cos://your-bucket/images/animals/"
done

echo ""
echo "# 上传 colors/"
ls -1 colors/*.png 2>/dev/null | while read file; do
    echo "coscli cp \"$file\" cos://your-bucket/images/colors/"
done

echo ""
echo "# 上传 food/"
ls -1 food/*.png 2>/dev/null | while read file; do
    echo "coscli cp \"$file\" cos://your-bucket/images/food/"
done

echo ""
echo "# 上传 body-people/"
ls -1 body-people/*.png 2>/dev/null | while read file; do
    echo "coscli cp \"$file\" cos://your-bucket/images/body-people/"
done

echo ""
echo "# 上传 actions/"
ls -1 actions/*.png 2>/dev/null | while read file; do
    echo "coscli cp \"$file\" cos://your-bucket/images/actions/"
done

echo ""
echo "# 上传 numbers/"
ls -1 numbers/*.png 2>/dev/null | while read file; do
    echo "coscli cp \"$file\" cos://your-bucket/images/numbers/"
done

echo ""
echo "# 上传 objects/"
ls -1 objects/*.png 2>/dev/null | while read file; do
    echo "coscli cp \"$file\" cos://your-bucket/images/objects/"
done

echo ""
echo "# 上传 weather/"
ls -1 weather/*.png 2>/dev/null | while read file; do
    echo "coscli cp \"$file\" cos://your-bucket/images/weather/"
done

echo ""
echo "# 上传 scenes/"
ls -1 scenes/*.png 2>/dev/null | while read file; do
    echo "coscli cp \"$file\" cos://your-bucket/images/scenes/"
done

echo ""
echo "# 上传 icons/"
ls -1 icons/*.png 2>/dev/null | while read file; do
    echo "coscli cp \"$file\" cos://your-bucket/images/icons/"
done

echo ""
echo "✓ 所有命令已生成！"
