const app = getApp()

Page({
  data: {
    currentType: 'sanzijing',
    list: [],
    currentIndex: 0
  },

  onLoad(options) {
    const currentType = options.type || 'sanzijing'
    const currentIndex = parseInt(options.index) || 0
    
    this.setData({
      currentType,
      currentIndex
    })
    
    this.loadData()
  },

  loadData() {
    const data = app.globalData.guoxue
    const currentType = this.data.currentType
    const list = currentType === 'sanzijing' ? data.sanzijing : data.poems
    
    this.setData({ list })
  },

  switchType(e) {
    const type = e.currentTarget.dataset.type
    if (type === this.data.currentType) return
    
    this.setData({
      currentType: type,
      currentIndex: 0
    })
    this.loadData()
  },

  selectItem(e) {
    const index = e.currentTarget.dataset.index
    
    // 返回上一页并传递选中项
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    
    if (prevPage) {
      prevPage.selectLesson(this.data.currentType, index)
    }
    
    wx.navigateBack()
  }
})
