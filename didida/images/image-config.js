// 图片配置文件 - emoji 到本地图片路径的映射
// 图片应放在对应的分类目录下
// 建议图片尺寸: 512x512px, PNG格式
// 可以根据需要替换为本地图片或继续使用在线图片

const IMAGE_CONFIG = {
  // 颜色类 - images/colors/
  colors: {
    '🔴': 'colors/red.png',
    '🔵': 'colors/blue.png',
    '🟢': 'colors/green.png',
    '🟡': 'colors/yellow.png',
    '🩷': 'colors/pink.png',
    '🟣': 'colors/purple.png',
    '🟠': 'colors/orange.png',
  },

  // 动物类 - images/animals/
  animals: {
    '🐱': 'animals/cat.png',
    '🐕': 'animals/dog.png',
    '🐦': 'animals/bird.png',
    '🐻': 'animals/bear.png',
    '🐟': 'animals/fish.png',
    '🐘': 'animals/elephant.png',
    '🦁': 'animals/lion.png',
    '🐵': 'animals/monkey.png',
    '🐼': 'animals/panda.png',
    '🐯': 'animals/tiger.png',
    '🐰': 'animals/rabbit.png',
    '🐜': 'animals/ant.png',
    '🦆': 'animals/duck.png',
    '🐭': 'animals/mouse.png',
    '🐷': 'animals/pig.png',
    '🦘': 'animals/kangaroo.png',
  },

  // 身体/人物类 - images/body-people/
  bodyPeople: {
    '👁️': 'body-people/eye.png',
    '👂': 'body-people/ear.png',
    '👃': 'body-people/nose.png',
    '👄': 'body-people/mouth.png',
    '✋': 'body-people/hand.png',
    '🦶': 'body-people/foot.png',
    '🗣️': 'body-people/speaking.png',
    '🏃': 'body-people/running.png',
    '🚶': 'body-people/walking.png',
    '💃': 'body-people/dancing.png',
    '👏': 'body-people/clapping.png',
    '🎤': 'body-people/singing.png',
    '👨': 'body-people/man.png',
    '👩': 'body-people/woman.png',
    '👧': 'body-people/girl.png',
    '👋': 'body-people/waving.png',
    '🧍': 'body-people/standing.png',
  },

  // 数字类 - images/numbers/
  numbers: {
    '0️⃣': 'numbers/zero.png',
    '1️⃣': 'numbers/one.png',
    '2️⃣': 'numbers/two.png',
    '3️⃣': 'numbers/three.png',
    '4️⃣': 'numbers/four.png',
    '5️⃣': 'numbers/five.png',
    '6️⃣': 'numbers/six.png',
    '7️⃣': 'numbers/seven.png',
    '8️⃣': 'numbers/eight.png',
    '9️⃣': 'numbers/nine.png',
    '🔟': 'numbers/ten.png',
  },

  // 字母类 - images/letters/
  letters: {
    '🅰️': 'letters/a.png',
    '🅱️': 'letters/b.png',
    '©️': 'letters/c.png',
    '🌙': 'letters/d.png',
    '📧': 'letters/e.png',
    '🏳️': 'letters/f.png',
    '🎸': 'letters/g.png',
    '♓': 'letters/h.png',
    'ℹ️': 'letters/i.png',
    '🎷': 'letters/j.png',
    '🎋': 'letters/k.png',
    '🛴': 'letters/l.png',
    'Ⓜ️': 'letters/m.png',
    '🔨': 'letters/n.png',
    '⭕': 'letters/o.png',
    '🅿️': 'letters/p.png',
    '🎯': 'letters/q.png',
    '®️': 'letters/r.png',
    '💲': 'letters/s.png',
    '✝️': 'letters/t.png',
    '⛎': 'letters/u.png',
    '✌️': 'letters/v.png',
    '〰️': 'letters/w.png',
    '❌': 'letters/x.png',
    '💴': 'letters/y.png',
    '💤': 'letters/z.png',
  },

  // 天气类 - images/weather/
  weather: {
    '☀️': 'weather/sun.png',
    '🌙': 'weather/moon.png',
    '🌅': 'weather/sunrise.png',
    '☁️': 'weather/cloud.png',
    '🌧️': 'weather/rain.png',
    '⭐': 'weather/star.png',
  },

  // 图标类 - images/icons/
  icons: {
    '🔊': 'icons/speaker.png',
    '🔈': 'icons/speaker-low.png',
    '🔉': 'icons/speaker-mid.png',
    '📢': 'icons/megaphone.png',
    '✅': 'icons/check.png',
    '👉': 'icons/arrow-right.png',
    '🔄': 'icons/refresh.png',
    '👍': 'icons/thumb-up.png',
    '🏆': 'icons/trophy.png',
    '🎉': 'icons/party.png',
    '🤲': 'icons/open-hands.png',
    '🤔': 'icons/thinking.png',
    '🤝': 'icons/handshake.png',
    '🙏': 'icons/pray.png',
    '😊': 'icons/smile.png',
    '😴': 'icons/sleeping.png',
  },

  // 食物类 - images/food/
  food: {
    '🍎': 'food/apple.png',
    '🍌': 'food/banana.png',
    '🎂': 'food/cake.png',
  },

  // 动作类 - images/actions/
  actions: {
    '📝': 'actions/writing.png',
    '🎤': 'actions/singing.png',
  },

  // 物品类 - images/objects/
  objects: {
    '📚': 'objects/books.png',
    '🪑': 'objects/chair.png',
    '🖊️': 'objects/pen.png',
    '✏️': 'objects/pencil.png',
    '🏠': 'objects/house.png',
    '👒': 'objects/hat.png',
    '🌸': 'objects/flower.png',
    '📅': 'objects/calendar.png',
    '🇺': 'objects/question.png',
  },
}

