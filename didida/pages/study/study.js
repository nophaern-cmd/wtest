const wordsData = require('../../data/words.js')

Page({
  data: {
    level: 'kindergarten',
    categories: [],
    categoryIcons: {
      '食物': '🍎',
      '动物': '🐱',
      '颜色': '🎨',
      '数字': '🔢',
      '家庭': '👨‍👩‍👧',
      '身体': '🗣️',
      '时间': '⏰',
      '学校': '🏫',
      '交通': '🚗',
      '职业': '👨‍💼',
      '情感': '😊',
      '自然': '🌿',
      '学科': '📚'
    },
    progress: 0,
    progressText: '0%',
    reviewCount: 0,
    totalWordCount: 0
  },

  onLoad() {
    this.loadUserData()
  },

  onShow() {
    this.loadUserData()
  },

  // 加载用户数据
  loadUserData() {
    const userInfo = wx.getStorageSync('userInfo') || {}
    const level = userInfo.level || 'kindergarten'
    const categories = wordsData.getCategories(level)
    const totalWords = wordsData.getWordsByLevel(level).length
    const studiedWords = (userInfo.studiedWords || []).length

    this.setData({
      level,
      categories,
      totalWordCount: totalWords,
      progress: totalWords > 0 ? Math.round(studiedWords / totalWords * 100) : 0,
      progressText: totalWords > 0 ? `${Math.round(studiedWords / totalWords * 100)}%` : '0%',
      reviewCount: studiedWords
    })
  },

  // 获取分类单词数量
  getCategoryWordCount(category) {
    const { level } = this.data
    const words = wordsData.getWordsByCategory(level, category)
    return words.length
  },

  // 学习分类
  studyCategory(e) {
    const category = e.currentTarget.dataset.category

    wx.navigateTo({
      url: `/pages/mode1/mode1?level=${this.data.level}&category=${category}`
    })
  },

  // 跳转模式
  goToMode(e) {
    const mode = e.currentTarget.dataset.mode

    wx.navigateTo({
      url: `/pages/${mode}/${mode}?level=${this.data.level}`
    })
  },

  // 开始复习
  startReview() {
    const userInfo = wx.getStorageSync('userInfo') || {}
    const studiedWords = userInfo.studiedWords || []

    if (studiedWords.length === 0) {
      wx.showToast({
        title: '暂无复习单词',
        icon: 'none'
      })
      return
    }

    wx.showActionSheet({
      itemList: ['模式1复习', '分类复习', '测验复习'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            wx.navigateTo({
              url: `/pages/mode1/mode1?level=${this.data.level}`
            })
            break
          case 1:
            wx.navigateTo({
              url: `/pages/mode2/mode2?level=${this.data.level}`
            })
            break
          case 2:
            wx.navigateTo({
              url: `/pages/mode3/mode3?level=${this.data.level}`
            })
            break
        }
      }
    })
  }
})
