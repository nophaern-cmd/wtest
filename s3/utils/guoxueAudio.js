/**
 * 国学音频播放工具
 * 支持下载在线音频到持久缓存并播放
 */

// 音频源配置（可选择不同的 CDN 源）
const AUDIO_SOURCES = {
  // GitHub Raw（国内可能无法访问）
  github: 'https://raw.githubusercontent.com/nophaern-cmd/wtest/sa/sa/app/src/main/assets/js/data/audio',
  // jsDelivr CDN（推荐，国内可访问）
  jsdelivr: 'https://cdn.jsdelivr.net/gh/nophaern-cmd/wtest@sa/sa/app/src/main/assets/js/data/audio',
  // ghproxy 代理（备用）
  ghproxy: 'https://ghproxy.com/https://raw.githubusercontent.com/nophaern-cmd/wtest/sa/sa/app/src/main/assets/js/data/audio',
  // fastgit 镜像（备用）
  fastgit: 'https://raw.fastgit.org/nophaern-cmd/wtest/sa/sa/app/src/main/assets/js/data/audio'
}

// 当前使用的音频源（默认使用 jsDelivr，国内可直接访问）
let currentSource = 'jsdelivr'

// 音频基础 URL
const AUDIO_BASE_URL = AUDIO_SOURCES[currentSource]

// 缓存键前缀
const CACHE_KEY_PREFIX = 'guoxue_audio_cache_'
const CACHE_SIZE_KEY = 'guoxue_audio_cache_size'

// 内存缓存（快速访问）
const memoryCache = {}

/**
 * 获取音频文件名
 * @param {string} type - 类型：'sanzijing' 或 'poems'
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
  const baseUrl = AUDIO_SOURCES[currentSource]
  return `${baseUrl}/${encodeURIComponent(fileName)}`
}

/**
 * 获取缓存存储键
 */
function getCacheKey(fileName) {
  return CACHE_KEY_PREFIX + fileName
}

/**
 * 检查缓存是否存在
 */
function hasCache(fileName) {
  // 先检查内存缓存
  if (memoryCache[fileName]) return true
  // 再检查持久缓存
  const cacheKey = getCacheKey(fileName)
  const cached = wx.getStorageSync(cacheKey)
  if (cached && cached.path) {
    // 验证文件是否真实存在
    const fs = wx.getFileSystemManager()
    try {
      fs.accessSync(cached.path)
      memoryCache[fileName] = cached.path
      return true
    } catch (e) {
      // 文件不存在，清理无效缓存记录
      console.log('缓存文件不存在，清理记录:', fileName)
      wx.removeStorageSync(cacheKey)
      return false
    }
  }
  return false
}

/**
 * 获取缓存路径
 */
function getCachePath(fileName) {
  if (memoryCache[fileName]) {
    return memoryCache[fileName]
  }
  const cacheKey = getCacheKey(fileName)
  const cached = wx.getStorageSync(cacheKey)
  if (cached && cached.path) {
    // 验证文件是否真实存在
    const fs = wx.getFileSystemManager()
    try {
      fs.accessSync(cached.path)
      memoryCache[fileName] = cached.path
      return cached.path
    } catch (e) {
      // 文件不存在，清理无效缓存记录
      console.log('缓存文件不存在，清理记录:', fileName)
      wx.removeStorageSync(cacheKey)
      return null
    }
  }
  return null
}

/**
 * 保存到缓存
 */
function saveToCache(fileName, tempPath, size) {
  const cacheKey = getCacheKey(fileName)
  const cacheData = {
    path: tempPath,
    size: size,
    time: Date.now()
  }
  
  try {
    wx.setStorageSync(cacheKey, cacheData)
    memoryCache[fileName] = tempPath
    
    // 更新总缓存大小
    const totalSize = wx.getStorageSync(CACHE_SIZE_KEY) || 0
    wx.setStorageSync(CACHE_SIZE_KEY, totalSize + size)
    
    console.log('音频已缓存:', fileName, '大小:', formatSize(size))
  } catch (e) {
    console.error('缓存保存失败:', e)
  }
}

