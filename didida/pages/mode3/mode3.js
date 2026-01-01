// pages/mode3/mode3.js
Page({
  data: {},

  onLoad(options) {
    if (options.stage) {
      this.setData({ stage: options.stage })
    }
  },

  goBack() {
    wx.navigateBack()
  }
})
