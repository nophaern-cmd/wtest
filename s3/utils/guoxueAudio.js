/**
 * 国学音频播放工具
 * 支持下载在线音频到持久缓存并播放（支持后台播放）
 * 当前播放使用CDN，预下载使用GitHub源
 */

// 当前播放使用的CDN源（国内快速访问）
const PLAY_BASE_URL = 'https://lian-1394056348.cos.ap-beijing.myqcloud.com/guoxue/audio'

// 预下载使用的GitHub源
const PRELOAD_BASE_URL = 'https://raw.githubusercontent.com/nophaern-cmd/wtest/sa/sa/app/src/main/assets/js/data/audio'

// 缓存键前缀
const CACHE_KEY_PREFIX = 'guoxue_audio_cache_'
const CACHE_SIZE_KEY = 'guoxue_audio_cache_size'

// 内存缓存（快速访问）
const memoryCache = {}

// 正在进行的预下载任务
const preloadingTasks = {}

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
 * 获取播放用的音频URL（CDN）
 */
function getPlayUrl(fileName) {
  return `${PLAY_BASE_URL}/${encodeURIComponent(fileName)}`
}

/**
 * 获取预下载用的音频URL（GitHub）
 */
function getPreloadUrl(fileName) {
  return `${PRELOAD_BASE_URL}/${encodeURIComponent(fileName)}`
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
  
  // 取消正在进行的预下载
  cancelPreload(fileName)
  
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
  // 取消所有预下载
  Object.keys(preloadingTasks).forEach(key => {
    cancelPreload(key)
  })
  
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
 * 取消预下载任务
 */
function cancelPreload(fileName) {
  const task = preloadingTasks[fileName]
  if (task) {
    console.log('取消预下载:', fileName)
    task.aborted = true
    delete preloadingTasks[fileName]
  }
}

/**
 * 检查是否正在预下载
 */
function isPreloading(fileName) {
  return !!preloadingTasks[fileName]
}

/**
 * 获取所有正在进行的下载任务
 */
function getPreloadingTasks() {
  return Object.keys(preloadingTasks).map(fileName => ({
    fileName,
    aborted: preloadingTasks[fileName].aborted
  }))
}

/**
 * 取消所有下载任务
 */
function cancelAllPreloads() {
  Object.keys(preloadingTasks).forEach(fileName => {
    cancelPreload(fileName)
  })
}

/**
 * 下载音频到本地缓存（用于播放，使用CDN源）
 * @param {string} fileName - 音频文件名
 * @param {boolean} silent - 是否静默下载（不显示提示）
 * @returns {Promise<string>} 本地缓存路径
 */
function downloadAudioForPlay(fileName, silent = false) {
  return new Promise((resolve, reject) => {
    // 检查缓存
    const cachedPath = getCachePath(fileName)
    if (cachedPath) {
      console.log('使用缓存音频:', fileName)
      resolve(cachedPath)
      return
    }

    // 如果正在预下载，取消预下载
    if (isPreloading(fileName)) {
      cancelPreload(fileName)
    }

    const url = getPlayUrl(fileName)
    console.log('CDN下载音频:', url)

    if (!silent) {
      wx.showLoading({ title: '下载中...', mask: true })
    }

    const downloadTask = wx.downloadFile({
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
 * 预下载音频（使用GitHub源，可被取消）
 * @param {string} fileName - 音频文件名
 * @returns {Promise<string>} 本地缓存路径
 */
function preloadAudio(fileName) {
  // 已缓存则跳过
  if (hasCache(fileName)) {
    return Promise.resolve(getCachePath(fileName))
  }
  
  // 正在预下载则等待
  if (preloadingTasks[fileName]) {
    return preloadingTasks[fileName].promise
  }
  
  console.log('预下载(GitHub):', fileName)
  
  const task = { aborted: false }
  const url = getPreloadUrl(fileName)
  
  task.promise = new Promise((resolve, reject) => {
    const downloadTask = wx.downloadFile({
      url: url,
      success: (res) => {
        if (task.aborted) {
          console.log('预下载已取消:', fileName)
          reject(new Error('预下载已取消'))
          return
        }
        
        if (res.statusCode === 200) {
          const tempFilePath = res.tempFilePath
          
          // 再次检查是否被取消
          if (task.aborted) {
            reject(new Error('预下载已取消'))
            return
          }
          
          wx.saveFile({
            tempFilePath: tempFilePath,
            success: (saveRes) => {
              const savedPath = saveRes.savedFilePath
              
              const fs = wx.getFileSystemManager()
              let fileSize = 0
              try {
                const stat = fs.statSync(savedPath)
                fileSize = stat.size
              } catch (e) {}
              
              saveToCache(fileName, savedPath, fileSize)
              delete preloadingTasks[fileName]
              resolve(savedPath)
            },
            fail: (err) => {
              delete preloadingTasks[fileName]
              // 保存失败，使用临时文件
              resolve(tempFilePath)
            }
          })
        } else {
          delete preloadingTasks[fileName]
          reject(new Error(`预下载失败，状态码: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        delete preloadingTasks[fileName]
        console.log('预下载失败:', fileName, err)
        reject(err)
      }
    })
    
    task.downloadTask = downloadTask
  })
  
  preloadingTasks[fileName] = task
  return task.promise
}

/**
 * 国学音频播放器类（支持后台播放）
 */
class GuoxueAudioPlayer {
  constructor() {
    this.bgAudioManager = null
    this.isPlaying = false
    this.playQueue = []
    this.queueIndex = 0
    this.callbacks = {}
    this.currentInfo = null
    this.currentType = null
    this.currentIndex = null
  }

  /**
   * 获取后台音频管理器
   */
  getBgAudioManager() {
    if (!this.bgAudioManager) {
      this.bgAudioManager = wx.getBackgroundAudioManager()
      this.setupEvents()
    }
    return this.bgAudioManager
  }

  /**
   * 设置音频事件监听
   */
  setupEvents() {
    const manager = this.bgAudioManager

    manager.onPlay(() => {
      this.isPlaying = true
      console.log('后台音频正在播放')
      wx.hideToast()
      // 预下载下一片段（跨章节）
      this.preloadNext()
    })

    manager.onEnded(() => {
      console.log('后台音频播放结束')
      this.playNext()
    })

    manager.onError((res) => {
      console.log('后台音频播放失败:', res)
      this.isPlaying = false
      setTimeout(() => this.playNext(), 300)
    })

    manager.onStop(() => {
      console.log('后台音频停止')
      this.isPlaying = false
    })

    manager.onPrev(() => {
      console.log('点击上一首')
    })

    manager.onNext(() => {
      console.log('点击下一首')
      this.playNext()
    })
  }

  /**
   * 预下载下一片段（支持跨章节）
   */
  preloadNext() {
    // 预下载当前章节的下一个片段
    const nextIndex = this.queueIndex + 1
    if (nextIndex < this.playQueue.length) {
      const nextItem = this.playQueue[nextIndex]
      preloadAudio(nextItem.fileName).catch(() => {})
    }
    
    // 如果是当前章节最后一个片段，预下载下一章的第一部分
    if (nextIndex >= this.playQueue.length) {
      this.preloadNextChapter()
    }
  }

  /**
   * 预下载下一章的第一部分
   */
  preloadNextChapter() {
    const app = getApp()
    const guoxue = app.globalData.guoxue
    if (!guoxue || !this.currentType) return
    
    const list = this.currentType === 'sanzijing' ? guoxue.sanzijing : guoxue.poems
    const nextChapterIndex = this.currentIndex + 1
    
    // 如果还有下一章
    if (nextChapterIndex < list.length) {
      const nextItem = list[nextChapterIndex]
      const name = nextItem.audioName || nextItem.title.replace(/^第[一二三四五六七八九十]+章\s*/, '')
      
      // 预下载下一章的正文
      const fileName = getAudioFileName(this.currentType, nextChapterIndex + 1, name, '正文')
      console.log('跨章节预下载:', fileName)
      preloadAudio(fileName).catch(() => {})
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
  async playQueueItem(item) {
    try {
      let localPath = getCachePath(item.fileName)
      
      // 只有缓存不存在时才使用CDN下载
      if (!localPath) {
        // 如果正在预下载，取消预下载
        if (isPreloading(item.fileName)) {
          cancelPreload(item.fileName)
        }
        localPath = await downloadAudioForPlay(item.fileName)
      }
      
      const manager = this.getBgAudioManager()
      
      // 设置后台音频信息（锁屏界面显示）
      manager.title = item.title || '国学学习'
      manager.singer = item.singer || '国学启蒙'
      manager.epname = item.epname || '国学经典'
      manager.coverImgUrl = 'https://lian-1394056348.cos.ap-beijing.myqcloud.com/guoxue/logo.png'
      manager.src = localPath
      
      this.currentInfo = item
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
    this.currentType = type
    this.currentIndex = index

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
      
      this.playQueue.push({
        fileName,
        title: `${item.title} - ${contentType}`,
        singer: item.author || '国学',
        epname: type === 'sanzijing' ? '三字经' : '古诗词'
      })
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
    const manager = this.getBgAudioManager()
    manager.pause()
    this.isPlaying = false
  }

  /**
   * 恢复播放
   */
  resume() {
    const manager = this.getBgAudioManager()
    manager.play()
    this.isPlaying = true
  }

  /**
   * 停止播放
   */
  stop() {
    const manager = this.getBgAudioManager()
    try {
      manager.stop()
    } catch (e) {}
    this.isPlaying = false
    this.playQueue = []
    this.queueIndex = 0
    this.callbacks = {}
  }

  /**
   * 销毁
   */
  destroy() {
    this.stop()
    this.bgAudioManager = null
  }
}

/**
 * 创建国学音频播放器实例
 */
function createGuoxuePlayer() {
  return new GuoxueAudioPlayer()
}

/**
 * 批量下载章节音频（使用GitHub源）
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
      
      // 使用GitHub源下载
      preloadAudio(fileName)
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
  getPlayUrl,
  downloadAudioForPlay,
  preloadAudio,
  cancelPreload,
  cancelAllPreloads,
  isPreloading,
  getPreloadingTasks,
  hasCache,
  getCachePath,
  removeCache,
  clearAllCache,
  getCacheTotalSize,
  getCacheList,
  formatSize,
  downloadChapterAudio
}
