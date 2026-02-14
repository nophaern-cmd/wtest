const app = getApp()
const audioUtils = require('../../../utils/guoxueAudio')

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
    countdown: 0,
    countdownText: '',
    cacheSize: 0,
    cacheSizeText: '0 B',
    cacheList: [],
    showCacheDetail: false,
    // 正在进行的下载任务
    downloadingTasks: [],
    downloadingCount: 0
  },

  onLoad(options) {
    const savedSettings = wx.getStorageSync('guoxueSettings')
    if (savedSettings) {
      this.setData({ settings: savedSettings })
    }
    this.loadCacheInfo()
    this.loadDownloadingTasks()
  },

  onShow() {
    const countdown = app.globalData.guoxueCountdown || 0
    this.setData({ countdown, countdownText: this.formatTime(countdown) })
    this.loadCacheInfo()
    this.loadDownloadingTasks()
    
    // 定时刷新下载任务状态
    this.taskTimer = setInterval(() => {
      this.loadDownloadingTasks()
    }, 1000)
  },

  onUnload() {
    if (this.taskTimer) {
      clearInterval(this.taskTimer)
    }
  },

  onHide() {
    if (this.taskTimer) {
      clearInterval(this.taskTimer)
    }
  },

  formatTime(seconds) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${String(s).padStart(2, '0')}`
  },

  loadCacheInfo() {
    const totalSize = audioUtils.getCacheTotalSize()
    const cacheList = audioUtils.getCacheList()
    
    this.setData({
      cacheSize: totalSize,
      cacheSizeText: audioUtils.formatSize(totalSize),
      cacheList: cacheList.slice(0, 20) // 只显示最近20条
    })
  },

  loadDownloadingTasks() {
    const tasks = audioUtils.getPreloadingTasks()
    this.setData({
      downloadingTasks: tasks,
      downloadingCount: tasks.length
    })
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
    
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    if (prevPage && prevPage.updateAutoStop) {
      prevPage.updateAutoStop(minutes)
    }
  },

  saveSettings() {
    wx.setStorageSync('guoxueSettings', this.data.settings)
    app.globalData.guoxueSettings = this.data.settings
    
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    if (prevPage && prevPage.updateSettings) {
      prevPage.updateSettings(this.data.settings)
    }
  },

  // 显示/隐藏缓存详情
  toggleCacheDetail() {
    this.setData({ showCacheDetail: !this.data.showCacheDetail })
  },

  // 清除所有缓存
  clearCache() {
    wx.showModal({
      title: '确认清除',
      content: `确定要清除所有音频缓存吗？\n当前缓存: ${this.data.cacheSizeText}`,
      success: (res) => {
        if (res.confirm) {
          const count = audioUtils.clearAllCache()
          this.loadCacheInfo()
          this.loadDownloadingTasks()
          wx.showToast({ title: `已清除 ${count} 个文件`, icon: 'success' })
        }
      }
    })
  },

  // 删除单个缓存
  removeCacheItem(e) {
    const fileName = e.currentTarget.dataset.file
    audioUtils.removeCache(fileName)
    this.loadCacheInfo()
    this.loadDownloadingTasks()
    wx.showToast({ title: '已删除', icon: 'success' })
  },

  // 取消单个下载任务
  cancelDownloadTask(e) {
    const fileName = e.currentTarget.dataset.file
    audioUtils.cancelPreload(fileName)
    this.loadDownloadingTasks()
    wx.showToast({ title: '已取消', icon: 'success' })
  },

  // 取消所有下载任务
  cancelAllDownloads() {
    audioUtils.cancelAllPreloads()
    this.loadDownloadingTasks()
    wx.showToast({ title: '已取消所有下载', icon: 'success' })
  },

  // 下载当前章节
  downloadCurrentChapter() {
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    if (!prevPage) return
    
    const type = prevPage.data.currentType
    const index = prevPage.data.currentIndex
    
    if (type === undefined || index === undefined) {
      wx.showToast({ title: '请先选择章节', icon: 'none' })
      return
    }
    
    // 开始下载，退出页面后会继续
    audioUtils.downloadChapterAudio(type, index, (completed, total, fileName) => {
      // 下载进度回调
    }).then(results => {
      const success = results.filter(r => !r.error).length
      this.loadCacheInfo()
      this.loadDownloadingTasks()
    }).catch(err => {
      console.log('下载出错:', err)
    })
    
    wx.showToast({ title: '已开始下载', icon: 'success' })
    this.loadDownloadingTasks()
  },

  // 下载所有章节
  downloadAllChapters() {
    wx.showModal({
      title: '下载全部',
      content: '将下载所有三字经和古诗的音频文件，可能需要较长时间。确定继续？',
      success: (res) => {
        if (res.confirm) {
          this.doDownloadAll()
        }
      }
    })
  },

  async doDownloadAll() {
    const guoxue = app.globalData.guoxue
    const sanzijing = guoxue.sanzijing || []
    const poems = guoxue.poems || []
    
    wx.showToast({ title: '已开始后台下载', icon: 'success' })
    
    // 下载三字经
    for (let i = 0; i < sanzijing.length; i++) {
      audioUtils.downloadChapterAudio('sanzijing', i, (c, t, f) => {}).catch(() => {})
      await new Promise(r => setTimeout(r, 100))
    }
    
    // 下载古诗
    for (let i = 0; i < poems.length; i++) {
      audioUtils.downloadChapterAudio('poems', i, (c, t, f) => {}).catch(() => {})
      await new Promise(r => setTimeout(r, 100))
    }
    
    this.loadDownloadingTasks()
  }
})
