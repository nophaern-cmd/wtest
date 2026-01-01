// pages/home/home.js
const app = getApp()

Page({
  data: {
    level: 'kindergarten',
    todayWords: 0,
    streakDays: 0,
    totalWords: 0,
    masteredWords: 0,
    studyTime: 0
  },

  onLoad() {
    this.loadUserInfo()
  },

  onShow() {
    this.loadUserInfo()
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) return

    this.setData({
      level: userInfo.level || 'kindergarten',
      todayWords: this.getTodayWords(),
      streakDays: userInfo.studyStats?.streakDays || 0,
      totalWords: userInfo.studyStats?.totalWords || 0,
      masteredWords: userInfo.studyStats?.masteredWords || 0,
      studyTime: userInfo.studyStats?.studyTime || 0
    })

    this.updatePageStyle(userInfo.level)
  },

  // 获取今日学习单词数
  getTodayWords() {
    const today = new Date().toDateString()
    const userInfo = wx.getStorageSync('userInfo')

    if (!userInfo.wordProgress) return 0

    return Object.values(userInfo.wordProgress).filter(word => {
      const wordDate = new Date(word.lastStudyTime || Date.now()).toDateString()
      return wordDate === today && (word.status === 'learning' || word.status === 'mastered')
    }).length
  },

  // 更新页面样式
  updatePageStyle(level) {
    const navigationBarColors = {
      kindergarten: '#FF9F43',
      primary: '#54A0FF',
      middle: '#5F27CD'
    }

    const backgroundColors = {
      kindergarten: '#FFF5F0',
      primary: '#F0F7FF',
      middle: '#F5F0FA'
    }

    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: navigationBarColors[level] || '#FF9F43'
    })

    wx.setBackgroundColor({
      backgroundColor: backgroundColors[level] || '#FFF5F0'
    })
  },

  // 跳转到阶段选择
  goToStage() {
    wx.navigateTo({
      url: '/pages/index/index'
    })
  },

  // 跳转到词汇本
  goToWordList() {
    wx.navigateTo({
      url: '/pages/wordlist/wordlist'
    })
  },

  // 跳转到复习
  goToReview() {
    const reviewWords = app.getTodayReviewWords()
    if (reviewWords.length === 0) {
      wx.showToast({
        title: '暂无需要复习的单词',
        icon: 'none'
      })
      return
    }
    wx.showToast({
      title: `今日需复习 ${reviewWords.length} 个单词`,
      icon: 'none'
    })
  },

  // 跳转到个人中心
  goToProfile() {
    wx.navigateTo({
      url: '/pages/profile/profile'
    })
  }
})
