# 图片上传到CDN（云存储）说明

## 📌 步骤一：开通云开发

### 方法 A：使用微信云开发（推荐）

1. **开通云开发**
   - 在微信开发者工具中，点击顶部菜单「云开发」→「开通」
   - 选择基础版（免费额度：存储5GB，CDN流量5GB/月）
   - 创建环境，记录环境ID（如：word-game-xxx）

2. **获取云存储域名**
   - 进入云开发控制台 → 存储 → 文件列表
   - 域名格式：`https://环境ID-xxxx.tcb.qcloud.la`
   - 示例：`https://word-game-abc123.tcb.qcloud.la`

### 方法 B：使用腾讯云 COS

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/cos)
2. 创建存储桶（选择公有读私有写）
3. 开启 CDN 加速
4. 获取 CDN 域名

---

## 📌 步骤二：批量上传图片

### 方法 A：微信开发者工具手动上传（简单）

1. 在开发者工具中打开「云开发」控制台
2. 点击「存储」→「新建文件夹」创建目录结构：
   ```
   images/
   ├── letters/
   ├── animals/
   ├── colors/
   ├── food/
   ├── body-people/
   ├── actions/
   ├── numbers/
   ├── objects/
   ├── weather/
   ├── scenes/
   └── icons/
   ```

3. 将 `didida/images/` 下的图片文件夹拖入对应目录

### 方法 B：使用云函数批量上传（推荐）

创建云函数 `upload-images`：

```javascript
// cloudfunctions/upload-images/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const fs = require('fs')
const path = require('path')

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const file = event.file
  
  try {
    const result = await cloud.uploadFile({
      cloudPath: file.cloudPath,
      fileContent: fs.readFileSync(file.filePath)
    })
    return {
      success: true,
      fileID: result.fileID
    }
  } catch (err) {
    return {
      success: false,
      error: err
    }
  }
}
```

### 方法 C：使用 CLI 工具（批量）

安装并使用 [coscli](https://cloud.tencent.com/document/product/436/63144)：

```bash
# macOS 安装
brew install coscli

# 配置
coscli config

# 批量上传
coscli cp -r didida/images/ cos://your-bucket/images/
```

---

## 📌 步骤三：更新配置文件

编辑 `didida/images/cdn-config.js`，将 `baseUrl` 替换为实际域名：

```javascript
// 替换前
baseUrl: 'https://YOUR_CLOUD_ENV-xxx.tcb.qcloud.la/images',

// 替换后（示例）
baseUrl: 'https://word-game-abc123.tcb.qcloud.la/images',
```

同时需要批量替换所有图片URL中的域名。使用脚本：

```bash
cd /Users/dulin03/work/wtest/didida/images
sed -i '' 's|https://YOUR_CLOUD_ENV-xxx.tcb.qcloud.la|https://你的实际域名|g' cdn-config.js
```

---

## 📌 步骤四：更新代码引用

### 在 JS 文件中使用

```javascript
// 引入 CDN 配置
const cdnConfig = require('../../images/cdn-config');

// 获取图片 URL
const imgUrl = cdnConfig.getImageUrl('letters', 'a');
// 或直接访问
const imgUrl2 = cdnConfig.letters.a;
```

### 在 WXML 中使用

```javascript
// 在 Page 中定义
Page({
  data: {
    letterImages: [
      { name: 'a', url: require('../../images/cdn-config').getImageUrl('letters', 'a') },
      { name: 'b', url: require('../../images/cdn-config').getImageUrl('letters', 'b') }
    ]
  }
});
```

```xml
<!-- 在 WXML 中 -->
<image src="{{item.url}}" mode="aspectFit" />
```

---

## 📌 步骤五：清理本地图片（可选）

上传并测试通过后，可以从项目中删除本地图片目录以减小包体积：

```bash
# 删除本地图片（备份到其他位置）
mv /Users/dulin03/work/wtest/didida/images ~/images_backup

# 或只保留配置文件
cd /Users/dulin03/work/wtest/didida/images
rm -rf letters animals colors food body-people actions numbers objects weather scenes
```

更新 `project.config.json`：

```json
{
  "packOptions": {
    "ignore": [
      "venv/**",
      "images/letters/**",
      "images/animals/**",
      "images/colors/**",
      "images/food/**",
      "images/body-people/**",
      "images/actions/**",
      "images/numbers/**",
      "images/objects/**",
      "images/weather/**",
      "images/scenes/**",
      "images/icons/**"
    ]
  }
}
```

---

## 📊 预期效果

| 项目 | 原大小 | CDN后 |
|------|--------|-------|
| 主包大小 | ~2.3MB | ~0.5MB |
| 图片加载 | 本地 | CDN（更快） |
| 冷启动速度 | 慢 | 快 |

---

## ⚠️ 注意事项

1. **云存储免费额度**
   - 基础版：存储5GB，流量5GB/月
   - 超出后按量计费（存储¥0.004/GB/天，流量¥0.5/GB）
   
2. **CDN 配置**
   - 确保云存储开启了 CDN 加速
   - 配置合理的缓存策略（图片缓存1年）

3. **备用方案**
   - 如果云服务不稳定，可保留少量核心图片在本地
   - 使用 `try-catch` 处理加载失败

4. **测试**
   - 上传后先在开发者工具中测试
   - 真机调试确认图片正常显示
