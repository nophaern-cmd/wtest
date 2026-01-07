# 图片上传到 CDN 完整指南

## 📦 上传方式对比

| 方式 | 难度 | 推荐度 | 适用场景 |
|------|------|--------|----------|
| 微信云存储 | ⭐ | ⭐⭐⭐⭐⭐ | 已开通云开发，最简单 |
| coscli | ⭐⭐ | ⭐⭐⭐⭐ | 批量上传，自动化 |
| Python SDK | ⭐⭐⭐ | ⭐⭐⭐ | 需要编程控制 |
| 手动上传 | ⭐ | ⭐⭐ | 图片数量少时 |

---

## 🚀 快速开始

### 推荐方案：使用 coscli

#### 步骤 1：安装工具

```bash
brew install coscli
```

#### 步骤 2：配置

```bash
coscli config
```

需要提供：
- SecretID: 从 https://console.cloud.tencent.com/cam/capi 获取
- SecretKey: 同上
- Bucket: 存储桶名称（如：wordgame-20250107）
- Region: 区域（如：ap-guangzhou）

#### 步骤 3：快速配置

```bash
cd /Users/dulin03/work/wtest/didida/scripts
bash quick_setup.sh
```

#### 步骤 4：上传图片

```bash
cd /Users/dulin03/work/wtest/didida/images
bash upload_to_cdn.sh
```

#### 步骤 5：更新 CDN URL

```bash
bash update_cdn_url.sh "https://你的CDN域名"
```

---

## 📖 详细文档

### 上传方式详解

- **腾讯云 COS 上传**：见 [COS_UPLOAD_GUIDE.md](./COS_UPLOAD_GUIDE.md)
- **通用上传指南**：见 [scripts/UPLOAD_GUIDE.md](./scripts/UPLOAD_GUIDE.md)
- **代码使用示例**：见 [CDN_USAGE.md](./CDN_USAGE.md)

---

## 📁 文件结构

```
didida/
├── images/
│   ├── upload_to_cdn.sh          # coscli 批量上传脚本（推荐）
│   ├── update_cdn_url.sh         # 更新 CDN URL 脚本
│   ├── generate_upload_commands.sh # 生成上传命令
│   └── cdn-config.js             # CDN 配置文件
│
├── scripts/
│   ├── upload_to_cos.py          # Python 上传脚本
│   ├── upload_images.js          # Node.js 上传脚本（需 Node.js）
│   ├── convert-to-cdn.js        # 自动转换代码引用（需 Node.js）
│   └── quick_setup.sh            # 快速环境配置脚本
│
├── COS_UPLOAD_GUIDE.md           # COS 上传详细指南
├── CDN_USAGE.md                  # 代码使用示例
└── UPLOAD_README.md              # 本文件
```

---

## 🔧 脚本说明

### images/upload_to_cdn.sh

**功能**：使用 coscli 批量上传图片到腾讯云 COS

**使用前**：
1. 安装 coscli
2. 配置密钥
3. 修改脚本中的 BUCKET 配置

**使用方法**：
```bash
cd images
bash upload_to_cdn.sh
```

**输出**：上传进度和统计信息

---

### scripts/upload_to_cos.py

**功能**：使用 Python SDK 上传图片

**使用前**：
1. 安装依赖：`pip install cos-python-sdk-v5`
2. 编辑脚本中的密钥配置

**使用方法**：
```bash
cd scripts
python3 upload_to_cos.py
```

---

### scripts/quick_setup.sh

**功能**：自动检查环境并配置上传脚本

**使用方法**：
```bash
cd scripts
bash quick_setup.sh
```

**功能**：
- 检查 coscli 是否安装
- 检查配置文件
- 自动配置 upload_to_cdn.sh
- 测试 COS 连接

---

### images/update_cdn_url.sh

**功能**：批量更新 cdn-config.js 中的 CDN URL

**使用方法**：
```bash
cd images
bash update_cdn_url.sh "https://你的CDN域名"
```

**示例**：
```bash
bash update_cdn_url.sh "https://wordgame-20250107.cos.ap-guangzhou.myqcloud.com"
```

---

## 💡 使用示例

### 在 JS 中使用

```javascript
const cdnConfig = require('../../images/cdn-config');

// 获取图片
const imgUrl = cdnConfig.getImageUrl('letters', 'a');

// 或直接访问
const imgUrl = cdnConfig.letters.a;
```

### 在 WXML 中使用

```xml
<image src="{{item.imageUrl}}" mode="aspectFit" />
```

详细示例见 [CDN_USAGE.md](./CDN_USAGE.md)

---

## 📊 上传统计

| 分类 | 文件数 | 大小 |
|------|--------|------|
| letters | 26 | ~500KB |
| animals | 16 | ~300KB |
| colors | 9 | ~232KB |
| body-people | 17 | ~184KB |
| numbers | 11 | ~108KB |
| objects | 9 | ~116KB |
| weather | 6 | ~84KB |
| food | 4 | ~48KB |
| actions | 2 | ~24KB |
| scenes | 3 | ~12KB |
| icons | 15 | ~132KB |
| **总计** | **118** | **~1.74MB** |

---

## ⚠️ 注意事项

### 存储桶权限

必须设置为 **公有读私有写**，否则小程序无法访问图片。

### CDN 加速

强烈建议开启 CDN 加速，否则图片加载速度会很慢。

### 缓存配置

在 CDN 控制台配置图片缓存规则：
- 文件类型：`.png`, `.jpg`, `.jpeg`
- 过期时间：365 天

### 备份

上传前建议先备份本地图片：
```bash
cp -r didida/images ~/images_backup
```

---

## 🔄 回滚方案

如果需要回退到本地图片：

1. 删除 CDN 引用
2. 恢复 require 语句

```javascript
// 从 CDN 改回本地
// const cdnConfig = require('../../images/cdn-config');
// const imgUrl = cdnConfig.letters.a;

// 改为
const imgUrl = require('../../images/letters/a.png');
```

---

## 📞 获取帮助

### 腾讯云文档

- [COS 产品文档](https://cloud.tencent.com/document/product/436)
- [CDN 产品文档](https://cloud.tencent.com/document/product/228)
- [coscli 使用指南](https://cloud.tencent.com/document/product/436/63144)

### 常见问题

见各文档的「常见问题」章节：
- [COS_UPLOAD_GUIDE.md](./COS_UPLOAD_GUIDE.md) - COS 上传常见问题
- [CDN_USAGE.md](./CDN_USAGE.md) - 代码使用常见问题

---

## ✅ 检查清单

上传完成后，检查以下项目：

- [ ] 所有图片已上传到 COS
- [ ] 可以在控制台查看图片
- [ ] 存储桶权限为公有读
- [ ] CDN 已开通并配置
- [ ] CDN 域名已更新到 cdn-config.js
- [ ] 小程序中图片可以正常显示
- [ ] 图片加载速度正常
- [ ] 已删除或保留本地图片备份

---

## 💰 费用参考

| 项目 | 价格 | 本项目预估 |
|------|------|------------|
| COS 存储 | ¥0.118/GB/月 | ¥0.01/月 |
| COS 请求 | ¥0.01/万次 | 视访问量 |
| CDN 流量 | ¥0.24/GB | ¥13/月 (假设1000用户/天) |

**总计预估**：约 ¥15-20/月（1000 DAU）

---

## 🎉 完成

上传完成后：

1. 在小程序中测试图片显示
2. 检查加载速度
3. 监控 CDN 流量使用情况
4. 定期清理不必要的文件

---

**最后更新**：2025-01-07
