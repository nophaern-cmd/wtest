# -*- coding: utf-8 -*-
import re

with open('didida/data/words.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 找到 kindergartenWords 数组的内容
match = re.search(r"kindergartenWords:\s*\[([\s\S]*?)\],\s*//\s*小学单词", content)
if match:
    array_content = match.group(1)
    
    # 删除从 k364 到 k404 的重复项
    lines = array_content.split('\n')
    filtered_lines = []
    skip_until = None
    
    for line in lines:
        # 检查是否是 k364-k404 的开始
        if skip_until is None and "id: 'k364'" in line:
            skip_until = 'k404'
            continue
        
        # 检查是否已经跳过 k404
        if skip_until is not None and "id: 'k404'" in line:
            skip_until = None
            continue
        
        # 如果正在跳过，则跳过这行
        if skip_until is not None:
            continue
        
        filtered_lines.append(line)
    
    # 替换原内容
    new_array_content = '\n'.join(filtered_lines)
    new_content = content.replace(array_content, new_array_content)
    
    with open('didida/data/words.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("重复项已删除")
else:
    print("未找到 kindergartenWords 数组")
