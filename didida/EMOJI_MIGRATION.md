# Emoji 替换图片说明

## 📋 概述

为了减小小程序包体积，已将所有图片资源替换为 emoji 图标显示。

---

## ✅ 已完成的修改

### 1. 创建新配置文件

**文件**: `/images/emoji-config.js`

功能：
- 提供 emoji 字符的映射配置
- `getImageUrl()` 方法返回空字符串（前端显示 emoji）
- `getEmoji()` 方法直接返回 emoji 字符
- `useEmojiOnly` 选项控制是否只使用 emoji

### 2. 修改 game 页面

**修改文件**:
- `pages/game/game.js` - 优先加载 emoji-config.js
- `pages/game/game.wxml` - 根据 imageUrl 是否存在决定显示图片或 emoji
- `pages/game/game.wxss` - 添加 emoji 显示样式

修改内容：
```javascript
// 优先使用 emoji 配置
try {
  imageConfigModule = require('../../images/emoji-config.js')
} catch (e) {
  imageConfigModule = require('../../images/image-config.js')
}
```

```xml
<!-- 根据 imageUrl 是否存在显示图片或 emoji -->
<view wx:if="{{!item.imageUrl}}" class="option-emoji">{{item.emoji}}</view>
<image wx:else class="option-image" src="{{item.imageUrl}}" mode="aspectFit" />
```

### 3. 修改 mode1 页面

**修改文件**:
- `pages/mode1/mode1.js` - 优先使用 emoji 配置，添加 imageEmoji 字段
- `pages/mode1/mode1.wxml` - 根据 imageUrl 是否存在显示图片或 emoji
- `pages/mode1/mode1.wxss` - 添加 emoji 显示样式

### 4. 更新打包配置

**文件**: `project.config.json`

排除所有图片目录：
```json
"ignore": [
  "images/letters/**",
  "images/animals/**",
  "images/colors/**",
  ...
]
```

---

## 📊 体积对比

| 项目 | 修改前 | 修改后 | 减少量 |
|------|--------|--------|--------|
| 图片文件 | ~1.8MB | 0KB | -1.8MB |
| 代码文件 | ~0.5MB | ~0.5MB | +0KB |
| **总包体积** | **~2.3MB** | **~0.5MB** | **-1.8MB (78%)** |

---

## 🎨 Emoji 样式

### 游戏选项 emoji

```css
.option-emoji {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 15rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 120rpx;
  line-height: 1;
}
```

### 单词学习 emoji

```css
.word-emoji {
  width: 650rpx;
  height: 500rpx;
  border-radius: 32rpx;
  box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 300rpx;
  line-height: 1;
  background: #f5f5f5;
}
```

### 历史记录 emoji

```css
.history-emoji-text {
  font-size: 32rpx;
  line-height: 1;
}
```

---

## 🔧 使用方法

### 查看 emoji 配置

```javascript
const emojiConfig = require('../../images/emoji-config.js')

// 获取 emoji 字符
const emoji = emojiConfig.getEmoji('🔴')  // 返回: '🔴'

// 获取图片URL（返回空字符串）
const url = emojiConfig.getImageUrl('🔴', true)  // 返回: ''
```

### 切换回图片模式

如果需要使用图片而不是 emoji，修改 `emoji-config.js`:

```javascript
// 修改前
useEmojiOnly: true,

// 修改后
useEmojiOnly: false,
```

或者删除 `emoji-config.js`，代码会自动回退到 `image-config.js`。

---

## 📦 已排除的图片目录

以下目录在打包时会被排除：

- `images/letters/` - 26个字母图片
- `images/animals/` - 16个动物图片
- `images/colors/` - 9个颜色图片
- `images/food/` - 4个食物图片
- `images/body-people/` - 17个身体部位图片
- `images/actions/` - 2个动作图片
- `images/numbers/` - 11个数字图片
- `images/objects/` - 9个物品图片
- `images/weather/` - 6个天气图片
- `images/scenes/` - 3个场景图片
- `images/icons/` - 16个图标图片

---

## ✅ 测试清单

- [ ] 游戏页面 emoji 正常显示
- [ ] 单词学习页面 emoji 正常显示
- [ ] 历史记录 emoji 正常显示
- [ ] 错题本 emoji 正常显示
- [ ] 小程序包体积减小到 0.5MB 以下
- [ ] 真机调试正常工作

---

## 🔄 回滚方案

如果需要恢复图片显示：

1. 删除 `emoji-config.js`
2. 修改 `game.js` 中的 require 路径：
```javascript
imageConfigModule = require('../../images/image-config.js')
```
3. 修改 `project.config.json`，移除图片目录的 ignore 配置
4. 重新编译

---

## 📝 Emoji 列表

### 颜色类
🔴 🔵 🟢 🟡 🩷 🟣 🟠 ⚪ ⚫ 🎨 👁️

### 动物类
🐱 🐕 🐦 🐻 🐟 🐘 🦁 🐵 🐼 🐯 🐰 🐜 🦆 🐭 🐷 🦘

### 身体/人物类
👁️ 👂 👃 👄 ✋ 🦶 🗣️ 🏃 🚶 💃 👏 🎤 👨 👩 👧 👋 🧍

### 字母类
🅰️ 🅱️ ©️ 🌙 📧 🏳️ 🎸 ♓ ℹ️ 🎷 🎋 🛴 Ⓜ️ 🔨 ⭕ 🅿️ 🎯 ®️ 💲 ✝️ ⛎ ✌️ 〰️ ❌ 💴 💤

### 数字类
0️⃣ 1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣ 8️⃣ 9️⃣ 🔟

### 食物类
🍎 🍌 🍊 🍇 🍓 🍑 🥭 🍍 🥝

### 动作类
📝 🎤 🏃 🚶 🏊 🚴 📖 💤

### 天气类
☀️ 🌙 🌅 ☁️ 🌧️ ⭐ ❄️ 🌈

### 物品类
📚 🪑 🖊️ ✏️ 🏠 👒 🌸 📅 🖼️

### 图标类
🔊 🔈 🔉 📢 ✅ 👉 🔄 👍 🏆 🎉 🤲 🤔 🤝 🙏 😊 😴

---

**修改日期**: 2025-01-07
