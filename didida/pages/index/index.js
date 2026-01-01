// pages/index/index.js
const app = getApp()

Page({
  data: {
    currentStage: 'kindergarten', // 当前选中的阶段
    selectedStage: '',            // 本次选中的阶段
    level: 'kindergarten'         // 当前学习等级
  },

  onLoad() {
    this.initPage()
  },

  onShow() {
    // 每次显示时刷新
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        currentStage: userInfo.level,
        level: userInfo.level
      })
      this.updatePageStyle(userInfo.level)
    }
  },

  // 初始化页面
  initPage() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        currentStage: userInfo.level,
        level: userInfo.level,
        selectedStage: userInfo.level
      })
      this.updatePageStyle(userInfo.level)
    }
  },

  // 更新页面样式
  updatePageStyle(level) {
    const navigationBarColors = {
      kindergarten: '#FF9F43',
      primary: '#54A0FF',
      middle: '#5F27CD'
    }

    const backgroundColors = {
      kindergarten: '#FFF5F0',
      primary: '#F0F7FF',
      middle: '#F5F0FA'
    }

    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: navigationBarColors[level] || '#FF9F43'
    })

    wx.setBackgroundColor({
      backgroundColor: backgroundColors[level] || '#FFF5F0'
    })
  },

  // 选择阶段
  selectStage(e) {
    const stage = e.currentTarget.dataset.stage

    // 震动反馈
    wx.vibrateShort({
      type: 'light'
    })

    // 保存选择的阶段
    const userInfo = wx.getStorageSync('userInfo') || {}
    userInfo.level = stage
    wx.setStorageSync('userInfo', userInfo)

    // 直接跳转到模式选择页面
    wx.navigateTo({
      url: `/pages/mode-select/mode-select?stage=${stage}`
    })
  },
})