// 在线图片备用映射(如果本地图片不存在)
const ONLINE_IMAGE_MAP = {
  '🔴': 'https://cdn-icons-png.flaticon.com/512/702/702814.png',
  '🔵': 'https://cdn-icons-png.flaticon.com/512/702/702821.png',
  '🟢': 'https://cdn-icons-png.flaticon.com/512/702/702826.png',
  '🟡': 'https://cdn-icons-png.flaticon.com/512/702/702828.png',
  '🩷': 'https://cdn-icons-png.flaticon.com/512/702/702832.png',
  '🟣': 'https://cdn-icons-png.flaticon.com/512/702/702836.png',
  '🟠': 'https://cdn-icons-png.flaticon.com/512/702/702839.png',
  '🍎': 'https://cdn-icons-png.flaticon.com/512/415/415733.png',
  '🍌': 'https://cdn-icons-png.flaticon.com/512/415/415734.png',
  '🐱': 'https://cdn-icons-png.flaticon.com/512/616/616430.png',
  '🐕': 'https://cdn-icons-png.flaticon.com/512/616/616433.png',
  '🐦': 'https://cdn-icons-png.flaticon.com/512/616/616408.png',
  '👁️': 'https://cdn-icons-png.flaticon.com/512/481/481825.png',
  '👂': 'https://cdn-icons-png.flaticon.com/512/481/481826.png',
  '👃': 'https://cdn-icons-png.flaticon.com/512/481/481827.png',
  '👄': 'https://cdn-icons-png.flaticon.com/512/481/481828.png',
  '✋': 'https://cdn-icons-png.flaticon.com/512/481/481829.png',
  '🦶': 'https://cdn-icons-png.flaticon.com/512/481/481830.png',
  '🗣️': 'https://cdn-icons-png.flaticon.com/512/481/481831.png',
  '🏃': 'https://cdn-icons-png.flaticon.com/512/2919/2919594.png',
  '🚶': 'https://cdn-icons-png.flaticon.com/512/2919/2919600.png',
  '💃': 'https://cdn-icons-png.flaticon.com/512/2919/2919622.png',
  '🦘': 'https://cdn-icons-png.flaticon.com/512/616/616484.png',
  '👏': 'https://cdn-icons-png.flaticon.com/512/2919/2919624.png',
  '🎤': 'https://cdn-icons-png.flaticon.com/512/2919/2919612.png',
  '👨': 'https://cdn-icons-png.flaticon.com/512/2919/2919591.png',
  '👩': 'https://cdn-icons-png.flaticon.com/512/2919/2919592.png',
  '👧': 'https://cdn-icons-png.flaticon.com/512/2919/2919593.png',
  '👋': 'https://cdn-icons-png.flaticon.com/512/2919/2919621.png',
  '🌅': 'https://cdn-icons-png.flaticon.com/512/1163/1163574.png',
  '🙏': 'https://cdn-icons-png.flaticon.com/512/2919/2919619.png',
  '🇺': 'https://cdn-icons-png.flaticon.com/512/2919/2919582.png',
  '📚': 'https://cdn-icons-png.flaticon.com/512/2919/2919595.png',
  '🪑': 'https://cdn-icons-png.flaticon.com/512/753/753332.png',
  '🖊️': 'https://cdn-icons-png.flaticon.com/512/2919/2919609.png',
  '✏️': 'https://cdn-icons-png.flaticon.com/512/2919/2919610.png',
  '🌸': 'https://cdn-icons-png.flaticon.com/512/616/616405.png',
  '🧍': 'https://cdn-icons-png.flaticon.com/512/2919/2919600.png',
  '🔄': 'https://cdn-icons-png.flaticon.com/512/2919/2919613.png',
  '🏠': 'https://cdn-icons-png.flaticon.com/512/2919/2919599.png',
  '😊': 'https://cdn-icons-png.flaticon.com/512/2919/2919625.png',
  '👒': 'https://cdn-icons-png.flaticon.com/512/2769/2769886.png',
  '☁️': 'https://cdn-icons-png.flaticon.com/512/1163/1163657.png',
  '🌧️': 'https://cdn-icons-png.flaticon.com/512/1163/1163679.png',
  '⭐': 'https://cdn-icons-png.flaticon.com/512/2919/2919618.png',
  '☀️': 'https://cdn-icons-png.flaticon.com/512/1163/1163570.png',
  '🎂': 'https://cdn-icons-png.flaticon.com/512/2919/2919597.png',
  '🎊': 'https://cdn-icons-png.flaticon.com/512/2919/2919620.png',
  '🎄': 'https://cdn-icons-png.flaticon.com/512/2919/2919596.png',
  '🎃': 'https://cdn-icons-png.flaticon.com/512/2919/2919598.png',
  '👍': 'https://cdn-icons-png.flaticon.com/512/2919/2919615.png',
  '🏆': 'https://cdn-icons-png.flaticon.com/512/2919/2919623.png',
  '🎉': 'https://cdn-icons-png.flaticon.com/512/2919/2919627.png',
  '🌙': 'https://cdn-icons-png.flaticon.com/512/1163/1163659.png',
  '😴': 'https://cdn-icons-png.flaticon.com/512/2919/2919628.png',
  '✅': 'https://cdn-icons-png.flaticon.com/512/2919/2919614.png',
  '👉': 'https://cdn-icons-png.flaticon.com/512/2919/2919616.png',
  '🤲': 'https://cdn-icons-png.flaticon.com/512/2919/2919626.png',
  '🤔': 'https://cdn-icons-png.flaticon.com/512/2919/2919629.png',
  '🤝': 'https://cdn-icons-png.flaticon.com/512/2919/2919617.png',
  '📝': 'https://cdn-icons-png.flaticon.com/512/2919/2919606.png',
  '📅': 'https://cdn-icons-png.flaticon.com/512/2919/2919595.png',
  // 默认占位图
  'default': 'https://cdn-icons-png.flaticon.com/512/2919/2919601.png',
}

// 获取图片URL的辅助函数
function getImageUrl(emoji, useLocal = false) {
  // 如果指定使用本地图片,尝试从配置中获取本地路径
  if (useLocal) {
    // 遍历所有分类查找emoji
    for (const category of Object.values(IMAGE_CONFIG)) {
      if (category[emoji]) {
        return `/images/${category[emoji]}`
      }
    }
  }

  // 使用在线图片作为备用
  return ONLINE_IMAGE_MAP[emoji] || ONLINE_IMAGE_MAP['default']
}

module.exports = {
  IMAGE_CONFIG,
  ONLINE_IMAGE_MAP,
  getImageUrl,
}
