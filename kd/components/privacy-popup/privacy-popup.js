// components/privacy-popup/privacy-popup.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    title: {
      type: String,
      value: '隐私保护指引'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    hasAgreed: false
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      // 延迟检查,避免影响页面初始化
      setTimeout(() => {
        this.checkAgreement()
      }, 500)
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 检查用户是否已同意隐私指引
     */
    checkAgreement() {
      const hasAgreed = wx.getStorageSync('privacyAgreed') || false
      this.setData({ hasAgreed })

      if (!hasAgreed) {
        this.setData({ show: true })
      }
    },

    /**
     * 同意隐私指引
     */
    handleAgree() {
      wx.setStorageSync('privacyAgreed', true)
      this.setData({ hasAgreed: true, show: false })
      this.triggerEvent('agree')
    },

    /**
     * 查看隐私指引详情
     */
    handleViewDetail() {
      wx.navigateTo({
        url: '/pages/privacy/privacy'
      })
    },

    /**
     * 拒绝隐私指引
     */
    handleDisagree() {
      wx.showModal({
        title: '提示',
        content: '您需要同意隐私保护指引才能使用本小程序',
        showCancel: false,
        confirmText: '我知道了'
      })
    }
  }
})
