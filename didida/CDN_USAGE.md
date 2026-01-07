# CDN 图片使用示例

## 快速开始

### 1. 开通云开发并上传图片

详细步骤见 [UPLOAD_GUIDE.md](./scripts/UPLOAD_GUIDE.md)

### 2. 更新 CDN 配置

```bash
cd /Users/dulin03/work/wtest/didida/images
bash update_cdn_url.sh "https://你的云域名.tcb.qcloud.la"
```

### 3. 在代码中使用

---

## JavaScript 使用示例

### 方法一：直接获取单个图片

```javascript
// 引入配置
const cdnConfig = require('../../images/cdn-config');

// 获取字母 A 的图片
const imgUrl = cdnConfig.getImageUrl('letters', 'a');

// 获取动物 dog 的图片
const dogUrl = cdnConfig.getImageUrl('animals', 'dog');
```

### 方法二：直接访问

```javascript
const cdnConfig = require('../../images/cdn-config');

// 直接访问
const letterA = cdnConfig.letters.a;
const colorRed = cdnConfig.colors.red;
const animalCat = cdnConfig.animals.cat;
```

### 方法三：批量生成图片列表

```javascript
const cdnConfig = require('../../images/cdn-config');

// 生成字母列表
const letters = 'abcdefghijklmnopqrstuvwxyz'.split('').map(letter => ({
  name: letter,
  url: cdnConfig.getImageUrl('letters', letter)
}));

// 生成动物列表
const animals = ['dog', 'cat', 'bird', 'fish'].map(name => ({
  name: name,
  url: cdnConfig.getImageUrl('animals', name)
}));
```

---

## Page 中使用示例

```javascript
// pages/mode1/mode1.js
const cdnConfig = require('../../images/cdn-config');

Page({
  data: {
    letters: [],
    currentImage: ''
  },

  onLoad() {
    // 生成字母图片列表
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('').map(letter => ({
      letter: letter,
      imageUrl: cdnConfig.letters[letter] // 或 cdnConfig.getImageUrl('letters', letter)
    }));

    this.setData({ letters });
  },

  selectLetter(e) {
    const { letter } = e.currentTarget.dataset;
    const imageUrl = cdnConfig.getImageUrl('letters', letter);
    this.setData({ currentImage: imageUrl });
  }
});
```

---

## WXML 使用示例

### 简单图片显示

```xml
<image src="{{imageUrl}}" mode="aspectFit" />
```

### 列表显示

```xml
<view wx:for="{{letters}}" wx:key="letter">
  <image src="{{item.imageUrl}}" mode="aspectFit" />
  <text>{{item.letter}}</text>
</view>
```

### 条件显示

```xml
<image 
  wx:if="{{showImage}}" 
  src="{{currentImage}}" 
  mode="aspectFit" 
  bindtap="handleImageTap"
/>
```

---

## 替换现有代码示例

### 原代码（本地图片）

```javascript
// 原代码
const imgA = require('../../images/letters/a.png');
const imgB = require('../../images/letters/b.png');
```

### 替换后（CDN）

```javascript
// 新代码
const cdnConfig = require('../../images/cdn-config');
const imgA = cdnConfig.letters.a;
const imgB = cdnConfig.letters.b;
```

---

## 游戏页面集成示例

### mode1（单词配对）

```javascript
const cdnConfig = require('../../images/cdn-config');

Page({
  data: {
    cards: [],
    selectedCards: []
  },

  onLoad() {
    this.generateCards();
  },

  generateCards() {
    const words = ['apple', 'banana', 'cat'];
    const cards = [];

    words.forEach(word => {
      // 图片卡
      cards.push({
        id: `${word}-img`,
        word: word,
        type: 'image',
        url: cdnConfig.getImageUrl('animals', word) || cdnConfig.getImageUrl('food', word),
        flipped: false
      });
      // 文字卡
      cards.push({
        id: `${word}-text`,
        word: word,
        type: 'text',
        text: word,
        flipped: false
      });
    });

    // 洗牌
    this.setData({ cards: this.shuffle(cards) });
  },

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
});
```

### game（找单词游戏）

```javascript
const cdnConfig = require('../../images/cdn-config');

Page({
  data: {
    options: [],

    foundWords: []
  },

  onLoad() {
    this.generateOptions();
  },

  generateOptions() {
    const words = ['apple', 'banana', 'orange'];
    const options = words.map(word => ({
      word: word,
      imageUrl: cdnConfig.getImageUrl('food', word)
    }));

    this.setData({ options });
  }
});
```

---

## 错误处理

### 图片加载失败处理

```javascript
Page({
  data: {
    imageUrl: '',
    imageError: false
  },

  onLoad() {
    const cdnConfig = require('../../images/cdn-config');
    this.setData({
      imageUrl: cdnConfig.letters.a
    });
  },

  onImageError(e) {
    console.error('图片加载失败', e);
    this.setData({ imageError: true });
    // 可以使用备用图片或显示占位符
  }
});
```

### CDN 配置未配置处理

```javascript
let cdnConfig = null;

try {
  cdnConfig = require('../../images/cdn-config');
} catch (e) {
  console.warn('CDN配置加载失败，使用本地图片');
  cdnConfig = {
    getImageUrl: (category, name) => {
      return `../../images/${category}/${name}.png`;
    }
  };
}
```

---

## 性能优化建议

1. **预加载关键图片**

```javascript
Page({
  onLoad() {
    // 预加载下一张图片
    const nextImageUrl = cdnConfig.letters.b;
    wx.getImageInfo({
      src: nextImageUrl,
      success: (res) => {
        console.log('预加载成功', res.path);
      }
    });
  }
});
```

2. **图片懒加载**

```xml
<image
  src="{{item.imageUrl}}"
  mode="aspectFit"
  lazy-load="{{true}}"
/>
```

3. **使用 webp 格式**（如支持）

在云存储中上传 webp 版本，修改配置使用 webp URL。

---

## 常见问题

### Q: 图片显示不出来？

1. 检查 CDN URL 是否正确配置
2. 检查图片是否已上传到云存储
3. 检查云存储权限（公有读）
4. 查看控制台错误信息

### Q: 可以混合使用本地图片和 CDN 吗？

可以。CDN 配置提供了 `getImageUrl` 方法，可以按需使用：

```javascript
const cdnConfig = require('../../images/cdn-config');
const localImg = require('../../images/placeholder.png');

// 关键图片用本地，其他用 CDN
const config = {
  logo: localImg,  // 本地
  letterA: cdnConfig.letters.a  // CDN
};
```

### Q: 如何回退到本地图片？

将代码中的 `cdnConfig` 调用改回 `require` 即可，或者注释掉 CDN 引用。

---

## 文件列表

- `images/cdn-config.js` - CDN 配置文件
- `images/update_cdn_url.sh` - 更新 URL 脚本
- `images/generate_upload_commands.sh` - 生成上传命令脚本
- `scripts/UPLOAD_GUIDE.md` - 详细上传指南
