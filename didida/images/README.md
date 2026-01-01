# Images Directory

图片资源目录,按类型分类存放。

## 目录结构

```
images/
├── colors/          # 颜色类图片
├── animals/         # 动物类图片
├── body-people/     # 身体/人物类图片
├── numbers/         # 数字类图片
├── letters/         # 字母类图片
├── weather/         # 天气类图片
├── icons/           # 图标类图片
├── food/            # 食物类图片
├── actions/         # 动作类图片
├── objects/         # 物品类图片
├── image-config.js  # 图片配置文件
└── README.md        # 本说明文档
```

## 图片分类说明

### colors/ (颜色类)
- 🔴 red.png
- 🔵 blue.png
- 🟢 green.png
- 🟡 yellow.png
- 🩷 pink.png
- 🟣 purple.png
- 🟠 orange.png

### animals/ (动物类)
- 🐱 cat.png
- 🐕 dog.png
- 🐦 bird.png
- 🐻 bear.png
- 🐟 fish.png
- 🐘 elephant.png
- 🦁 lion.png
- 🐵 monkey.png
- 🐼 panda.png
- 🐯 tiger.png
- 🐰 rabbit.png
- 🐜 ant.png
- 🦆 duck.png
- 🐭 mouse.png
- 🐷 pig.png
- 🦘 kangaroo.png

### body-people/ (身体/人物类)
- 👁️ eye.png
- 👂 ear.png
- 👃 nose.png
- 👄 mouth.png
- ✋ hand.png
- 🦶 foot.png
- 🗣️ speaking.png
- 🏃 running.png
- 🚶 walking.png
- 💃 dancing.png
- 👏 clapping.png
- 🎤 singing.png
- 👨 man.png
- 👩 woman.png
- 👧 girl.png
- 👋 waving.png
- 🧍 standing.png

### numbers/ (数字类)
- 0️⃣ zero.png
- 1️⃣ one.png
- 2️⃣ two.png
- 3️⃣ three.png
- 4️⃣ four.png
- 5️⃣ five.png
- 6️⃣ six.png
- 7️⃣ seven.png
- 8️⃣ eight.png
- 9️⃣ nine.png
- 🔟 ten.png

### letters/ (字母类)
- 🅰️ a.png
- 🅱️ b.png
- ©️ c.png
- 🌙 d.png
- 📧 e.png
- 🏳️ f.png
- 🎸 g.png
- ♓ h.png
- ℹ️ i.png
- 🎷 j.png
- 🎋 k.png
- Ⓜ️ l.png
- 🔨 m.png
- 🔯 n.png
- ⭕ o.png
- 🅿️ p.png
- 🎯 q.png
- ®️ r.png
- 💲 s.png
- ✝️ t.png
- ⛎ u.png
- ✌️ v.png
- 〰️ w.png
- ❌ x.png
- 💴 y.png
- 💤 z.png

### weather/ (天气类)
- ☀️ sun.png
- 🌙 moon.png
- 🌅 sunrise.png
- ☁️ cloud.png
- 🌧️ rain.png
- ⭐ star.png

### icons/ (图标类)
- 🔊 speaker.png
- 🔈 speaker-low.png
- 🔉 speaker-mid.png
- 📢 megaphone.png
- ✅ check.png
- 👉 arrow-right.png
- 🔄 refresh.png
- 👍 thumb-up.png
- 🏆 trophy.png
- 🎉 party.png
- 🤲 open-hands.png
- 🤔 thinking.png
- 🤝 handshake.png
- 🙏 pray.png
- 😊 smile.png
- 😴 sleeping.png

### food/ (食物类)
- 🍎 apple.png
- 🍌 banana.png
- 🎂 cake.png

### actions/ (动作类)
- 📝 writing.png
- 🎤 singing.png

### objects/ (物品类)
- 📚 books.png
- 🪑 chair.png
- 🖊️ pen.png
- ✏️ pencil.png
- 🏠 house.png
- 👒 hat.png
- 🌸 flower.png
- 📅 calendar.png
- 🇺 question.png

## 图片规范

- **格式**: PNG (推荐) 或 JPG
- **尺寸**: 建议 512x512px
- **背景**: 透明背景或白色背景
- **质量**: 高清,清晰可辨

## 使用方式

### 1. 使用在线图片(默认)
目前默认使用在线图片,无需下载本地图片。代码会自动从 `image-config.js` 中的 `ONLINE_IMAGE_MAP` 获取在线图片URL。

### 2. 使用本地图片

当您准备好本地图片后:

1. 将图片文件放到对应的分类目录下
2. 确保文件名与 `image-config.js` 中配置的名称一致
3. 在代码中将 `getImageUrl(emoji, false)` 改为 `getImageUrl(emoji, true)`

示例:
```javascript
// mode1.js
getImageUrl(emoji) {
  const { getImageUrl: configGetImageUrl } = require('../../images/image-config.js')
  // 改为 true 使用本地图片
  return configGetImageUrl(emoji, true)
}
```

## 配置文件

`image-config.js` 包含:
- `IMAGE_CONFIG`: 本地图片路径配置
- `ONLINE_IMAGE_MAP`: 在线图片备用配置
- `getImageUrl(emoji, useLocal)`: 获取图片URL的函数

## 添加新图片

如需添加新的图片:

1. 将图片文件放到对应的分类目录
2. 在 `image-config.js` 的对应分类中添加配置
3. 如需在线备用,也在 `ONLINE_IMAGE_MAP` 中添加

示例:
```javascript
// image-config.js
const IMAGE_CONFIG = {
  colors: {
    '🟤': 'colors/brown.png',  // 新增
  },
}

const ONLINE_IMAGE_MAP = {
  '🟤': 'https://cdn-icons-png.flaticon.com/512/702/702850.png',
}
```

## 注意事项

1. **文件命名**: 使用小写字母和连字符,如 `cat.png`, `speaker-mid.png`
2. **路径引用**: 代码中使用 `/images/分类/文件名.png` 格式
3. **备份机制**: 当本地图片不存在时,会自动使用在线图片
4. **大小限制**: 单张图片建议不超过 100KB
5. **数量控制**: 总图片数量建议控制在合理范围内

## TabBar 图标

底部导航栏图标(如果启用):

- tab-study.png (学习 - 未选中)
- tab-study-active.png (学习 - 选中)
- tab-wordlist.png (词汇 - 未选中)
- tab-wordlist-active.png (词汇 - 选中)
- tab-profile.png (我的 - 未选中)
- tab-profile-active.png (我的 - 选中)

尺寸: 81x81px
