// 学习大厅首页
const app = getApp()

Page({
  data: {
    wordsCount: 0,
    sentencesCount: 0,
    sanzijingCount: 0,
    poemsCount: 0
  },

  onLoad() {
    this.loadCounts()
  },

  // 加载数量统计
  loadCounts() {
    const data = app.globalData
    
    this.setData({
      wordsCount: data.words.basic.length,
      sentencesCount: data.sentences.length,
      sanzijingCount: data.guoxue.sanzijing.length,
      poemsCount: data.guoxue.poems.length
    })
  },

  // 跳转到英语学习
  navigateToEnglish() {
    wx.navigateTo({
      url: '/pages/english/index/index'
    })
  },

  // 跳转到国学学习
  navigateToGuoxue() {
    wx.navigateTo({
      url: '/pages/guoxue/guoxue'
    })
  }
})
