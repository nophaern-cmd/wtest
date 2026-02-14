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

  onShow() {
    this.loadCounts()
  },

  // 加载数量统计
  loadCounts() {
    const data = app.globalData
    console.log('index loadCounts - globalData:', data)
    console.log('index loadCounts - guoxue:', data.guoxue)
    console.log('index loadCounts - sanzijing:', data.guoxue?.sanzijing?.length)
    console.log('index loadCounts - poems:', data.guoxue?.poems?.length)
    
    const counts = {
      wordsCount: data.words?.basic?.length || 0,
      sentencesCount: data.sentences?.length || 0,
      sanzijingCount: data.guoxue?.sanzijing?.length || 0,
      poemsCount: data.guoxue?.poems?.length || 0
    }
    console.log('index loadCounts - setData:', counts)
    
    this.setData(counts)
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
  },

  // 快速开始
  quickStart(e) {
    const type = e.currentTarget.dataset.type
    const data = app.globalData.guoxue
    
    if (type === 'sanzijing') {
      // 直接进入三字经第一章
      wx.navigateTo({
        url: '/pages/guoxue/guoxue?type=sanzijing&index=0'
      })
    } else if (type === 'poems') {
      // 直接进入古诗第一首
      wx.navigateTo({
        url: '/pages/guoxue/guoxue?type=poems&index=0'
      })
    } else if (type === 'random') {
      // 随机选择
      const types = ['sanzijing', 'poems']
      const randomType = types[Math.floor(Math.random() * types.length)]
      const list = randomType === 'sanzijing' ? data.sanzijing : data.poems
      const randomIndex = Math.floor(Math.random() * list.length)
      
      wx.navigateTo({
        url: `/pages/guoxue/guoxue?type=${randomType}&index=${randomIndex}`
      })
    }
  }
})
