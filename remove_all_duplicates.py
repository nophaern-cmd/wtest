# -*- coding: utf-8 -*-
import re

with open('didida/data/words.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 找到 kindergartenWords 数组的内容
match = re.search(r"kindergartenWords:\s*\[([\s\S]*?)\],\s*//\s*小学单词", content)
if match:
    array_content = match.group(1)
    
    # 找出所有单词ID
    id_pattern = re.compile(r"id:\s*'k(\d+)'")
    ids = id_pattern.findall(array_content)
    
    # 找出重复的ID - k293 到 k348 是前面 k178-k232 的重复
    # 另外还要检查 k324-k348 (这些都是重复的)
    duplicate_ids = []
    seen_words = {}
    
    lines = array_content.split('\n')
    for i, line in enumerate(lines):
        id_match = re.search(r"id:\s*'k(\d+)'", line)
        word_match = re.search(r"word:\s*'([^']+)'", line)
        
        if id_match and word_match:
            id_num = int(id_match.group(1))
            word = word_match.group(1)
            
            if word in seen_words:
                # 这个单词已经出现过了
                duplicate_ids.append(id_num)
            else:
                seen_words[word] = id_num
    
    print(f"发现 {len(duplicate_ids)} 个重复项")
    print("重复的ID:", duplicate_ids[:20], "..." if len(duplicate_ids) > 20 else "")
    
    # 删除重复项
    filtered_lines = []
    skip_current = False
    
    for line in lines:
        id_match = re.search(r"id:\s*'k(\d+)'", line)
        if id_match:
            id_num = int(id_match.group(1))
            if id_num in duplicate_ids:
                skip_current = True
                continue
        
        if skip_current and '},' in line:
            skip_current = False
            continue
        
        if not skip_current:
            filtered_lines.append(line)
    
    # 替换原内容
    new_array_content = '\n'.join(filtered_lines)
    new_content = content.replace(array_content, new_array_content)
    
    with open('didida/data/words.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("重复项已删除")
else:
    print("未找到 kindergartenWords 数组")
