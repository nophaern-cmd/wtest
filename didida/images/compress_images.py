#!/usr/bin/env python3
"""压缩PNG图片到20KB左右"""
import os
import sys
from PIL import Image

def compress_png(input_path, target_size_kb=20, max_width=512):
    """压缩PNG图片到目标大小"""
    try:
        # 打开图片
        img = Image.open(input_path)
        
        # 如果是RGBA模式，转换为RGB
        if img.mode == 'RGBA':
            # 创建白色背景
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3])  # 使用alpha通道作为mask
            img = background
        elif img.mode not in ['RGB', 'L']:
            img = img.convert('RGB')
        
        # 计算当前文件大小
        current_size = os.path.getsize(input_path)
        current_size_kb = current_size / 1024
        
        print(f"处理: {os.path.basename(input_path)} - 原始大小: {current_size_kb:.1f}KB")
        
        # 如果已经小于目标大小，跳过
        if current_size_kb <= target_size_kb * 1.2:
            print(f"  -> 已足够小，跳过")
            return False
        
        # 尝试不同的压缩质量
        quality = 85
        width = min(max_width, img.width)
        height = int(width * img.height / img.width)
        
        while quality > 30:
            # 调整大小
            resized = img.resize((width, height), Image.Resampling.LANCZOS)
            
            # 保存到临时文件
            temp_path = input_path + '.temp.png'
            resized.save(temp_path, 'PNG', optimize=True, quality=quality)
            
            # 检查文件大小
            temp_size = os.path.getsize(temp_path)
            temp_size_kb = temp_size / 1024
            
            print(f"  质量{quality}%, 尺寸{width}x{height}: {temp_size_kb:.1f}KB")
            
            if temp_size_kb <= target_size_kb:
                # 替换原文件
                os.replace(temp_path, input_path)
                print(f"  ✓ 压缩完成: {temp_size_kb:.1f}KB")
                return True
            elif quality == 30:
                # 最低质量了，还是太大了，进一步缩小尺寸
                width = int(width * 0.8)
                height = int(height * 0.8)
                quality = 70
                if width < 200:
                    # 使用最小尺寸的结果
                    os.replace(temp_path, input_path)
                    print(f"  ✓ 使用最小尺寸: {temp_size_kb:.1f}KB")
                    return True
                else:
                    os.remove(temp_path)
            else:
                # 删除临时文件，降低质量
                os.remove(temp_path)
                quality -= 10
        
        return False
        
    except Exception as e:
        print(f"  ✗ 错误: {e}")
        return False

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("用法: python3 compress_images.py <目录>")
        sys.exit(1)
    
    target_dir = sys.argv[1]
    
    if not os.path.isdir(target_dir):
        print(f"错误: {target_dir} 不是目录")
        sys.exit(1)
    
    # 处理所有PNG文件
    png_files = [f for f in os.listdir(target_dir) if f.lower().endswith('.png')]
    png_files.sort()
    
    print(f"找到 {len(png_files)} 个PNG文件\n")
    
    compressed_count = 0
    for png_file in png_files:
        full_path = os.path.join(target_dir, png_file)
        if compress_png(full_path):
            compressed_count += 1
        print()
    
    print(f"\n完成! 共压缩 {compressed_count}/{len(png_files)} 个文件")
