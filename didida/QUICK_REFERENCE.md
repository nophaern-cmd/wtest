# 快速参考卡片

## 📋 推荐方案完整流程

### 第1步：安装工具

```bash
brew install coscli
```

### 第2步：获取密钥

访问：https://console.cloud.tencent.com/cam/capi

### 第3步：创建存储桶

访问：https://console.cloud.tencent.com/cos/bucket

- 名称：`wordgame-20250107`
- 地域：`ap-guangzhou`
- 权限：**公有读私有写**

### 第4步：配置 coscli

```bash
coscli config
```

输入：
- SecretID
- SecretKey
- Bucket
- Region

### 第5步：执行完整流程

```bash
cd /Users/dulin03/work/wtest/didida
bash setup_and_upload.sh
```

---

## ⚡ 一键快速执行

如果已经完成上述步骤 1-4，直接运行：

```bash
cd /Users/dulin03/work/wtest/didida/scripts
bash quick_setup.sh          # 环境检查和配置
cd ../images
bash upload_to_cdn.sh        # 上传图片
bash update_cdn_url.sh "https://你的CDN域名"  # 更新配置
```

---

## 🔧 手动配置（可选）

如果脚本无法自动配置，手动编辑：

编辑 `/Users/dulin03/work/wtest/didida/images/upload_to_cdn.sh`：

```bash
# 修改这一行
BUCKET="cos://你的存储桶名称/你的区域"

# 例如：
BUCKET="cos://wordgame-20250107-1234567890/ap-guangzhou"
```

---

## 📖 详细文档

- **完整流程**：运行 `bash setup_and_upload.sh`
- **上传指南**：`COS_UPLOAD_GUIDE.md`
- **使用示例**：`CDN_USAGE.md`
- **总览**：`UPLOAD_README.md`

---

## ✅ 检查清单

- [ ] 已安装 coscli
- [ ] 已创建 COS 存储桶
- [ ] 已配置 coscli 密钥
- [ ] 已上传 118 张图片
- [ ] 已获取 CDN 域名
- [ ] 已更新 cdn-config.js
- [ ] 小程序中图片正常显示

---

## 🆘 常见问题

### coscli 未安装

```bash
brew install coscli
```

### 连接失败

检查：
- 存储桶是否存在
- 密钥是否正确
- 权限是否为"公有读私有写"

### 图片不显示

检查：
- CDN 域名是否正确
- cdn-config.js 是否已更新
- 存储桶权限是否为公有读

---

**快速开始**：`bash setup_and_upload.sh`
