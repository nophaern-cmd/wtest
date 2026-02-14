// pages/index/index.js
const app = getApp()
const storage = require('../../../utils/storage')
const category = require('../../../utils/category')

Page({
  data: {
    learnedWords: 0,
    learnedSentences: 0,
    quizScore: 0,
    dailyTip: '',
    loading: false
  },

  onLoad() {
    this.setData({ loading: true })
    try {
      this.loadProgress()
      this.setDailyTip()
      this.setData({ loading: false })
    } catch (err) {
      console.error('首页加载失败:', err)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      })
    }
  },

  onShow() {
    this.loadProgress()
  },

  loadProgress() {
    const stats = storage.getHomeStats()
    this.setData(stats)
  },

  setDailyTip() {
    const today = new Date().getDate()
    this.setData({
      dailyTip: category.getDailyTip(today)
    })
  },

  goToWords() {
    wx.navigateTo({
      url: '/pages/english/words/words'
    })
  },

  goToSentences() {
    wx.navigateTo({
      url: '/pages/english/sentences/sentences'
    })
  },

  goToPhonics() {
    wx.navigateTo({
      url: '/pages/english/phonics/phonics'
    })
  },

  goToSongs() {
    wx.navigateTo({
      url: '/pages/english/songs/songs'
    })
  },

  goToStories() {
    wx.navigateTo({
      url: '/pages/english/stories/stories'
    })
  },

  goToQuiz() {
    wx.navigateTo({
      url: '/pages/english/quiz/quiz'
    })
  },

  onPrivacyAgreed() {
    console.log('用户已同意隐私保护指引')
  }
})