/**
 * 删除单个缓存
 */
function removeCache(fileName) {
  const cacheKey = getCacheKey(fileName)
  const cached = wx.getStorageSync(cacheKey)
  
  if (cached && cached.path) {
    // 尝试删除文件
    const fs = wx.getFileSystemManager()
    try {
      fs.unlinkSync(cached.path)
    } catch (e) {
      console.log('删除文件失败:', e)
    }
    
    // 更新总缓存大小
    const totalSize = wx.getStorageSync(CACHE_SIZE_KEY) || 0
    wx.setStorageSync(CACHE_SIZE_KEY, Math.max(0, totalSize - (cached.size || 0)))
    
    // 删除存储记录
    wx.removeStorageSync(cacheKey)
    delete memoryCache[fileName]
  }
}

/**
 * 清除所有缓存
 */
function clearAllCache() {
  const res = wx.getStorageInfoSync()
  const keys = res.keys.filter(key => key.startsWith(CACHE_KEY_PREFIX))
  
  keys.forEach(key => {
    const cached = wx.getStorageSync(key)
    if (cached && cached.path) {
      const fs = wx.getFileSystemManager()
      try {
        fs.unlinkSync(cached.path)
      } catch (e) {}
    }
    wx.removeStorageSync(key)
  })
  
  wx.setStorageSync(CACHE_SIZE_KEY, 0)
  // 清空内存缓存
  Object.keys(memoryCache).forEach(key => delete memoryCache[key])
  
  return keys.length
}

/**
 * 获取缓存总大小
 */
function getCacheTotalSize() {
  return wx.getStorageSync(CACHE_SIZE_KEY) || 0
}

/**
 * 格式化文件大小
 */
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

/**
 * 获取当前音频源
 */
function getCurrentSource() {
  return currentSource
}

/**
 * 切换音频源
 * @param {string} source - 源名称：'github' | 'jsdelivr' | 'ghproxy' | 'fastgit'
 */
function switchSource(source) {
  if (AUDIO_SOURCES[source]) {
    currentSource = source
    console.log('音频源已切换为:', source, AUDIO_SOURCES[source])
    return true
  }
  return false
}

/**
 * 获取所有可用的音频源
 */
function getAvailableSources() {
  return Object.keys(AUDIO_SOURCES).map(key => ({
    name: key,
    url: AUDIO_SOURCES[key]
  }))
}

/**
 * 获取所有缓存列表
 */
function getCacheList() {
  const res = wx.getStorageInfoSync()
  const keys = res.keys.filter(key => key.startsWith(CACHE_KEY_PREFIX))
  const list = []
  
  keys.forEach(key => {
    const cached = wx.getStorageSync(key)
    if (cached) {
      const fileName = key.replace(CACHE_KEY_PREFIX, '')
      list.push({
        fileName,
        size: cached.size || 0,
        time: cached.time,
        sizeText: formatSize(cached.size || 0)
      })
    }
  })
  
  return list.sort((a, b) => b.time - a.time)
}

/**
 * 下载音频到本地缓存
 * @param {string} fileName - 音频文件名
 * @param {boolean} silent - 是否静默下载（不显示提示）
 * @returns {Promise<string>} 本地缓存路径
 */
