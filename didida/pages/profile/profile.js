// pages/profile/profile.js
const app = getApp()

Page({
  data: {
    level: 'kindergarten',
    levelText: '幼儿阶段',
    studyStats: {
      totalWords: 0,
      masteredWords: 0,
      streakDays: 0,
      studyTime: 0
    },
    last7Days: []
  },

  onLoad() {
    this.loadUserInfo()
    this.loadLast7Days()
  },

  onShow() {
    this.loadUserInfo()
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) return

    const levelTextMap = {
      kindergarten: '幼儿阶段',
      primary: '小学阶段',
      middle: '中学阶段'
    }

    this.setData({
      level: userInfo.level,
      levelText: levelTextMap[userInfo.level] || '幼儿阶段',
      studyStats: userInfo.studyStats || {
        totalWords: 0,
        masteredWords: 0,
        streakDays: 0,
        studyTime: 0
      }
    })
  },

  // 加载最近7天
  loadLast7Days() {
    const days = []
    const today = new Date()
    const dayNames = ['日', '一', '二', '三', '四', '五', '六']

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      days.push({
        date: date.getDate(),
        day: i === 0 ? '今' : dayNames[date.getDay()],
        learned: Math.random() > 0.3 // 模拟学习状态
      })
    }

    this.setData({ last7Days: days })
  },

  // 跳转到错题本
  goToWrongWords() {
    wx.showToast({ title: '错题本功能开发中', icon: 'none' })
  },

  // 跳转到生词本
  goToFavoriteWords() {
    wx.navigateTo({ url: '/pages/wordlist/wordlist?type=favorite' })
  },

  // 跳转到学习统计
  goToStats() {
    wx.navigateTo({ url: '/pages/stats/stats' })
  },

  // 跳转到设置
  goToSettings() {
    wx.navigateTo({ url: '/pages/settings/settings' })
  }
})
