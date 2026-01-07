// Emoji 配置文件 - 使用 emoji 替代图片资源
// 这样可以大幅减小程序体积

const EMOJI_CONFIG = {
  // 配置选项
  useEmojiOnly: true,  // true: 只用emoji, false: 使用图片
  emojiSize: '64px',   // emoji 显示大小

  // 获取图片/emoji URL
  getImageUrl(emoji, useLocal = true) {
    // 如果只使用 emoji，返回空字符串（由前端显示 emoji）
    if (this.useEmojiOnly) {
      return '';  // 前端会直接显示 emoji
    }

    // 兼容旧版本，返回图片路径
    const category = this.getCategory(emoji);
    if (category && this[category] && this[category][emoji]) {
      const path = this[category][emoji];
      return useLocal ? `../../images/${path}` : this.getOnlineUrl(emoji);
    }

    return '';
  },

  // 获取 emoji 对应的分类
  getCategory(emoji) {
    for (const [category, emojis] of Object.entries(this)) {
      if (typeof emojis === 'object' && emojis[emoji]) {
        return category;
      }
    }
    return null;
  },

  // 获取在线图片URL（备用）
  getOnlineUrl(emoji) {
    const ONLINE_MAP = {
      // 可以在这里配置在线图片CDN
    };
    return ONLINE_MAP[emoji] || '';
  },

  // 直接返回 emoji 字符
  getEmoji(emoji) {
    return emoji;
  },

  // ============= emoji 分类配置（用于参考） =============

  // 颜色类
  colors: {
    '🔴': 'red',
    '🔵': 'blue',
    '🟢': 'green',
    '🟡': 'yellow',
    '🩷': 'pink',
    '🟣': 'purple',
    '🟠': 'orange',
    '⚪': 'white',
    '⚫': 'black',
    '🎨': 'colors',
    '👁️': 'eye',
  },

  // 动物类
  animals: {
    '🐱': 'cat',
    '🐕': 'dog',
    '🐦': 'bird',
    '🐻': 'bear',
    '🐟': 'fish',
    '🐘': 'elephant',
    '🦁': 'lion',
    '🐵': 'monkey',
    '🐼': 'panda',
    '🐯': 'tiger',
    '🐰': 'rabbit',
    '🐜': 'ant',
    '🦆': 'duck',
    '🐭': 'mouse',
    '🐷': 'pig',
    '🦘': 'kangaroo',
  },

  // 身体/人物类
  bodyPeople: {
    '👁️': 'eye',
    '👂': 'ear',
    '👃': 'nose',
    '👄': 'mouth',
    '✋': 'hand',
    '🦶': 'foot',
    '🗣️': 'speaking',
    '🏃': 'running',
    '🚶': 'walking',
    '💃': 'dancing',
    '👏': 'clapping',
    '🎤': 'singing',
    '👨': 'man',
    '👩': 'woman',
    '👧': 'girl',
    '👋': 'waving',
    '🧍': 'standing',
  },

  // 字母类
  letters: {
    '🅰️': 'A',
    '🅱️': 'B',
    '©️': 'C',
    '🌙': 'D',
    '📧': 'E',
    '🏳️': 'F',
    '🎸': 'G',
    '♓': 'H',
    'ℹ️': 'I',
    '🎷': 'J',
    '🎋': 'K',
    '🛴': 'L',
    'Ⓜ️': 'M',
    '🔨': 'N',
    '⭕': 'O',
    '🅿️': 'P',
    '🎯': 'Q',
    '®️': 'R',
    '💲': 'S',
    '✝️': 'T',
    '⛎': 'U',
    '✌️': 'V',
    '〰️': 'W',
    '❌': 'X',
    '💴': 'Y',
    '💤': 'Z',
  },

  // 数字类
  numbers: {
    '0️⃣': 'zero',
    '1️⃣': 'one',
    '2️⃣': 'two',
    '3️⃣': 'three',
    '4️⃣': 'four',
    '5️⃣': 'five',
    '6️⃣': 'six',
    '7️⃣': 'seven',
    '8️⃣': 'eight',
    '9️⃣': 'nine',
    '🔟': 'ten',
  },

  // 食物类
  food: {
    '🍎': 'apple',
    '🍌': 'banana',
    '🍊': 'orange',
    '🍇': 'grape',
    '🍓': 'strawberry',
    '🍑': 'peach',
    '🥭': 'mango',
    '🍍': 'pineapple',
    '🥝': 'kiwi',
  },

  // 动作类
  actions: {
    '📝': 'writing',
    '🎤': 'singing',
    '🏃': 'running',
    '🚶': 'walking',
    '🏊': 'swimming',
    '🚴': 'cycling',
    '📖': 'reading',
    '💤': 'sleeping',
  },

  // 天气类
  weather: {
    '☀️': 'sun',
    '🌙': 'moon',
    '🌅': 'sunrise',
    '☁️': 'cloud',
    '🌧️': 'rain',
    '⭐': 'star',
    '❄️': 'snow',
    '🌈': 'rainbow',
  },

  // 物品类
  objects: {
    '📚': 'books',
    '🪑': 'chair',
    '🖊️': 'pen',
    '✏️': 'pencil',
    '🏠': 'house',
    '👒': 'hat',
    '🌸': 'flower',
    '📅': 'calendar',
    '🖼️': 'picture',
  },

  // 图标类
  icons: {
    '🔊': 'volume-high',
    '🔈': 'volume-low',
    '🔉': 'volume-mute',
    '📢': 'announcement',
    '✅': 'check',
    '👉': 'arrow-right',
    '🔄': 'refresh',
    '👍': 'thumbs-up',
    '🏆': 'trophy',
    '🎉': 'celebration',
    '🤲': 'open-hands',
    '🤔': 'thinking',
    '🤝': 'handshake',
    '🙏': 'praying',
    '😊': 'happy',
    '😴': 'sleeping',
  },
};

// 导出配置
module.exports = EMOJI_CONFIG;
module.exports.default = EMOJI_CONFIG;
