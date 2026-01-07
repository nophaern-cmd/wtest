#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
上传图片到腾讯云 COS
使用前需安装: pip install cos-python-sdk-v5
"""

import os
import sys
from qcloud_cos import CosConfig
from qcloud_cos import CosS3Client
import logging

# ==================== 配置区域 ====================

# 腾讯云配置
SECRET_ID = '你的SecretID'  # 从 https://console.cloud.tencent.com/cam/capi 获取
SECRET_KEY = '你的SecretKey'  # 同上
REGION = 'ap-guangzhou'  # 区域：ap-beijing, ap-shanghai, ap-guangzhou 等
BUCKET = '你的存储桶名称'  # 例如：wordgame-1234567890

# 本地图片目录
IMAGE_DIR = '/Users/dulin03/work/wtest/didida/images'

# 云存储目录
REMOTE_DIR = 'images'

# ==================== 日志配置 ====================

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ==================== 上传函数 ====================

def upload_directory(client, category):
    """上传单个分类目录"""
    category_path = os.path.join(IMAGE_DIR, category)
    
    if not os.path.exists(category_path):
        logger.warning(f"目录不存在: {category}")
        return
    
    logger.info(f"处理目录: {category}")
    
    success_count = 0
    failed_count = 0
    
    # 遍历目录中的所有图片文件
    for filename in os.listdir(category_path):
        if not filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            continue
        
        local_path = os.path.join(category_path, filename)
        remote_path = f"{REMOTE_DIR}/{category}/{filename}"
        
        file_size = os.path.getsize(local_path)
        
        try:
            logger.info(f"上传: {filename} ({file_size} bytes)")
            
            response = client.put_object_from_local_file(
                Bucket=BUCKET,
                Key=remote_path,
                LocalFilePath=local_path
            )
            
            if response.get('ETag'):
                success_count += 1
                logger.info(f"✓ 上传成功: {filename}")
            else:
                failed_count += 1
                logger.error(f"✗ 上传失败: {filename}")
                
        except Exception as e:
            failed_count += 1
            logger.error(f"✗ 上传失败 {filename}: {str(e)}")
    
    logger.info(f"{category}: 成功 {success_count}, 失败 {failed_count}")
    return success_count, failed_count

def main():
    """主函数"""
    print("=" * 50)
    print("  腾讯云 COS 图片上传工具 (Python版)")
    print("=" * 50)
    print()
    
    # 检查配置
    if SECRET_ID == '你的SecretID' or SECRET_KEY == '你的SecretKey':
        logger.error("请先配置 SECRET_ID 和 SECRET_KEY")
        logger.info("从以下地址获取: https://console.cloud.tencent.com/cam/capi")
        sys.exit(1)
    
    # 初始化 COS 客户端
    config = CosConfig(Region=REGION, SecretId=SECRET_ID, SecretKey=SECRET_KEY)
    client = CosS3Client(config)
    
    # 显示配置
    logger.info(f"存储桶: {BUCKET}")
    logger.info(f"区域: {REGION}")
    logger.info(f"本地目录: {IMAGE_DIR}")
    logger.info(f"云端目录: {REMOTE_DIR}")
    print()
    
    # 确认上传
    confirm = input("确认开始上传？(y/n): ")
    if confirm.lower() != 'y':
        logger.info("已取消")
        sys.exit(0)
    
    print()
    logger.info("开始上传...")
    print()
    
    # 按分类上传
    categories = [
        'letters', 'animals', 'colors', 'food', 'body-people',
        'actions', 'numbers', 'objects', 'weather', 'scenes', 'icons'
    ]
    
    total_success = 0
    total_failed = 0
    
    for category in categories:
        success, failed = upload_directory(client, category)
        total_success += success
        total_failed += failed
    
    print()
    print("=" * 50)
    print("  上传完成")
    print("=" * 50)
    print()
    logger.info(f"总计: 成功 {total_success}, 失败 {total_failed}")
    print()
    
    if total_failed == 0:
        logger.info("所有文件上传成功！")
        logger.info("下一步:")
        logger.info("  1. 登录腾讯云控制台确认文件已上传")
        logger.info("  2. 开启 CDN 加速")
        logger.info("  3. 获取 CDN 域名")
        logger.info("  4. 更新 cdn-config.js 中的 URL")
    else:
        logger.warning("部分文件上传失败，请检查错误信息")

if __name__ == '__main__':
    main()
