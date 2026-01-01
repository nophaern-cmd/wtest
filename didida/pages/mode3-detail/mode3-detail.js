// pages/mode3-detail/mode3-detail.js
Page({
  data: {},

  onLoad(options) {
    if (options.storyId) {
      this.setData({ storyId: options.storyId })
    }
  },

  goBack() {
    wx.navigateBack()
  }
})
