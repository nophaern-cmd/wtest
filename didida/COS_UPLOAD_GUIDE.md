# 腾讯云 COS 上传指南

本指南介绍如何将图片上传到腾讯云对象存储（COS）并启用 CDN 加速。

---

## 方法一：使用 coscli 工具（推荐）

### 1. 安装 coscli

```bash
# macOS
brew install coscli

# Linux
wget https://github.com/tencentyun/coscli/releases/download/v0.21.0/coscli-linux
chmod +x coscli-linux
sudo mv coscli-linux /usr/local/bin/coscli

# Windows
# 下载: https://github.com/tencentyun/coscli/releases
```

### 2. 配置 coscli

```bash
coscli config
```

按提示输入以下信息：

| 配置项 | 说明 | 示例 |
|--------|------|------|
| SecretID | 腾讯云 API 密钥 ID | AKIDxxxxxxxxxx |
| SecretKey | 腾讯云 API 密钥 | xxxxxxxxxxxxxxxx |
| Bucket | 存储桶名称 | wordgame-1234567890 |
| Region | 区域 | ap-guangzhou |

#### 获取 SecretID 和 SecretKey

1. 访问 [腾讯云 API 密钥管理](https://console.cloud.tencent.com/cam/capi)
2. 点击「新建密钥」或查看现有密钥
3. 复制 SecretId 和 SecretKey

#### 创建存储桶

1. 访问 [腾讯云 COS 控制台](https://console.cloud.tencent.com/cos/bucket)
2. 点击「创建存储桶」
3. 配置：
   - 名称：`wordgame-日期`（如：wordgame-20250107）
   - 所属地域：选择离你最近的区域（如：广州 ap-guangzhou）
   - 访问权限：**公有读私有写**（重要！）
   - 其他：保持默认

### 3. 修改上传脚本配置

编辑 `didida/images/upload_to_cdn.sh`，修改存储桶配置：

```bash
# 修改前
BUCKET="cos://你的存储桶名称/你的区域"

# 修改后（示例）
BUCKET="cos://wordgame-20250107/ap-guangzhou"
```

### 4. 执行上传

```bash
cd /Users/dulin03/work/wtest/didida/images
bash upload_to_cdn.sh
```

上传完成后会显示统计信息。

---

## 方法二：使用 Python SDK

### 1. 安装依赖

```bash
pip install cos-python-sdk-v5
```

### 2. 编辑配置

编辑 `didida/scripts/upload_to_cos.py`，修改以下配置：

```python
# 修改前
SECRET_ID = '你的SecretID'
SECRET_KEY = '你的SecretKey'
REGION = 'ap-guangzhou'
BUCKET = '你的存储桶名称'

# 修改后（示例）
SECRET_ID = 'AKIDxxxxxxxxxxxxxxxxxxxxxxx'
SECRET_KEY = 'xxxxxxxxxxxxxxxxxxxxxxxxxx'
REGION = 'ap-guangzhou'
BUCKET = 'wordgame-20250107-1234567890'
```

### 3. 执行上传

```bash
cd /Users/dulin03/work/wtest/didida/scripts
python3 upload_to_cos.py
```

---

## 方法三：使用云开发（最简单）

如果你已经开通了微信云开发，可以直接使用云存储：

1. 打开微信开发者工具
2. 点击「云开发」→「存储」
3. 创建 `images/` 目录结构
4. 拖拽上传图片文件夹

---

## 开启 CDN 加速

### 1. 开通 CDN

1. 访问 [腾讯云 CDN 控制台](https://console.cloud.tencent.com/cdn)
2. 点击「添加域名」
3. 配置：
   - 源站类型：COS 源
   - 源站地址：选择你的 COS 存储桶
   - 加速域名：自定义（如：img.yourdomain.com）或使用默认域名

### 2. 获取 CDN 域名

COS 存储桶默认会分配一个 CDN 域名，格式：

```
https://your-bucket-name.cos.ap-guangzhou.myqcloud.com
```

或自定义域名：
```
https://img.yourdomain.com
```

### 3. 配置缓存规则

在 CDN 控制台配置：
- 文件类型：`.png`, `.jpg`, `.jpeg`
- 过期时间：365 天
- 节点缓存：遵循源站

---

## 更新 CDN 配置

### 1. 获取 CDN 域名

从 COS 控制台或 CDN 控制台获取你的 CDN 域名。

### 2. 更新配置文件

```bash
cd /Users/dulin03/work/wtest/didida/images
bash update_cdn_url.sh "https://你的CDN域名"
```

例如：
```bash
bash update_cdn_url.sh "https://wordgame-20250107.cos.ap-guangzhou.myqcloud.com"
```

### 3. 手动验证

打开 `didida/images/cdn-config.js`，确认 URL 已正确更新：

```javascript
// 应该看到你的实际域名
baseUrl: 'https://wordgame-20250107.cos.ap-guangzhou.myqcloud.com',
```

---

## 在代码中使用

```javascript
// 引入 CDN 配置
const cdnConfig = require('../../images/cdn-config');

// 使用图片
const imgUrl = cdnConfig.getImageUrl('letters', 'a');
// 或
const imgUrl = cdnConfig.letters.a;
```

详细使用示例见 `CDN_USAGE.md`

---

## 验证上传

### 方法一：控制台查看

1. 访问 [COS 控制台](https://console.cloud.tencent.com/cos/bucket)
2. 进入你的存储桶
3. 查看 `images/` 目录

### 方法二：命令行查看

```bash
coscli ls cos://your-bucket/your-region/images/
```

### 方法三：访问 CDN URL

在浏览器中访问任一图片 URL，确认可以正常显示。

---

## 常见问题

### Q: coscli 上传失败

**原因分析：**
- 密钥配置错误
- 存储桶权限不足
- 网络问题

**解决方案：**
```bash
# 重新配置
coscli config

# 测试连接
coscli ls cos://your-bucket/your-region/
```

### Q: Python SDK 上报错误

**常见错误：**
```
AuthFailure: SignatureDoesNotMatch
```

**解决方案：**
- 检查 SECRET_ID 和 SECRET_KEY 是否正确
- 确认密钥未过期
- 确认密钥有访问该存储桶的权限

### Q: 图片在浏览器中显示 403

**原因：**
- 存储桶权限不是公有读
- CDN 缓存规则配置错误

**解决方案：**
1. 在 COS 控制台将存储桶权限改为「公有读私有写」
2. 在 CDN 控制台刷新缓存

### Q: 图片加载慢

**优化方案：**
1. 开启 CDN 加速（必须）
2. 使用 WebP 格式（减小文件大小）
3. 启用 Gzip 压缩
4. 配置适当的缓存时间

### Q: 如何删除已上传的图片

```bash
# 删除单个文件
coscli rm cos://your-bucket/your-region/images/letters/a.png

# 删除整个目录
coscli rm -r cos://your-bucket/your-region/images/letters/
```

---

## 费用说明

### COS 存储费用

| 资源类型 | 价格 | 说明 |
|----------|------|------|
| 存储空间 | ¥0.118/GB/月 | 华南区域 |
| 请求次数 | ¥0.01/万次 | GET 请求 |
| 流量费用 | ¥0.5/GB | 外网下行流量 |

### CDN 费用

| 资源类型 | 价格 | 说明 |
|----------|------|------|
| 流量费用 | ¥0.24/GB | 中国大陆 |
| 带宽费用 | ¥60/Mbps/月 | 峰值带宽 |

**估算：**
- 118 张图片约 1.8MB
- 存储：约 ¥0.01/月
- 假设 1000 用户每天加载一次图片：
  - 流量：1.8MB × 1000 = 1.8GB/天 = 54GB/月
  - CDN 费用：约 ¥13/月

---

## 相关链接

- [腾讯云 COS 文档](https://cloud.tencent.com/document/product/436)
- [coscli 工具文档](https://cloud.tencent.com/document/product/436/63144)
- [COS Python SDK](https://cloud.tencent.com/document/product/436/31815)
- [CDN 控制台](https://console.cloud.tencent.com/cdn)
- [CDN 控制台](https://console.cloud.tencent.com/cos)
