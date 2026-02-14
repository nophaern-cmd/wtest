/**
 * 国学音频播放工具
 * 支持下载在线音频到缓存并播放
 */

// 音频基础 URL (GitHub raw)
const AUDIO_BASE_URL = 'https://raw.githubusercontent.com/nophaern-cmd/wtest/sa/sa/app/src/main/assets/js/data/audio'

// 音频缓存管理
const audioCache = {}

/**
 * 获取音频文件名
 * @param {string} type - 类型：'poem' 或 'sanzi'
 * @param {number} index - 索引（从1开始）
 * @param {string} name - 名称（如：静夜思、人之初）
 * @param {string} contentType - 内容类型：正文、解释、关键词、故事
 * @returns {string} 音频文件名
 */
function getAudioFileName(type, index, name, contentType) {
  const prefix = type === 'sanzijing' ? 'sanzi' : 'poem'
  const num = String(index).padStart(2, '0')
  return `${prefix}_${num}_${name}_${contentType}.mp3`
}

/**
 * 获取音频完整 URL
 * @param {string} fileName - 音频文件名
 * @returns {string} 完整的音频 URL
 */
function getAudioUrl(fileName) {
  return `${AUDIO_BASE_URL}/${encodeURIComponent(fileName)}`
}

/**
 * 下载音频到本地缓存
 * @param {string} url - 音频 URL
 * @returns {Promise<string>} 本地缓存路径
 */
function downloadAudio(url) {
  return new Promise((resolve, reject) => {
    // 检查缓存
    if (audioCache[url]) {
      console.log('使用缓存音频:', audioCache[url])
      resolve(audioCache[url])
      return
    }

    console.log('下载音频:', url)

    wx.downloadFile({
      url: url,
      success: (res) => {
        if (res.statusCode === 200) {
          const tempFilePath = res.tempFilePath
          audioCache[url] = tempFilePath
          console.log('音频下载成功:', tempFilePath)
          resolve(tempFilePath)
        } else {
          reject(new Error(`下载失败，状态码: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        console.error('音频下载失败:', err)
        reject(err)
      }
    })
  })
}

/**
 * 国学音频播放器类
 */
class GuoxueAudioPlayer {
  constructor() {
    this.audioContext = null
    this.isPlaying = false
    this.playQueue = []
    this.queueIndex = 0
    this.callbacks = {}
  }

  /**
   * 创建音频上下文
   */
  createAudioContext() {
    if (this.audioContext) {
      this.destroy()
    }
    this.audioContext = wx.createInnerAudioContext()
    this.setupEvents()
    return this.audioContext
  }

  /**
   * 设置音频事件监听
   */
  setupEvents() {
    if (!this.audioContext) return

    this.audioContext.onCanplay(() => {
      console.log('音频已就绪')
      wx.hideToast()
      this.audioContext.play()
    })

    this.audioContext.onPlay(() => {
      this.isPlaying = true
      console.log('音频正在播放')
    })

    this.audioContext.onEnded(() => {
      console.log('音频播放结束')
      this.playNext()
    })

    this.audioContext.onError((res) => {
      console.log('音频播放失败:', res)
      this.isPlaying = false
      setTimeout(() => this.playNext(), 300)
    })
  }

  /**
   * 播放下一个音频
   */
  playNext() {
    this.queueIndex++
    if (this.queueIndex < this.playQueue.length) {
      this.playQueueItem(this.playQueue[this.queueIndex])
    } else {
      this.isPlaying = false
      this.playQueue = []
      this.queueIndex = 0
      if (this.callbacks.onEnd) {
        this.callbacks.onEnd()
      }
    }
  }

  /**
   * 播放队列中的单个音频
   */
  async playQueueItem(audioUrl) {
    try {
      const localPath = await downloadAudio(audioUrl)
      this.createAudioContext()
      this.audioContext.src = localPath
    } catch (error) {
      console.error('播放失败:', error)
      setTimeout(() => this.playNext(), 300)
    }
  }

  /**
   * 播放内容数组
   * @param {Array} contents - 内容数组 [{type, text}, ...]
   * @param {Object} options - 配置 {type, index, onEnd, onError}
   */
  play(contents, options = {}) {
    const { type, index, onEnd, onError } = options
    
    this.stop()
    this.callbacks = { onEnd, onError }
    this.playQueue = []
    this.queueIndex = 0

    // 获取名称（用于构建音频URL）
    const app = getApp()
    const guoxue = app.globalData.guoxue
    const list = type === 'sanzijing' ? guoxue.sanzijing : guoxue.poems
    const item = list[index]
    
    if (!item) {
      wx.showToast({ title: '数据错误', icon: 'none' })
      return
    }

    // 从标题提取名称
    const name = item.audioName || item.title.replace(/^第[一二三四五六七八九十]+章\s*/, '')

    // 构建播放队列
    const contentTypeMap = {
      'content': '正文',
      'explanation': '解释',
      'notes': '关键词',
      'story': '故事'
    }

    for (const content of contents) {
      const contentType = contentTypeMap[content.type] || content.type
      const fileName = getAudioFileName(type, index + 1, name, contentType)
      const audioUrl = getAudioUrl(fileName)
      this.playQueue.push(audioUrl)
    }

    if (this.playQueue.length === 0) {
      wx.showToast({ title: '暂无音频', icon: 'none' })
      if (onEnd) onEnd()
      return
    }

    wx.showToast({
      title: '加载音频...',
      icon: 'loading',
      duration: 10000
    })

    this.playQueueItem(this.playQueue[0])
  }

  /**
   * 暂停播放
   */
  pause() {
    if (this.audioContext) {
      this.audioContext.pause()
      this.isPlaying = false
    }
  }

  /**
   * 停止播放
   */
  stop() {
    if (this.audioContext) {
      this.audioContext.stop()
      this.destroy()
    }
    this.isPlaying = false
    this.playQueue = []
    this.queueIndex = 0
    this.callbacks = {}
  }

  /**
   * 销毁音频上下文
   */
  destroy() {
    if (this.audioContext) {
      this.audioContext.destroy()
      this.audioContext = null
      this.isPlaying = false
    }
  }
}

/**
 * 创建国学音频播放器实例
 */
function createGuoxuePlayer() {
  return new GuoxueAudioPlayer()
}

module.exports = {
  GuoxueAudioPlayer,
  createGuoxuePlayer,
  getAudioFileName,
  getAudioUrl,
  downloadAudio
}
