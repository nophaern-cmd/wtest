// pages/mode-select/mode-select.js
const app = getApp()

Page({
  data: {
    stage: 'kindergarten',
    studyStats: {
      totalWords: 0,
      streakDays: 0,
      studyTime: 0
    },
    modeProgress: {
      mode1: 0,
      mode2: 0,
      mode3: 0
    },
    dailyGoal: 10,
    todayLearned: 0
  },

  onLoad(options) {
    if (options.stage) {
      this.setData({ stage: options.stage })
    }
    this.loadStudyData()
    this.updatePageStyle()
  },

  onShow() {
    this.loadStudyData()
  },

  // 加载学习数据
  loadStudyData() {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) return

    this.setData({
      studyStats: userInfo.studyStats || {
        totalWords: 0,
        streakDays: 0,
        studyTime: 0
      },
      dailyGoal: userInfo.settings?.dailyGoal || 10
    })

    // 计算今日学习数量
    const today = new Date().toDateString()
    const todayWords = Object.values(userInfo.wordProgress || {}).filter(word => {
      return word.status === 'mastered' || word.status === 'learning'
    })
    this.setData({ todayLearned: todayWords.length })

    // 计算各模式进度（简化版）
    const totalWords = userInfo.studyStats?.totalWords || 0
    this.setData({
      modeProgress: {
        mode1: totalWords > 0 ? Math.min(Math.floor(totalWords * 2.5), 100) : 0,
        mode2: totalWords > 0 ? Math.min(Math.floor(totalWords * 1.5), 100) : 0,
        mode3: totalWords > 0 ? Math.min(Math.floor(totalWords * 1), 100) : 0
      }
    })
  },

  // 更新页面样式
  updatePageStyle() {
    const navigationBarColors = {
      kindergarten: '#FF9F43',
      primary: '#54A0FF',
      junior: '#5F27CD'
    }

    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: navigationBarColors[this.data.stage] || '#FF9F43'
    })
  },

  // 返回
  goBack() {
    wx.navigateBack()
  },

  // 选择模式
  selectMode(e) {
    const mode = e.currentTarget.dataset.mode

    // 震动反馈
    wx.vibrateShort({
      type: 'light'
    })

    switch (mode) {
      case '1':
        // 跳转到分类选择页面
        wx.navigateTo({
          url: `/pages/category-select/category-select?stage=${this.data.stage}&mode=1`
        })
        break
      case '2':
        // 跳转到联想记忆页面
        wx.navigateTo({
          url: `/pages/mode2/mode2?stage=${this.data.stage}`
        })
        break
      case '3':
        // 跳转到故事列表页面
        wx.navigateTo({
          url: `/pages/mode3/mode3?stage=${this.data.stage}`
        })
        break
    }
  }
})
