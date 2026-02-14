// 国学朗读页面 - 完整实现
const app = getApp()
const { createGuoxuePlayer } = require('../../utils/guoxueAudio')

// 设置默认值（与 settings.js 保持一致）
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
    guoxue: null,
    currentType: 'sanzijing',
    currentIndex: 0,
    currentLesson: null,
    settings: { ...defaultSettings },
    isPlaying: false,
    isPaused: false,
    countdown: 0,
    countdownText: '',
    progress: ''
  },

  audioPlayer: null,
  autoStopTimer: null,
  countdownTimer: null,
  autoPlayTimeout: null,

  onLoad(options) {
    this.initSettings()
    this.loadData(options)
  },

  onShow() {
    this.refreshSettings()
  },

  onUnload() {
    this.stopAll()
    this.clearAutoStopTimers()
  },

  // 首次加载时初始化设置（重置定时停止）
  initSettings() {
    try {
      const saved = wx.getStorageSync('guoxueSettings')
      if (saved) {
        // 重启后重置定时停止，不保留之前的设置
        this.setData({ 
          settings: { ...defaultSettings, ...saved, autoStop: 0 },
          countdown: 0,
          countdownText: ''
        })
      }
      // 首次加载时清除可能残留的定时器
      this.clearAutoStopTimers()
    } catch (e) {
      console.error('加载设置失败:', e)
    }
  },

  // 从其他页面返回时刷新设置（保留定时停止状态）
  refreshSettings() {
    try {
      const saved = wx.getStorageSync('guoxueSettings')
      if (saved) {
        // 保留当前的 autoStop 状态，只更新其他设置
        const currentAutoStop = this.data.settings.autoStop
        this.setData({ 
          settings: { ...defaultSettings, ...saved, autoStop: currentAutoStop }
        })
      }
    } catch (e) {
      console.error('刷新设置失败:', e)
    }
  },

  loadData(options = {}) {
    const data = app.globalData.guoxue
    let currentType = options.type || this.data.currentType
    let currentIndex = parseInt(options.index) || 0
    
    const list = currentType === 'sanzijing' ? data.sanzijing : data.poems
    
    // 确保 index 在有效范围内
    if (currentIndex < 0) currentIndex = 0
    if (currentIndex >= list.length) currentIndex = list.length - 1
    
    if (list && list.length > 0) {
      this.setData({
        guoxue: data,
        currentType,
        currentIndex,
        currentLesson: list[currentIndex],
        progress: `${currentIndex + 1} / ${list.length}`
      })
    }
  },

  // 从目录页面选择章节
  selectLesson(type, index) {
    const data = app.globalData.guoxue
    const list = type === 'sanzijing' ? data.sanzijing : data.poems
    
    this.stopAll()
    this.setData({
      currentType: type,
      currentIndex: index,
      currentLesson: list[index],
      progress: `${index + 1} / ${list.length}`
    })
  },

  // 从设置页面更新设置
  updateSettings(settings) {
    this.setData({ settings })
  },

  // 从设置页面更新定时停止
  updateAutoStop(minutes) {
    this.clearAutoStopTimers()
    
    // 更新 settings.autoStop 的值
    const newSettings = { ...this.data.settings, autoStop: minutes }
    
    if (minutes > 0) {
      this.autoStopTimer = setTimeout(() => {
        this.stopAll()
        this.setData({ 
          countdown: 0, 
          countdownText: '',
          settings: { ...this.data.settings, autoStop: 0 } 
        })
      }, minutes * 60 * 1000)
      this.startCountdown(minutes * 60)
      this.setData({ settings: newSettings })
    } else {
      this.setData({ 
        countdown: 0, 
        countdownText: '', 
        settings: newSettings 
      })
    }
  },

  // 滑动切换
  onSwiperChange(e) {
    const index = e.detail.current
    const data = app.globalData.guoxue
    const list = this.data.currentType === 'sanzijing' ? data.sanzijing : data.poems
    
    this.stopAll()
    this.setData({
      currentIndex: index,
      currentLesson: list[index],
      progress: `${index + 1} / ${list.length}`
    })
  },

  // 点击内容区域切换
  onContentTap(e) {
    const { windowWidth } = wx.getSystemInfoSync()
    const tapX = e.detail.x
    const third = windowWidth / 3
    
    if (tapX < third) {
      // 点击左侧 - 上一章
      this.prevChapter()
    } else if (tapX > windowWidth - third) {
      // 点击右侧 - 下一章
      this.nextChapter()
    }
  },

  // 上一章
  prevChapter() {
    if (this.data.currentIndex > 0) {
      const newIndex = this.data.currentIndex - 1
      const data = app.globalData.guoxue
      const list = this.data.currentType === 'sanzijing' ? data.sanzijing : data.poems
      
      this.stopAll()
      this.setData({
        currentIndex: newIndex,
        currentLesson: list[newIndex],
        progress: `${newIndex + 1} / ${list.length}`
      })
    }
  },

  // 下一章
  nextChapter() {
    const data = app.globalData.guoxue
    const list = this.data.currentType === 'sanzijing' ? data.sanzijing : data.poems
    
    if (this.data.currentIndex < list.length - 1) {
      const newIndex = this.data.currentIndex + 1
      
      this.stopAll()
      this.setData({
        currentIndex: newIndex,
        currentLesson: list[newIndex],
        progress: `${newIndex + 1} / ${list.length}`
      })
    }
  },

  goToCatalog() {
    wx.navigateTo({
      url: `/pages/guoxue/catalog/catalog?type=${this.data.currentType}&index=${this.data.currentIndex}`
    })
  },

  goToSettings() {
    wx.navigateTo({
      url: '/pages/guoxue/settings/settings'
    })
  },

  startCountdown(seconds) {
    this.setData({ countdown: seconds, countdownText: this.formatTime(seconds) })
    this.countdownTimer = setInterval(() => {
      const remaining = this.data.countdown - 1
      if (remaining <= 0) {
        clearInterval(this.countdownTimer)
        this.setData({ countdown: 0, countdownText: '' })
      } else {
        this.setData({ countdown: remaining, countdownText: this.formatTime(remaining) })
      }
    }, 1000)
  },

  formatTime(seconds) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) {
      return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }
    return `${m}:${String(s).padStart(2, '0')}`
  },

  clearAutoStopTimers() {
    if (this.autoStopTimer) {
      clearTimeout(this.autoStopTimer)
      this.autoStopTimer = null
    }
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
      this.countdownTimer = null
    }
  },

  togglePlay() {
    if (this.data.isPlaying) {
      this.pause()
    } else if (this.data.isPaused) {
      this.resume()
    } else {
      this.play()
    }
  },

  play() {
    const lesson = this.data.currentLesson
    if (!lesson) return
    
    this.setData({ isPlaying: true, isPaused: false })
    
    if (!this.audioPlayer) {
      this.audioPlayer = createGuoxuePlayer()
    }
    
    const contents = this.getPlayContents(lesson)
    this.audioPlayer.play(contents, {
      type: this.data.currentType,
      index: this.data.currentIndex,
      onEnd: () => this.onPlayEnd(),
      onError: () => this.onPlayError()
    })
  },

  pause() {
    if (this.audioPlayer) {
      this.audioPlayer.pause()
    }
    this.setData({ isPlaying: false, isPaused: true })
  },

  resume() {
    if (this.audioPlayer) {
      this.audioPlayer.resume()
    }
    this.setData({ isPlaying: true, isPaused: false })
  },

  stopAll() {
    if (this.audioPlayer) {
      this.audioPlayer.stop()
    }
    if (this.autoPlayTimeout) {
      clearTimeout(this.autoPlayTimeout)
      this.autoPlayTimeout = null
    }
    this.setData({ isPlaying: false, isPaused: false })
  },

  onPlayEnd() {
    this.setData({ isPlaying: false, isPaused: false })
    
    const mode = this.data.settings.playMode
    switch (mode) {
      case 'single':
        break
      case 'chapterLoop':
        this.autoPlayTimeout = setTimeout(() => this.play(), 500)
        break
      case 'allOnce':
        this.playNextChapter(false)
        break
      case 'allLoop':
        this.playNextChapter(true)
        break
    }
  },

  onPlayError() {
    this.setData({ isPlaying: false, isPaused: false })
    wx.showToast({ title: '播放失败', icon: 'none' })
  },

  getPlayContents(lesson) {
    const contents = []
    const settings = this.data.settings
    
    if (settings.playContent) {
      contents.push({ type: 'content', text: this.buildContentText(lesson) })
    }
    if (settings.playExplanation && lesson.explanation) {
      contents.push({ type: 'explanation', text: '解释：' + lesson.explanation })
    }
    if (settings.playNotes && lesson.notes) {
      contents.push({ type: 'notes', text: '注释：' + lesson.notes })
    }
    if (settings.playStories && lesson.stories && lesson.stories.length > 0) {
      lesson.stories.forEach((story, index) => {
        // 传递故事索引，用于生成不同的音频文件名
        contents.push({ type: 'story', text: story.title + '。' + story.content, storyIndex: index + 1 })
      })
    }
    
    return contents
  },

  buildContentText(lesson) {
    let text = lesson.title + '。'
    if (lesson.author) {
      text += lesson.dynasty + '，' + lesson.author + '。'
    }
    text += lesson.content.replace(/\n\n/g, '。').replace(/\n/g, '，')
    return text
  },

  playNextChapter(loop) {
    const data = app.globalData.guoxue
    const list = this.data.currentType === 'sanzijing' ? data.sanzijing : data.poems
    let nextIndex = this.data.currentIndex + 1
    
    if (nextIndex >= list.length) {
      if (loop) {
        nextIndex = 0
      } else {
        return
      }
    }
    
    // 使用 setData 的回调确保数据更新后再播放
    this.setData({
      currentIndex: nextIndex,
      currentLesson: list[nextIndex],
      progress: `${nextIndex + 1} / ${list.length}`
    }, () => {
      // 数据更新完成后延迟播放
      this.autoPlayTimeout = setTimeout(() => this.play(), 300)
    })
  },

  goBack() {
    wx.navigateBack()
  }
})
