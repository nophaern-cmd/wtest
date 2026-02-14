// pages/privacy/privacy.js
Page({
  data: {
    privacyText: ''
  },

  onLoad(options) {
    console.log('隐私页面加载')
  },

  /**
   * 返回上一页
   */
  handleBack() {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      wx.navigateBack()
    } else {
      wx.switchTab({
        url: '/pages/index/index'
      })
    }
  },

  /**
   * 分享隐私政策
   */
  onShareAppMessage() {
    return {
      title: '英语朗读助手 - 用户隐私保护指引',
      path: '/pages/privacy/privacy'
    }
  }
})
