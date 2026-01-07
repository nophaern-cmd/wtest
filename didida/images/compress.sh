#!/bin/bash
# 压缩PNG图片到20KB左右
# 使用sips调整尺寸

TARGET_KB=20
TARGET_DIR="$1"

if [ -z "$TARGET_DIR" ]; then
    echo "用法: $0 <目录>"
    exit 1
fi

cd "$TARGET_DIR" || exit 1

echo "开始压缩图片到 ${TARGET_KB}KB 左右..."

for file in *.png; do
    if [ ! -f "$file" ]; then
        continue
    fi
    
    current_size=$(stat -f%z "$file")
    current_kb=$((current_size / 1024))
    
    if [ $current_kb -le $((TARGET_KB * 12 / 10)) ]; then
        echo "跳过 $file (${current_kb}KB)"
        continue
    fi
    
    echo "处理 $file (${current_kb}KB)..."
    
    # 尝试不同尺寸
    for size in 256 200 180 150 128; do
        temp_file="${file}.tmp.png"
        sips -s format png -s formatOptions 50 -z $size "$file" --out "$temp_file" 2>&1 | grep -v "Error"
        
        if [ -f "$temp_file" ]; then
            new_size=$(stat -f%z "$temp_file")
            new_kb=$((new_size / 1024))
            
            echo "  尺寸 ${size}px: ${new_kb}KB"
            
            if [ $new_kb -le $TARGET_KB ]; then
                mv "$temp_file" "$file"
                echo "  ✓ 压缩完成: ${new_kb}KB"
                break
            elif [ $size -eq 128 ]; then
                # 最小尺寸，使用它
                mv "$temp_file" "$file"
                echo "  ✓ 使用最小尺寸: ${new_kb}KB"
                break
            else
                rm -f "$temp_file"
            fi
        fi
    done
done

echo "完成!"
