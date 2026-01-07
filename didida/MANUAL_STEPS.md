# 手动执行步骤

请按以下步骤手动操作：

---

## 步骤 1：安装 coscli

在终端执行：

```bash
brew install coscli
```

等待安装完成。

---

## 步骤 2：获取腾讯云密钥

1. 访问：https://console.cloud.tencent.com/cam/capi
2. 点击「新建密钥」
3. 复制 `SecretId` 和 `SecretKey`，保存到安全位置

---

## 步骤 3：创建 COS 存储桶

1. 访问：https://console.cloud.tencent.com/cos/bucket
2. 点击「创建存储桶」
3. 填写配置：
   - **名称**：`wordgame-20250107`（或你喜欢的名称）
   - **所属地域**：选择离你最近的区域
     - 广州：ap-guangzhou
     - 上海：ap-shanghai
     - 北京：ap-beijing
   - **访问权限**：选择「公有读私有写」（重要！）
   - 其他选项保持默认
4. 点击「创建」
5. 记录存储桶名称和区域

---

## 步骤 4：配置 coscli

在终端执行：

```bash
coscli config
```

按提示输入：

- **SecretID**：粘贴步骤 2 中获取的 SecretId
- **SecretKey**：粘贴步骤 2 中获取的 SecretKey
- **Bucket**：输入存储桶名称（如：wordgame-20250107-1234567890）
- **Region**：输入区域（如：ap-guangzhou）

---

## 步骤 5：验证配置

在终端执行：

```bash
cd /Users/dulin03/work/wtest/didida/scripts
bash quick_setup.sh
```

这个脚本会：
- 检查 coscli 是否安装成功
- 检查配置文件是否存在
- 测试 COS 连接

---

## 步骤 6：上传图片

在终端执行：

```bash
cd /Users/dulin03/work/wtest/didida/images
bash upload_to_cdn.sh
```

脚本会自动上传所有 118 张图片，并显示进度。

---

## 步骤 7：获取 CDN 域名

1. 访问：https://console.cloud.tencent.com/cos/bucket
2. 点击进入你的存储桶
3. 查看「域名信息」
4. 复制 CDN 域名

格式示例：
```
https://wordgame-20250107-1234567890.cos.ap-guangzhou.myqcloud.com
```

---

## 步骤 8：更新 CDN 配置

在终端执行：

```bash
cd /Users/dulin03/work/wtest/didida/images
bash update_cdn_url.sh "https://你的CDN域名"
```

例如：
```bash
bash update_cdn_url.sh "https://wordgame-20250107-1234567890.cos.ap-guangzhou.myqcloud.com"
```

---

## 步骤 9：验证

检查配置文件是否已更新：

```bash
cat images/cdn-config.js | head -20
```

应该看到你的实际 CDN 域名，而不是占位符。

---

## 完成！

上传完成后的检查清单：

- [ ] coscli 已安装
- [ ] 密钥已配置
- [ ] 存储桶已创建
- [ ] 118 张图片已上传
- [ ] CDN 域名已获取
- [ ] cdn-config.js 已更新
- [ ] 小程序中图片可以正常显示

---

## 在小程序中使用

### JS 中使用

```javascript
const cdnConfig = require('../../images/cdn-config');

// 获取图片
const imgUrl = cdnConfig.getImageUrl('letters', 'a');
```

详细使用示例见：`CDN_USAGE.md`

---

## 常见问题

### coscli 命令未找到

```bash
# 重新安装
brew install coscli

# 或检查安装路径
which coscli
```

### 配置文件不存在

```bash
# 重新配置
coscli config
```

### 连接失败

检查：
- 存储桶名称和区域是否正确
- 密钥是否有访问权限
- 网络连接是否正常

### 图片不显示

检查：
- CDN 域名是否正确
- 存储桶权限是否为"公有读私有写"
- cdn-config.js 是否已更新

---

## 文档

- 快速参考：`QUICK_REFERENCE.md`
- 上传指南：`COS_UPLOAD_GUIDE.md`
- 代码示例：`CDN_USAGE.md`<tool_call>read_file<arg_key>filePath</arg_key><arg_value>/Users/dulin03/work/wtest/didida/images/upload_to_cdn.sh