function downloadAudio(fileName, silent = false) {
  return new Promise((resolve, reject) => {
    // 检查缓存
    const cachedPath = getCachePath(fileName)
    if (cachedPath) {
      console.log('使用缓存音频:', fileName)
      resolve(cachedPath)
      return
    }

    const url = getAudioUrl(fileName)
    console.log('下载音频:', url)

    if (!silent) {
      wx.showLoading({ title: '下载中...', mask: true })
    }

    wx.downloadFile({
      url: url,
      success: (res) => {
        if (res.statusCode === 200) {
          const tempFilePath = res.tempFilePath
          
          // 保存到持久缓存
          wx.saveFile({
            tempFilePath: tempFilePath,
            success: (saveRes) => {
              const savedPath = saveRes.savedFilePath
              
              // 获取文件大小
              const fs = wx.getFileSystemManager()
              let fileSize = 0
              try {
                const stat = fs.statSync(savedPath)
                fileSize = stat.size
              } catch (e) {}
              
              saveToCache(fileName, savedPath, fileSize)
              
              if (!silent) {
                wx.hideLoading()
                wx.showToast({ title: '下载成功', icon: 'success' })
              }
              
              resolve(savedPath)
            },
            fail: (err) => {
              if (!silent) wx.hideLoading()
              // 如果保存失败，使用临时文件
              console.log('保存失败，使用临时文件')
              resolve(tempFilePath)
            }
          })
        } else {
          if (!silent) wx.hideLoading()
          reject(new Error(`下载失败，状态码: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        if (!silent) wx.hideLoading()
        console.error('音频下载失败:', err)
        reject(err)
      }
    })
  })
}

/**
 * 预下载下一片段
 */
function preloadAudio(fileName) {
  if (hasCache(fileName)) {
    return Promise.resolve()
  }
  
  console.log('预下载:', fileName)
  return downloadAudio(fileName, true).catch(() => {})
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
    this.preloadTimer = null
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
      
      // 预下载下一片段
      this.preloadNext()
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
   * 预下载下一片段
   */
  preloadNext() {
    const nextIndex = this.queueIndex + 1
    if (nextIndex < this.playQueue.length) {
      const nextUrl = this.playQueue[nextIndex]
      // 从 URL 提取文件名
      const fileName = decodeURIComponent(nextUrl.split('/').pop())
      preloadAudio(fileName)
    }
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
      // 从 URL 提取文件名
      const fileName = decodeURIComponent(audioUrl.split('/').pop())
      const localPath = await downloadAudio(fileName)
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
    if (this.preloadTimer) {
      clearTimeout(this.preloadTimer)
      this.preloadTimer = null
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
}

/**
 * 创建国学音频播放器实例
 */
function createGuoxuePlayer() {
  return new GuoxueAudioPlayer()
}

/**
 * 批量下载章节音频
 */
function downloadChapterAudio(type, index, progressCallback) {
  return new Promise((resolve, reject) => {
    const app = getApp()
    const guoxue = app.globalData.guoxue
    const list = type === 'sanzijing' ? guoxue.sanzijing : guoxue.poems
    const item = list[index]
    
    if (!item) {
      reject(new Error('章节不存在'))
      return
    }
    
    const name = item.audioName || item.title.replace(/^第[一二三四五六七八九十]+章\s*/, '')
    const contentTypes = ['正文', '解释', '关键词', '故事']
    const files = contentTypes.map(ct => getAudioFileName(type, index + 1, name, ct))
    
    let completed = 0
    const total = files.length
    const results = []
    
    const downloadNext = (i) => {
      if (i >= files.length) {
        resolve(results)
        return
      }
      
      const fileName = files[i]
      if (hasCache(fileName)) {
        completed++
        results.push({ fileName, cached: true })
        if (progressCallback) {
          progressCallback(completed, total, fileName)
        }
        downloadNext(i + 1)
        return
      }
      
      downloadAudio(fileName, true)
        .then(path => {
          completed++
          results.push({ fileName, cached: false, path })
          if (progressCallback) {
            progressCallback(completed, total, fileName)
          }
          downloadNext(i + 1)
        })
        .catch(err => {
          completed++
          results.push({ fileName, error: err.message })
          if (progressCallback) {
            progressCallback(completed, total, fileName)
          }
          downloadNext(i + 1)
        })
    }
    
    downloadNext(0)
  })
}

module.exports = {
  GuoxueAudioPlayer,
  createGuoxuePlayer,
  getAudioFileName,
  getAudioUrl,
  downloadAudio,
  preloadAudio,
  hasCache,
  getCachePath,
  removeCache,
  clearAllCache,
  getCacheTotalSize,
  getCacheList,
  formatSize,
  downloadChapterAudio,
  // 音频源管理
  getCurrentSource,
  switchSource,
  getAvailableSources,
  AUDIO_SOURCES
}
