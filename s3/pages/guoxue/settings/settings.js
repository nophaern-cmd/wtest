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
    downloading: false,
    downloadProgress: '',
    currentSource: 'jsdelivr'
  },

  onLoad(options) {
    const savedSettings = wx.getStorageSync('guoxueSettings')
    if (savedSettings) {
      this.setData({ settings: savedSettings })
    }
    this.setData({ currentSource: audioUtils.getCurrentSource() })
    this.loadCacheInfo()
  },

  onShow() {
    const countdown = app.globalData.guoxueCountdown || 0
    this.setData({ countdown, countdownText: this.formatTime(countdown) })
    this.loadCacheInfo()
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

  // 切换音频源
  setAudioSource(e) {
    const source = e.currentTarget.dataset.source
    if (audioUtils.switchSource(source)) {
      this.setData({ currentSource: source })
      wx.showToast({ title: `已切换到 ${source}`, icon: 'success' })
    }
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
    wx.showToast({ title: '已删除', icon: 'success' })
  },

  // 预下载当前章节
  downloadCurrentChapter() {
    if (this.data.downloading) return
    
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    if (!prevPage) return
    
    const type = prevPage.data.currentType
    const index = prevPage.data.currentIndex
    
    if (type === undefined || index === undefined) {
      wx.showToast({ title: '请先选择章节', icon: 'none' })
      return
    }
    
    this.setData({ downloading: true, downloadProgress: '准备下载...' })
    
    audioUtils.downloadChapterAudio(type, index, (completed, total, fileName) => {
      this.setData({
        downloadProgress: `下载中 ${completed}/${total}`
      })
    }).then(results => {
      const success = results.filter(r => !r.error).length
      const cached = results.filter(r => r.cached).length
      this.setData({ downloading: false, downloadProgress: '' })
      this.loadCacheInfo()
      wx.showToast({ 
        title: cached > 0 ? `已缓存${cached}个，新下载${success - cached}个` : `下载完成 ${success} 个`, 
        icon: 'success' 
      })
    }).catch(err => {
      this.setData({ downloading: false, downloadProgress: '' })
      wx.showToast({ title: '下载失败', icon: 'none' })
    })
  },

  // 预下载所有章节
  downloadAllChapters() {
    if (this.data.downloading) return
    
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
    this.setData({ downloading: true, downloadProgress: '准备下载...' })
    
    const guoxue = app.globalData.guoxue
    const sanzijing = guoxue.sanzijing || []
    const poems = guoxue.poems || []
    const total = sanzijing.length + poems.length
    let completed = 0
    
    // 下载三字经
    for (let i = 0; i < sanzijing.length; i++) {
      try {
        await audioUtils.downloadChapterAudio('sanzijing', i, (c, t, f) => {})
        completed++
        this.setData({ downloadProgress: `下载中 ${completed}/${total}` })
      } catch (e) {}
      
      // 让 UI 有机会更新
      await new Promise(r => setTimeout(r, 100))
    }
    
    // 下载古诗
    for (let i = 0; i < poems.length; i++) {
      try {
        await audioUtils.downloadChapterAudio('poems', i, (c, t, f) => {})
        completed++
        this.setData({ downloadProgress: `下载中 ${completed}/${total}` })
      } catch (e) {}
      
      await new Promise(r => setTimeout(r, 100))
    }
    
    this.setData({ downloading: false, downloadProgress: '' })
    this.loadCacheInfo()
    wx.showToast({ title: '全部下载完成', icon: 'success' })
  }
})
