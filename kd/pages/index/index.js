// pages/index/index.js
const app = getApp()

Page({
  data: {
    learnedWords: 0,
    learnedSentences: 0,
    quizScore: 0,
    dailyTip: ''
  },

  onLoad() {
    this.loadProgress()
    this.setDailyTip()
  },

  onShow() {
    this.loadProgress()
  },

  loadProgress() {
    const learnedWords = wx.getStorageSync('learnedWords') || 0
    const learnedSentences = wx.getStorageSync('learnedSentences') || 0
    const quizScore = wx.getStorageSync('quizScore') || 0

    this.setData({
      learnedWords,
      learnedSentences,
      quizScore
    })
  },

  setDailyTip() {
    const tips = [
      '每天坚持学习15分钟，英语水平会有很大提升哦！',
      '跟着英文歌曲一起唱跳，学习更有趣！',
      '家长可以和孩子一起读绘本，增加互动乐趣。',
      '结合节日主题学习，感受节日氛围。',
      '使用本APP复习词汇，效果会更好！'
    ]

    const today = new Date().getDate()
    this.setData({
      dailyTip: tips[today % tips.length]
    })
  },

  goToWords() {
    console.log('goToWords called')
    wx.switchTab({
      url: '/pages/words/words',
      fail: (err) => {
        console.log('switchTab failed:', err)
        // 如果 switchTab 失败，尝试 navigateTo
        wx.navigateTo({
          url: '/pages/words/words',
          fail: (err2) => {
            console.log('navigateTo also failed:', err2)
          }
        })
      }
    })
  },

  goToSentences() {
    console.log('goToSentences called')
    wx.switchTab({
      url: '/pages/sentences/sentences',
      fail: (err) => {
        console.log('switchTab failed:', err)
        wx.navigateTo({
          url: '/pages/sentences/sentences',
          fail: (err2) => {
            console.log('navigateTo also failed:', err2)
          }
        })
      }
    })
  },

  goToPhonics() {
    wx.navigateTo({
      url: '/pages/phonics/phonics'
    })
  },

  goToSongs() {
    console.log('goToSongs called')
    wx.switchTab({
      url: '/pages/songs/songs',
      fail: (err) => {
        console.log('switchTab failed:', err)
        wx.navigateTo({
          url: '/pages/songs/songs',
          fail: (err2) => {
            console.log('navigateTo also failed:', err2)
          }
        })
      }
    })
  },

  goToStories() {
    wx.navigateTo({
      url: '/pages/stories/stories'
    })
  },

  goToQuiz() {
    console.log('goToQuiz called')
    wx.switchTab({
      url: '/pages/quiz/quiz',
      fail: (err) => {
        console.log('switchTab failed:', err)
        wx.navigateTo({
          url: '/pages/quiz/quiz',
          fail: (err2) => {
            console.log('navigateTo also failed:', err2)
          }
        })
      }
    })
  }
})
