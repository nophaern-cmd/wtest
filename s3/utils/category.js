/**
 * 分类工具类
 * 统一管理分类逻辑
 */

/**
 * 句子分类映射
 */
const SENTENCE_CATEGORIES = {
  size: '大小',
  description: '描述',
  daily: '日常',
  greeting: '问候',
  question: '询问',
  festival: '节日',
  speed: '速度'
}

/**
 * 根据句子内容判断分类
 * @param {string} english - 英文句子
 * @returns {string} 分类
 */
function getSentenceCategory(english) {
  const text = english.toLowerCase()

  if (text.includes('big') || text.includes('small')) {
    return 'size'
  }

  if (text.includes('how are you') || text.includes('happy') || text.includes('name')) {
    return 'greeting'
  }

  if (text.includes('christmas') || text.includes('halloween') || text.includes('trick')) {
    return 'festival'
  }

  if (text.includes('fast') || text.includes('slow')) {
    return 'speed'
  }

  if (text.includes('what') || text.includes('what\'s')) {
    return 'question'
  }

  return 'description'
}

/**
 * 为句子列表添加分类和已朗读状态
 * @param {Array} sentences - 句子列表
 * @param {Array} learnedSentences - 已朗读的句子列表
 * @returns {Array} 处理后的句子列表
 */
function enrichSentences(sentences, learnedSentences = []) {
  return sentences.map(sentence => ({
    ...sentence,
    category: getSentenceCategory(sentence.english),
    learned: learnedSentences.includes(sentence.english)
  }))
}

/**
 * 根据分类过滤句子
 * @param {Array} sentences - 句子列表
 * @param {string} category - 分类（'all' 表示不过滤）
 * @returns {Array} 过滤后的句子列表
 */
function filterSentencesByCategory(sentences, category) {
  if (category === 'all') {
    return sentences
  }
  return sentences.filter(sentence => sentence.category === category)
}

/**
 * 获取歌曲类型显示名称
 * @param {string} type - 歌曲类型
 * @returns {string} 显示名称
 */
function getSongTypeName(type) {
  const typeNames = {
    basic: '基础互动类',
    festival: '节日主题类',
    mc: 'MC音乐'
  }
  return typeNames[type] || type
}

/**
 * 获取故事类型
 * @param {string} name - 故事名称
 * @returns {string} 故事类型
 */
function getStoryType(name) {
  if (name.includes('story') || name.includes('Peppa')) {
    return '故事'
  }
  return '绘本'
}

/**
 * 获取故事表情
 * @param {string} name - 故事名称
 * @returns {string} 表情符号
 */
function getStoryEmoji(name) {
  const emojiMap = {
    'The big monster': '👹',
    'Lets play': '🎮',
    'Peppas Christmas': '🎄',
    'Scary, not scary': '👻',
    'Two': '2️⃣',
    'Christmas Eve': '🎅'
  }
  return emojiMap[name] || '📖'
}

/**
 * 获取故事内容
 * @param {string} name - 故事名称
 * @returns {Object} 故事内容
 */
function getStoryContent(name) {
  const storyContent = {
    'The big monster': {
      content: '一个关于大怪物的有趣故事，通过描述怪物的身体部位来学习身体和颜色相关的词汇。故事鼓励孩子们观察和描述。',
      points: ['学习身体部位词汇', '练习颜色描述', '提高观察能力']
    },
    'Lets play': {
      content: '一个互动性强的故事，讲述了孩子们一起玩耍的场景。通过故事学习日常动作和表达。',
      points: ['学习日常动作词汇', '练习表达请求', '培养社交能力']
    },
    'Peppas Christmas': {
      content: '佩佩一家的圣诞节故事，充满了节日的欢乐氛围。通过故事了解圣诞节的传统和习俗。',
      points: ['了解圣诞节文化', '学习节日词汇', '感受节日氛围']
    },
    'Scary, not scary': {
      content: 'RAZ分级绘本，讲述有些东西看起来很可怕，但实际上并不可怕。帮助孩子克服恐惧。',
      points: ['情绪管理', '勇敢面对未知', '反义词学习']
    },
    'Two': {
      content: 'RAZ分级绘本，关于数字二的概念。通过有趣的画面学习数字和数量。',
      points: ['数字认知', '数量理解', '基础数学']
    },
    'Christmas Eve': {
      content: 'RAZ分级绘本，讲述了平安夜的温馨故事。充满节日的期待和喜悦。',
      points: ['节日传统', '情感表达', '家庭观念']
    }
  }
  return storyContent[name] || { content: '', points: [] }
}

/**
 * 为故事列表添加类型、表情和已读状态
 * @param {Array} stories - 故事列表
 * @param {Array} readStories - 已读的故事列表
 * @returns {Array} 处理后的故事列表
 */
function enrichStories(stories, readStories = []) {
  return stories.map(story => ({
    ...story,
    type: getStoryType(story.name),
    emoji: getStoryEmoji(story.name),
    read: readStories.includes(story.name)
  }))
}

/**
 * 获取每日提示
 * @param {number} day - 日期（1-31）
 * @returns {string} 提示文本
 */
function getDailyTip(day = new Date().getDate()) {
  const tips = [
    '每天坚持朗读15分钟，英语水平会有很大提升哦！',
    '跟着英文歌曲一起唱跳，朗读更有趣！',
    '家长可以和孩子一起读绘本，增加互动乐趣。',
    '结合节日主题朗读，感受节日氛围。',
    '使用本工具复习词汇，效果会更好！'
  ]
  return tips[day % tips.length]
}

/**
 * 数组乱序
 * @param {Array} array - 原数组
 * @returns {Array} 乱序后的数组
 */
function shuffleArray(array) {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

module.exports = {
  SENTENCE_CATEGORIES,
  getSentenceCategory,
  enrichSentences,
  filterSentencesByCategory,
  getSongTypeName,
  getStoryType,
  getStoryEmoji,
  getStoryContent,
  enrichStories,
  getDailyTip,
  shuffleArray
}
