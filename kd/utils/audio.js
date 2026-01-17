/**
 * 音频播放工具类
 * 统一管理音频播放功能
 */

/**
 * 音频源配置
 */
const AUDIO_SOURCES = [
  {
    name: '有道美式',
    getUrl: (text) => `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=2`
  },
  {
    name: '有道英式',
    getUrl: (text) => `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=1`
  },
  {
    name: 'Google',
    getUrl: (text) => `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encodeURIComponent(text)}`
  }
]

/**
 * 音频播放器类
 */
class AudioPlayer {
  constructor() {
    this.audioContext = null
    this.currentUrl = ''
    this.isPlaying = false
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
      console.log('音频已就绪，开始播放')
      wx.hideToast()
      this.audioContext.play()
    })

    this.audioContext.onPlay(() => {
      this.isPlaying = true
      console.log('音频正在播放')
    })

    this.audioContext.onPause(() => {
      this.isPlaying = false
      console.log('音频已暂停')
    })

    this.audioContext.onEnded(() => {
      this.isPlaying = false
      console.log('音频播放结束')
      this.destroy()
    })

    this.audioContext.onError((res) => {
      console.log('音频播放失败:', res)
      this.isPlaying = false
      this.destroy()
      wx.hideToast()
      wx.showToast({
        title: '播放失败',
        icon: 'none',
        duration: 2000
      })
    })
  }

  /**
   * 播放文本（递归尝试多个音频源）
   * @param {string} text - 要播放的文本
   * @param {number} sourceIndex - 音频源索引
   */
  playText(text, sourceIndex = 0) {
    if (sourceIndex >= AUDIO_SOURCES.length) {
      wx.showToast({
        title: '朗读失败',
        icon: 'none',
        duration: 2000
      })
      return
    }

    const source = AUDIO_SOURCES[sourceIndex]
    const url = source.getUrl(text)

    console.log(`尝试播放音频 (${source.name}):`, url)

    wx.showToast({
      title: '正在播放...',
      icon: 'loading',
      duration: 10000
    })

    this.createAudioContext()
    this.audioContext.src = url
    this.currentUrl = url
  }

  /**
   * 播放音频URL
   * @param {string} url - 音频URL
   */
  playUrl(url) {
    console.log('播放音频:', url)

    wx.showToast({
      title: '正在播放...',
      icon: 'loading',
      duration: 10000
    })

    this.createAudioContext()
    this.audioContext.src = url
    this.currentUrl = url
  }

  /**
   * 暂停播放
   */
  pause() {
    if (this.audioContext && this.isPlaying) {
      this.audioContext.pause()
      wx.showToast({
        title: '已暂停',
        icon: 'none',
        duration: 1000
      })
    }
  }

  /**
   * 继续播放
   */
  resume() {
    if (this.audioContext && !this.isPlaying) {
      this.audioContext.play()
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

  /**
   * 获取播放状态
   * @returns {boolean} 是否正在播放
   */
  getIsPlaying() {
    return this.isPlaying
  }
}

/**
 * 创建音频播放器实例
 * @returns {AudioPlayer} 音频播放器实例
 */
function createPlayer() {
  return new AudioPlayer()
}

/**
 * 快速播放文本（使用默认播放器）
 * @param {string} text - 要播放的文本
 */
function playText(text) {
  const player = createPlayer()
  player.playText(text)
  return player
}

/**
 * TTS播放（使用微信语音合成）
 * @param {string} text - 要播放的文本
 * @param {Object} options - 配置选项
 */
function speakTTS(text, options = {}) {
  const { lang = 'en-US' } = options

  if (typeof wx.createTtsContext !== 'function') {
    wx.showToast({
      title: '语音功能暂不可用',
      icon: 'none'
    })
    return false
  }

  try {
    const tts = wx.createTtsContext()
    tts.speak({
      text,
      lang,
      success: () => {
        console.log('TTS播放成功')
      },
      fail: (err) => {
        console.log('TTS播放失败:', err)
        wx.showToast({
          title: '播放失败',
          icon: 'none'
        })
      }
    })
    return true
  } catch (error) {
    console.error('TTS初始化失败:', error)
    return false
  }
}

module.exports = {
  AudioPlayer,
  createPlayer,
  playText,
  speakTTS
}
