// app.js
App({
  onLaunch() {
    // 初始化本地存储
    this.initStorage()
    this.checkStudyStreak()
  },

  // 初始化存储
  initStorage() {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      wx.setStorageSync('userInfo', {
        level: 'kindergarten', // kindergarten:幼儿, primary:小学, junior:中学
        studiedWords: [],      // 已学单词
        favoriteWords: [],     // 收藏单词
        studyStats: {
          totalWords: 0,
          masteredWords: 0,
          studyTime: 0,
          streakDays: 0
        },
        settings: {
          dailyGoal: 10,        // 每日学习目标
          autoPlay: true,       // 自动播放音频
          audioSpeed: 1.0,      // 音频语速
          theme: 'light'        // 主题模式
        },
        wordProgress: {},       // 单词学习进度
        storyProgress: {},      // 故事学习进度
        wrongWords: [],         // 错题本
        lastStudyDate: null     // 上次学习日期
      })
    }
  },

  // 检查连续学习天数
  checkStudyStreak() {
    const userInfo = wx.getStorageSync('userInfo')
    const today = new Date().toDateString()
    const lastDate = userInfo.lastStudyDate

    if (lastDate) {
      const last = new Date(lastDate)
      const now = new Date()
      const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24))

      if (diffDays > 1) {
        // 中断连续学习
        userInfo.studyStats.streakDays = 0
      }
    }

    wx.setStorageSync('userInfo', userInfo)
  },

  // 更新学习进度
  updateStudyProgress(wordId, status) {
    const userInfo = wx.getStorageSync('userInfo')
    const progress = userInfo.wordProgress[wordId] || {
      status: 'unlearned',
      reviewCount: 0,
      nextReviewTime: Date.now(),
      errorCount: 0
    }

    progress.status = status
    progress.reviewCount += 1

    // 根据艾宾浩斯遗忘曲线设置下次复习时间
    const intervals = [1, 3, 7, 14, 30] // 天数
    const interval = intervals[Math.min(progress.reviewCount - 1, intervals.length - 1)]
    progress.nextReviewTime = Date.now() + interval * 24 * 60 * 60 * 1000

    if (status === 'mastered') {
      userInfo.studyStats.masteredWords++
    }

    if (status === 'learning') {
      if (!userInfo.studiedWords.includes(wordId)) {
        userInfo.studiedWords.push(wordId)
        userInfo.studyStats.totalWords++
      }
    }

    userInfo.wordProgress[wordId] = progress

    // 更新连续学习天数
    const today = new Date().toDateString()
    if (userInfo.lastStudyDate !== today) {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
      if (userInfo.lastStudyDate === yesterday) {
        userInfo.studyStats.streakDays++
      } else {
        userInfo.studyStats.streakDays = 1
      }
      userInfo.lastStudyDate = today
    }

    wx.setStorageSync('userInfo', userInfo)
  },

  // 添加错题
  addWrongWord(wordId) {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo.wrongWords.includes(wordId)) {
      userInfo.wrongWords.push(wordId)
      wx.setStorageSync('userInfo', userInfo)
    }
  },

  // 收藏单词
  toggleFavoriteWord(wordId) {
    const userInfo = wx.getStorageSync('userInfo')
    const index = userInfo.favoriteWords.indexOf(wordId)

    if (index > -1) {
      userInfo.favoriteWords.splice(index, 1)
    } else {
      userInfo.favoriteWords.push(wordId)
    }

    wx.setStorageSync('userInfo', userInfo)
    return userInfo.favoriteWords.includes(wordId)
  },

  // 获取今日需复习的单词
  getTodayReviewWords() {
    const userInfo = wx.getStorageSync('userInfo')
    const now = Date.now()
    const reviewWords = []

    for (const wordId in userInfo.wordProgress) {
      const progress = userInfo.wordProgress[wordId]
      if (progress.nextReviewTime <= now) {
        reviewWords.push(wordId)
      }
    }

    return reviewWords
  },

  globalData: {
    // 全局配置
    config: {
      audioEnabled: true, // 是否开启发音
      autoNext: false     // 是否自动下一个
    }
  }
})
