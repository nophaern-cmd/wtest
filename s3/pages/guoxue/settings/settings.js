const app = getApp()

// 默认设置
const defaultSettings = {
  showExplanation: true,
  showNotes: true,
  showStories: true,
  playContent: true,
  playExplanation: true,
  playNotes: false,
  playStories: false,
  playMode: 'single',
  autoStop: 0
}

Page({
  data: {
    settings: { ...defaultSettings },
    countdown: 0
  },

  onLoad(options) {
    // 从全局或缓存加载设置
    const savedSettings = wx.getStorageSync('guoxueSettings')
    if (savedSettings) {
      this.setData({ settings: savedSettings })
    }
  },

  onShow() {
    // 获取倒计时状态
    const countdown = app.globalData.guoxueCountdown || 0
    this.setData({ countdown })
  },

  toggleSetting(e) {
    const key = e.currentTarget.dataset.key
    const settings = { ...this.data.settings }
    settings[key] = !settings[key]
    
    this.setData({ settings })
    this.saveSettings()
  },

  setPlayMode(e) {
    const mode = e.currentTarget.dataset.mode
    const settings = { ...this.data.settings, playMode: mode }
    
    this.setData({ settings })
    this.saveSettings()
  },

  setAutoStop(e) {
    const minutes = parseInt(e.currentTarget.dataset.minutes)
    const settings = { ...this.data.settings, autoStop: minutes }
    
    this.setData({ settings })
    this.saveSettings()
    
    // 通知主页面
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    if (prevPage && prevPage.updateAutoStop) {
      prevPage.updateAutoStop(minutes)
    }
  },

  saveSettings() {
    wx.setStorageSync('guoxueSettings', this.data.settings)
    
    // 更新全局数据
    app.globalData.guoxueSettings = this.data.settings
    
    // 通知主页面
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    if (prevPage && prevPage.updateSettings) {
      prevPage.updateSettings(this.data.settings)
    }
  }
})
