/**
 * 存储管理工具类
 * 统一管理本地存储操作
 */

const STORAGE_KEYS = {
  LEARNED_WORDS_LIST: 'learnedWordsList',
  LEARNED_WORDS: 'learnedWords',
  LEARNED_SENTENCES_LIST: 'learnedSentencesList',
  LEARNED_SENTENCES: 'learnedSentences',
  QUIZ_HISTORY: 'quizHistory',
  QUIZ_SCORE: 'quizScore',
  FAVORITE_SONGS: 'favoriteSongs',
  READ_STORIES: 'readStories'
}

/**
 * 获取存储数据
 * @param {string} key - 存储键
 * @param {*} defaultValue - 默认值
 * @returns {*} 存储的值
 */
function get(key, defaultValue = null) {
  try {
    const value = wx.getStorageSync(key)
    return value !== '' ? value : defaultValue
  } catch (error) {
    console.error('获取存储数据失败:', error)
    return defaultValue
  }
}

/**
 * 设置存储数据
 * @param {string} key - 存储键
 * @param {*} value - 存储的值
 * @returns {boolean} 是否成功
 */
function set(key, value) {
  try {
    wx.setStorageSync(key, value)
    return true
  } catch (error) {
    console.error('设置存储数据失败:', error)
    wx.showToast({
      title: '保存失败',
      icon: 'none'
    })
    return false
  }
}

/**
 * 删除存储数据
 * @param {string} key - 存储键
 * @returns {boolean} 是否成功
 */
function remove(key) {
  try {
    wx.removeStorageSync(key)
    return true
  } catch (error) {
    console.error('删除存储数据失败:', error)
    return false
  }
}

/**
 * 清空所有存储数据
 * @returns {boolean} 是否成功
 */
function clear() {
  try {
    wx.clearStorageSync()
    return true
  } catch (error) {
    console.error('清空存储数据失败:', error)
    return false
  }
}

/**
 * 更新使用进度 - 单词
 * @param {string} english - 单词英文
 * @param {boolean} isLearned - 是否已朗读
 */
function updateWordProgress(english, isLearned) {
  const learnedWords = get(STORAGE_KEYS.LEARNED_WORDS_LIST, [])

  if (isLearned) {
    if (!learnedWords.includes(english)) {
      learnedWords.push(english)
    }
  } else {
    const index = learnedWords.indexOf(english)
    if (index > -1) {
      learnedWords.splice(index, 1)
    }
  }

  set(STORAGE_KEYS.LEARNED_WORDS_LIST, learnedWords)
  set(STORAGE_KEYS.LEARNED_WORDS, learnedWords.length)
  return learnedWords
}

/**
 * 更新使用进度 - 句子
 * @param {string} english - 句子英文
 * @param {boolean} isLearned - 是否已朗读
 */
function updateSentenceProgress(english, isLearned) {
  const learnedSentences = get(STORAGE_KEYS.LEARNED_SENTENCES_LIST, [])

  if (isLearned) {
    if (!learnedSentences.includes(english)) {
      learnedSentences.push(english)
    }
  } else {
    const index = learnedSentences.indexOf(english)
    if (index > -1) {
      learnedSentences.splice(index, 1)
    }
  }

  set(STORAGE_KEYS.LEARNED_SENTENCES_LIST, learnedSentences)
  set(STORAGE_KEYS.LEARNED_SENTENCES, learnedSentences.length)
  return learnedSentences
}

/**
 * 保存测试成绩
 * @param {Object} quizData - 测试数据
 */
function saveQuizScore(quizData) {
  const quizHistory = get(STORAGE_KEYS.QUIZ_HISTORY, [])
  quizHistory.push(quizData)
  set(STORAGE_KEYS.QUIZ_HISTORY, quizHistory)

  // 更新最高分
  const scores = quizHistory.map(q => q.accuracy)
  const highestScore = Math.max(...scores)
  set(STORAGE_KEYS.QUIZ_SCORE, highestScore)
}

/**
 * 切换收藏状态 - 歌曲
 * @param {string} songName - 歌曲名称
 * @returns {Array} 更新后的收藏列表
 */
function toggleSongFavorite(songName) {
  const favoriteSongs = get(STORAGE_KEYS.FAVORITE_SONGS, [])
  const index = favoriteSongs.indexOf(songName)

  if (index > -1) {
    favoriteSongs.splice(index, 1)
  } else {
    favoriteSongs.push(songName)
  }

  set(STORAGE_KEYS.FAVORITE_SONGS, favoriteSongs)
  return favoriteSongs
}

/**
 * 切换阅读状态 - 故事
 * @param {string} storyName - 故事名称
 * @returns {Array} 更新后的阅读列表
 */
function toggleStoryRead(storyName) {
  const readStories = get(STORAGE_KEYS.READ_STORIES, [])
  const index = readStories.indexOf(storyName)

  if (index > -1) {
    readStories.splice(index, 1)
  } else {
    readStories.push(storyName)
  }

  set(STORAGE_KEYS.READ_STORIES, readStories)
  return readStories
}

/**
 * 获取首页统计数据
 * @returns {Object} 统计数据
 */
function getHomeStats() {
  return {
    learnedWords: get(STORAGE_KEYS.LEARNED_WORDS, 0),
    learnedSentences: get(STORAGE_KEYS.LEARNED_SENTENCES, 0),
    quizScore: get(STORAGE_KEYS.QUIZ_SCORE, 0)
  }
}

/**
 * 获取测试统计
 * @returns {Object} 测试统计
 */
function getQuizStats() {
  const quizHistory = get(STORAGE_KEYS.QUIZ_HISTORY, [])
  const totalQuizzes = quizHistory.length

  if (totalQuizzes === 0) {
    return {
      highestScore: 0,
      totalQuizzes: 0,
      avgScore: 0
    }
  }

  const scores = quizHistory.map(q => q.score)
  const highestScore = Math.max(...scores)
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / totalQuizzes)

  return {
    highestScore,
    totalQuizzes,
    avgScore
  }
}

module.exports = {
  STORAGE_KEYS,
  get,
  set,
  remove,
  clear,
  updateWordProgress,
  updateSentenceProgress,
  saveQuizScore,
  toggleSongFavorite,
  toggleStoryRead,
  getHomeStats,
  getQuizStats
}
