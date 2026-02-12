// 国学学习小游戏 - 主入口
const data = require('./utils/gameData.js')

// 获取画布和上下文
const canvas = tt.createCanvas()
const ctx = canvas.getContext('2d')

// 游戏状态
const gameState = {
  currentPage: 'menu', // menu, sanzijing, poems, detail
  currentLesson: 0,
  category: 'sanzijing',
  showNotes: true,
  scrollY: 0,
  maxScrollY: 0,
  isPlaying: false // 播放状态
}

// 音频播放器
let audioContext = null
let isUserStopped = false // 标记是否是用户主动停止
let currentUtterance = null // 当前播放的语音对象
let playQueue = [] // 播放队列
let currentPlayIndex = 0 // 当前播放索引
let bestVoice = null // 最佳语音对象

// 游戏数据
let currentData = null
let lessonData = null

// 初始化
function init() {
  // 设置画布尺寸
  const { windowWidth, windowHeight } = tt.getSystemInfoSync()
  canvas.width = windowWidth
  canvas.height = windowHeight
  
  // 加载数据
  data.loadData()
  currentData = data.getData()
  lessonData = currentData.sanzijing
  
  // 接入侧边栏复访能力
  initSidebarRevisit()
  
  // 绘制主菜单
  drawMenu()
  
  // 注册触摸事件
  registerTouchEvents()
}

// 初始化侧边栏复访能力
function initSidebarRevisit() {
  // 检查是否支持侧边栏复访
  if (tt.navigateToScene) {
    // 调用侧边栏复访能力
    tt.navigateToScene({
      scene: 'sidebar',
      success: function(res) {
        console.log('侧边栏复访接入成功', res)
      },
      fail: function(res) {
        console.log('侧边栏复访接入失败', res)
      }
    })
  } else {
    console.log('当前环境不支持侧边栏复访能力')
  }
}

// 绘制主菜单
function drawMenu() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // 背景
  ctx.fillStyle = '#fdf6e3'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // 标题
  ctx.fillStyle = '#8B5A2B'
  ctx.font = 'bold 32px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('国学学习', canvas.width / 2, 120)
  
  ctx.font = '20px Arial'
  ctx.fillStyle = '#a67c52'
  ctx.fillText('传承经典 启迪智慧', canvas.width / 2, 160)
  
  // 按钮
  drawButton(canvas.width / 2 - 100, 250, 200, 60, '三字经', '#8B5A2B')
  drawButton(canvas.width / 2 - 100, 340, 200, 60, '古诗词', '#8B5A2B')
  
  // 底部文字
  ctx.font = '16px Arial'
  ctx.fillStyle = '#c9a87c'
  ctx.fillText('让国学经典陪伴孩子成长', canvas.width / 2, canvas.height - 50)
  
  gameState.currentPage = 'menu'
}

// 绘制按钮
function drawButton(x, y, width, height, text, color) {
  ctx.fillStyle = '#fff'
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  
  // 手动绘制圆角矩形
  const radius = 10
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.arcTo(x + width, y, x + width, y + radius, radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius)
  ctx.lineTo(x + radius, y + height)
  ctx.arcTo(x, y + height, x, y + height - radius, radius)
  ctx.lineTo(x, y + radius)
  ctx.arcTo(x, y, x + radius, y, radius)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  
  ctx.fillStyle = color
  ctx.font = '24px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x + width / 2, y + height / 2)
}

// 绘制图标按钮
function drawIconButton(x, y, width, height, icon, color, isActive = false) {
  ctx.fillStyle = isActive ? '#f0e6d2' : '#fff'
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  
  // 手动绘制圆角矩形
  const radius = 10
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.arcTo(x + width, y, x + width, y + radius, radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius)
  ctx.lineTo(x + radius, y + height)
  ctx.arcTo(x, y + height, x, y + height - radius, radius)
  ctx.lineTo(x, y + radius)
  ctx.arcTo(x, y, x + radius, y, radius)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  
  // 绘制图标
  ctx.fillStyle = color
  ctx.font = '28px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(icon, x + width / 2, y + height / 2)
}

// 绘制学习页面
function drawLearnPage() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // 背景
  ctx.fillStyle = '#fdf6e3'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  const lesson = lessonData[gameState.currentLesson]
  
  // 计算总内容高度
  let totalHeight = 0
  const startY = 60
  totalHeight += 40 // 标题
  
  if (lesson.author) {
    totalHeight += 35
  }
  
  totalHeight += 20 // 间隔
  
  // 内容高度
  lesson.content.forEach(item => {
    totalHeight += 30 // 文本
    if (gameState.showNotes) {
      const noteLines = wrapText(item.note, canvas.width - 100, '14px Arial')
      totalHeight += noteLines.length * 18 + 15
    }
  })
  
  totalHeight += 50 // 解读标题
  
  const explanationLines = wrapText(lesson.explanation, canvas.width - 80, '16px Arial')
  totalHeight += explanationLines.length * 25
  
  totalHeight += 100 // 底部导航栏
  
  // 计算最大滚动距离
  gameState.maxScrollY = Math.max(0, totalHeight - canvas.height)
  
  // 限制滚动范围
  gameState.scrollY = Math.max(0, Math.min(gameState.scrollY, gameState.maxScrollY))
  
  // 应用滚动
  ctx.save()
  ctx.translate(0, -gameState.scrollY)
  
  let y = startY
  
  // 标题
  ctx.fillStyle = '#8B5A2B'
  ctx.font = 'bold 28px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(lesson.title, canvas.width / 2, y)
  y += 40
  
  // 作者（如果有）
  if (lesson.author) {
    ctx.font = '18px Arial'
    ctx.fillStyle = '#a67c52'
    ctx.fillText(lesson.author, canvas.width / 2, y)
    y += 35
  }
  
  y += 20
  
  // 内容
  ctx.textAlign = 'left'
  
  lesson.content.forEach((item, index) => {
    // 文本
    ctx.fillStyle = '#5a3d22'
    ctx.font = '20px Arial'
    ctx.fillText(item.text, 40, y)
    y += 30
    
    // 注释
    if (gameState.showNotes) {
      const noteLines = wrapText(item.note, canvas.width - 100, '14px Arial')
      ctx.fillStyle = '#a67c52'
      ctx.font = '14px Arial'
      noteLines.forEach(line => {
        ctx.fillText(line, 60, y)
        y += 18
      })
      y += 15
    }
  })
  
  // 解读
  y += 20
  ctx.fillStyle = '#8B5A2B'
  ctx.font = 'bold 18px Arial'
  ctx.fillText('📖 解读', 40, y)
  y += 35
  
  ctx.fillStyle = '#5a3d22'
  ctx.font = '16px Arial'
  
  explanationLines.forEach(line => {
    ctx.fillText(line, 40, y)
    y += 25
  })
  
  ctx.restore()
  
  // 绘制固定底部的导航栏背景
  ctx.fillStyle = '#fdf6e3'
  ctx.fillRect(0, canvas.height - 100, canvas.width, 100)
  
  // 导航按钮（使用图标）
  const btnY = canvas.height - 85
  const btnWidth = 60
  const btnHeight = 50
  const totalWidth = btnWidth * 5 + 12 * 4 // 5个按钮 + 4个间距
  const startX = (canvas.width - totalWidth) / 2
  
  // 目录按钮
  drawIconButton(startX, btnY, btnWidth, btnHeight, '📋', '#8B5A2B')
  
  // 返回按钮
  drawIconButton(startX + btnWidth + 12, btnY, btnWidth, btnHeight, '🏠', '#8B5A2B')
  
  // 播放按钮
  drawIconButton(startX + (btnWidth + 12) * 2, btnY, btnWidth, btnHeight, gameState.isPlaying ? '⏸' : '🔊', '#8B5A2B', gameState.isPlaying)
  
  // 上一个按钮
  drawIconButton(startX + (btnWidth + 12) * 3, btnY, btnWidth, btnHeight, '◀', '#8B5A2B')
  
  // 下一个按钮
  drawIconButton(startX + (btnWidth + 12) * 4, btnY, btnWidth, btnHeight, '▶', '#8B5A2B')
  
  // 进度
  ctx.fillStyle = '#a67c52'
  ctx.font = '14px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(`${gameState.currentLesson + 1} / ${lessonData.length}`, canvas.width / 2, canvas.height - 100)
  
  // 滚动提示
  if (gameState.maxScrollY > 0) {
    ctx.fillStyle = '#c9a87c'
    ctx.font = '12px Arial'
    ctx.fillText('👆 上下滑动查看更多', canvas.width / 2, 25)
  }
  
  gameState.currentPage = 'learn'
}

// 绘制目录页面
function drawCatalogPage() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // 背景
  ctx.fillStyle = '#fdf6e3'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // 标题（固定）
  ctx.fillStyle = '#8B5A2B'
  ctx.font = 'bold 28px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('目录', canvas.width / 2, 40)
  
  // 分类切换按钮（固定）
  const btnWidth = 120
  const btnHeight = 40
  const btnY = 60
  const spacing = 20
  const totalWidth = btnWidth * 2 + spacing
  const startX = (canvas.width - totalWidth) / 2
  
  // 三字经按钮
  const isSanzijing = gameState.category === 'sanzijing'
  drawCategoryButton(startX, btnY, btnWidth, btnHeight, '三字经', '#8B5A2B', isSanzijing)
  
  // 古诗词按钮
  const isPoems = gameState.category === 'poems'
  drawCategoryButton(startX + btnWidth + spacing, btnY, btnWidth, btnHeight, '古诗词', '#8B5A2B', isPoems)
  
  // 计算目录页面的最大滚动距离
  const startY = 120
  const itemHeight = 50
  const totalHeight = lessonData.length * itemHeight + 100
  const maxScrollY = Math.max(0, totalHeight - (canvas.height - startY - 50))
  
  // 限制滚动范围
  if (gameState.scrollY === undefined) {
    gameState.scrollY = 0
  }
  gameState.scrollY = Math.max(0, Math.min(gameState.scrollY, maxScrollY))
  
  // 设置裁剪区域，防止内容显示在固定元素上方
  // 从 startY - 20 开始裁剪，确保高亮背景完整显示
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, startY - 20, canvas.width, canvas.height - startY + 20 - 50)
  ctx.clip()
  
  // 应用滚动
  ctx.translate(0, -gameState.scrollY)
  
  // 目录列表
  ctx.textAlign = 'left'
  ctx.font = '18px Arial'
  
  const maxWidth = canvas.width - 60
  
  lessonData.forEach((lesson, index) => {
    const y = startY + index * itemHeight
    
    // 高亮当前课程
    if (index === gameState.currentLesson) {
      ctx.fillStyle = '#f0e6d2'
      ctx.fillRect(20, y - 15, canvas.width - 40, itemHeight - 5)
    }
    
    // 序号
    ctx.fillStyle = '#a67c52'
    ctx.font = '16px Arial'
    ctx.fillText(`${index + 1}.`, 30, y)
    
    // 标题
    ctx.fillStyle = index === gameState.currentLesson ? '#8B5A2B' : '#5a3d22'
    ctx.font = '18px Arial'
    
    // 截断过长的标题
    let displayTitle = lesson.title
    if (ctx.measureText(displayTitle).width > maxWidth - 50) {
      while (ctx.measureText(displayTitle + '...').width > maxWidth - 50 && displayTitle.length > 0) {
        displayTitle = displayTitle.slice(0, -1)
      }
      displayTitle += '...'
    }
    ctx.fillText(displayTitle, 60, y)
    
    // 作者（如果有）
    if (lesson.author) {
      ctx.fillStyle = '#a67c52'
      ctx.font = '14px Arial'
      ctx.fillText(lesson.author, 60, y + 18)
    }
  })
  
  ctx.restore()
  
  // 底部提示（固定）
  ctx.fillStyle = '#c9a87c'
  ctx.font = '14px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('点击选择课程，长按滑动查看更多', canvas.width / 2, canvas.height - 50)
  
  gameState.currentPage = 'catalog'
}

// 绘制分类切换按钮
function drawCategoryButton(x, y, width, height, text, color, isActive) {
  ctx.fillStyle = isActive ? color : '#fff'
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  
  // 手动绘制圆角矩形
  const radius = 10
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.arcTo(x + width, y, x + width, y + radius, radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius)
  ctx.lineTo(x + radius, y + height)
  ctx.arcTo(x, y + height, x, y + height - radius, radius)
  ctx.lineTo(x, y + radius)
  ctx.arcTo(x, y, x + radius, y, radius)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  
  ctx.fillStyle = isActive ? '#fff' : color
  ctx.font = 'bold 16px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x + width / 2, y + height / 2)
}

// 文本换行函数
function wrapText(text, maxWidth, font) {
  ctx.font = font
  const lines = []
  let currentLine = ''
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const testLine = currentLine + char
    const metrics = ctx.measureText(testLine)
    
    if (metrics.width > maxWidth && currentLine !== '') {
      lines.push(currentLine)
      currentLine = char
    } else {
      currentLine = testLine
    }
  }
  
  if (currentLine !== '') {
    lines.push(currentLine)
  }
  
  return lines
}

// 播放当前内容
function playCurrentContent() {
  if (gameState.currentPage !== 'learn') return
  
  const lesson = lessonData[gameState.currentLesson]
  if (!lesson) return
  
  // 停止之前的播放（但不设置用户停止标志）
  if (audioContext) {
    if (audioContext === 'speech') {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    } else if (audioContext.stop) {
      audioContext.stop()
      audioContext.destroy()
    }
    audioContext = null
  }
  
  // 重置状态
  isUserStopped = false
  playQueue = []
  currentPlayIndex = 0
  
  // 第一段：标题和作者
  let titleText = lesson.title
  if (lesson.author) {
    titleText += '，' + lesson.author
  }
  playQueue.push({
    text: titleText,
    type: 'title',
    label: '标题'
  })
  
  // 第二段：正文内容
  lesson.content.forEach((item, index) => {
    playQueue.push({
      text: item.text,
      type: 'content',
      label: `第${index + 1}句`
    })
    
    // 如果显示注释，也朗读注释
    if (gameState.showNotes && item.note) {
      playQueue.push({
        text: item.note,
        type: 'note',
        label: `注释${index + 1}`
      })
    }
  })
  
  // 第三段：解读
  if (lesson.explanation) {
    playQueue.push({
      text: lesson.explanation,
      type: 'explanation',
      label: '解读'
    })
  }
  
  // 开始播放
  playNextInQueue()
  
  tt.showToast({
    title: '开始播放',
    icon: 'none',
    duration: 1500
  })
}

// 播放下一段
function playNextInQueue() {
  if (currentPlayIndex >= playQueue.length || isUserStopped) {
    // 播放完成或用户停止
    gameState.isPlaying = false
    audioContext = null
    drawLearnPage()
    
    if (currentPlayIndex >= playQueue.length && !isUserStopped) {
      tt.showToast({
        title: '播放完成',
        icon: 'success',
        duration: 1500
      })
    }
    return
  }
  
  const currentItem = playQueue[currentPlayIndex]
  
  // 尝试使用 Web Speech API
  if (window.speechSynthesis && window.SpeechSynthesisUtterance) {
    try {
      isUserStopped = false
      
      // 获取最佳语音（首次时初始化）
      if (!bestVoice) {
        initBestVoice()
      }
      
      const utterance = new SpeechSynthesisUtterance(currentItem.text)
      
      // 设置最佳语音
      if (bestVoice) {
        utterance.voice = bestVoice
      }
      
      utterance.lang = 'zh-CN'
      utterance.rate = 0.75 // 语速（稍慢，更自然）
      utterance.pitch = 1.0 // 音调
      utterance.volume = 1.0 // 音量
      
      utterance.onstart = () => {
        gameState.isPlaying = true
        audioContext = 'speech'
        currentUtterance = utterance
        
        // 显示当前播放内容提示
        tt.showToast({
          title: `正在播放：${currentItem.label}`,
          icon: 'none',
          duration: 1500
        })
        
        drawLearnPage()
      }
      
      utterance.onend = () => {
        currentPlayIndex++
        // 播放下一段，根据内容类型调整停顿时间
        const pauseTime = currentItem.type === 'title' ? 800 : 
                         currentItem.type === 'content' ? 600 : 
                         currentItem.type === 'note' ? 400 : 500
        setTimeout(() => {
          playNextInQueue()
        }, pauseTime)
      }
      
      utterance.onerror = (event) => {
        console.error('语音合成错误:', event)
        
        // 只有在非用户主动停止时才显示错误并跳到下一段
        if (!isUserStopped) {
          currentPlayIndex++
          setTimeout(() => {
            playNextInQueue()
          }, 500)
        }
      }
      
      window.speechSynthesis.speak(utterance)
      
    } catch (error) {
      console.error('TTS初始化失败:', error)
      // 跳到下一段
      currentPlayIndex++
      setTimeout(() => {
        playNextInQueue()
      }, 500)
    }
  } else {
    // 不支持 Web Speech API，显示第一段内容后停止
    fallbackToText(currentItem.text)
  }
}

// 初始化最佳语音
function initBestVoice() {
  if (!window.speechSynthesis) return
  
  // 确保语音列表已加载
  const loadVoices = () => {
    const voices = window.speechSynthesis.getVoices()
    
    if (voices.length === 0) return
    
    // 优先级：Google 中文女声 > Google 中文男声 > 微软中文女声 > 微软中文男声 > 其他中文语音
    const preferredVoices = [
      'Google 普通话（中国大陆）',
      'Google 國語（台灣）',
      'Microsoft Huihui',
      'Microsoft Kangkang',
      'Microsoft Yaoyao',
      'Ting-Ting',
      'Sin-Ji'
    ]
    
    // 查找最佳语音
    for (const preferredName of preferredVoices) {
      const voice = voices.find(v => v.name.includes(preferredName) || v.name === preferredName)
      if (voice) {
        bestVoice = voice
        console.log('选择语音:', voice.name)
        return
      }
    }
    
    // 如果没有找到首选语音，选择第一个中文语音
    const chineseVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('CN'))
    if (chineseVoice) {
      bestVoice = chineseVoice
      console.log('选择默认中文语音:', chineseVoice.name)
    } else {
      console.log('未找到中文语音，使用默认语音')
    }
  }
  
  // 某些浏览器需要异步加载语音列表
  if (window.speechSynthesis.getVoices().length > 0) {
    loadVoices()
  } else {
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    // 设置超时，防止无限等待
    setTimeout(() => {
      if (!bestVoice) {
        loadVoices()
      }
    }, 1000)
  }
}

// 降级方案：显示文本内容
function fallbackToText(text) {
  tt.showModal({
    title: '内容朗读',
    content: text,
    showCancel: false,
    confirmText: '关闭'
  })
  
  tt.showToast({
    title: '暂不支持语音',
    icon: 'none',
    duration: 2000
  })
}

// 停止播放
function stopPlay() {
  isUserStopped = true // 标记为用户主动停止
  
  // 清空播放队列
  playQueue = []
  currentPlayIndex = 0
  currentUtterance = null
  
  if (audioContext) {
    if (audioContext === 'speech') {
      // 停止语音合成
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    } else if (audioContext.stop) {
      // 停止音频播放
      audioContext.stop()
      audioContext.destroy()
    }
    audioContext = null
  }
  gameState.isPlaying = false
  drawLearnPage()
}

// 切换播放状态
function togglePlay() {
  if (gameState.isPlaying) {
    stopPlay()
  } else {
    playCurrentContent()
  }
}

// 注册触摸事件
function registerTouchEvents() {
  let lastY = 0
  let touchStartTime = 0
  let touchStartX = 0
  let touchStartY = 0
  let touchStartPage = '' // 记录触摸开始时的页面
  let hasMoved = false
  const moveThreshold = 10 // 移动阈值
  const tapTimeThreshold = 300 // 单击时间阈值（毫秒）
  
  tt.onTouchStart((res) => {
    const touch = res.touches[0]
    const x = touch.clientX
    const y = touch.clientY
    lastY = y
    touchStartX = x
    touchStartY = y
    touchStartTime = Date.now()
    touchStartPage = gameState.currentPage // 记录触摸开始时的页面
    hasMoved = false
    
    if (gameState.currentPage === 'menu') {
      // 三字经按钮
      if (x >= canvas.width / 2 - 100 && x <= canvas.width / 2 + 100 &&
          y >= 250 && y <= 310) {
        gameState.category = 'sanzijing'
        lessonData = currentData.sanzijing
        gameState.currentLesson = 0
        gameState.scrollY = 0
        drawLearnPage()
      }
      // 古诗词按钮
      else if (x >= canvas.width / 2 - 100 && x <= canvas.width / 2 + 100 &&
               y >= 340 && y <= 400) {
        gameState.category = 'poems'
        lessonData = currentData.poems
        gameState.currentLesson = 0
        gameState.scrollY = 0
        drawLearnPage()
      }
    }
    else if (gameState.currentPage === 'learn') {
      const btnY = canvas.height - 85
      const btnWidth = 60
      const btnHeight = 50
      const totalWidth = btnWidth * 5 + 12 * 4
      const startX = (canvas.width - totalWidth) / 2
      
      // 目录按钮
      if (x >= startX && x <= startX + btnWidth &&
          y >= btnY && y <= btnY + btnHeight) {
        stopPlay()
        drawCatalogPage()
      }
      // 返回按钮
      else if (x >= startX + btnWidth + 12 && x <= startX + btnWidth * 2 + 12 &&
               y >= btnY && y <= btnY + btnHeight) {
        stopPlay()
        drawMenu()
      }
      // 播放按钮
      else if (x >= startX + (btnWidth + 12) * 2 && x <= startX + (btnWidth + 12) * 2 + btnWidth &&
               y >= btnY && y <= btnY + btnHeight) {
        togglePlay()
      }
      // 上一个按钮
      else if (x >= startX + (btnWidth + 12) * 3 && x <= startX + (btnWidth + 12) * 3 + btnWidth &&
               y >= btnY && y <= btnY + btnHeight) {
        if (gameState.currentLesson > 0) {
          gameState.currentLesson--
          gameState.scrollY = 0
          stopPlay()
          drawLearnPage()
        }
      }
      // 下一个按钮
      else if (x >= startX + (btnWidth + 12) * 4 && x <= startX + (btnWidth + 12) * 4 + btnWidth &&
               y >= btnY && y <= btnY + btnHeight) {
        if (gameState.currentLesson < lessonData.length - 1) {
          gameState.currentLesson++
          gameState.scrollY = 0
          stopPlay()
          drawLearnPage()
        }
      }
      // 注释区域不在这里处理，改在 onTouchEnd 中处理单击
    }
    else if (gameState.currentPage === 'catalog') {
      // 分类切换按钮
      const btnWidth = 120
      const btnHeight = 40
      const btnY = 60
      const spacing = 20
      const totalWidth = btnWidth * 2 + spacing
      const startX = (canvas.width - totalWidth) / 2
      
      // 三字经按钮
      if (x >= startX && x <= startX + btnWidth &&
          y >= btnY && y <= btnY + btnHeight) {
        if (gameState.category !== 'sanzijing') {
          gameState.category = 'sanzijing'
          lessonData = currentData.sanzijing
          gameState.currentLesson = 0
          gameState.scrollY = 0
          drawCatalogPage()
        }
      }
      // 古诗词按钮
      else if (x >= startX + btnWidth + spacing && x <= startX + btnWidth * 2 + spacing &&
               y >= btnY && y <= btnY + btnHeight) {
        if (gameState.category !== 'poems') {
          gameState.category = 'poems'
          lessonData = currentData.poems
          gameState.currentLesson = 0
          gameState.scrollY = 0
          drawCatalogPage()
        }
      }
    }
  })
  
  // 触摸移动 - 滚动
  tt.onTouchMove((res) => {
    if (gameState.currentPage === 'learn' && gameState.maxScrollY > 0) {
      const touch = res.touches[0]
      const deltaX = Math.abs(touch.clientX - touchStartX)
      const deltaY = Math.abs(touch.clientY - touchStartY)
      
      // 如果移动距离超过阈值，标记为已移动
      if (deltaX > moveThreshold || deltaY > moveThreshold) {
        hasMoved = true
      }
      
      // 滚动逻辑
      const scrollDelta = lastY - touch.clientY
      gameState.scrollY += scrollDelta
      lastY = touch.clientY
      drawLearnPage()
    }
    else if (gameState.currentPage === 'catalog') {
      const touch = res.touches[0]
      const deltaX = Math.abs(touch.clientX - touchStartX)
      const deltaY = Math.abs(touch.clientY - touchStartY)
      
      // 如果移动距离超过阈值，标记为已移动
      if (deltaX > moveThreshold || deltaY > moveThreshold) {
        hasMoved = true
      }
      
      // 目录页面滚动逻辑
      const scrollDelta = lastY - touch.clientY
      gameState.scrollY += scrollDelta
      lastY = touch.clientY
      
      // 计算目录页面的最大滚动距离
      const startY = 120
      const itemHeight = 50
      const totalHeight = startY + lessonData.length * itemHeight + 100
      const maxScrollY = Math.max(0, totalHeight - canvas.height)
      
      // 限制滚动范围
      gameState.scrollY = Math.max(0, Math.min(gameState.scrollY, maxScrollY))
      
      drawCatalogPage()
    }
  })
  
  // 触摸结束 - 检测单击
  tt.onTouchEnd((res) => {
    // 检查触摸开始时的页面，而不是当前页面
    if (touchStartPage === 'learn') {
      const touchEndTime = Date.now()
      const touchDuration = touchEndTime - touchStartTime
      const x = touchStartX
      const y = touchStartY
      
      // 判断是否为单击：没有移动且时间短
      const isTap = !hasMoved && touchDuration < tapTimeThreshold
      
      // 如果是单击，且不在按钮区域，则切换注释显示
      if (isTap && y < canvas.height - 120) {
        gameState.showNotes = !gameState.showNotes
        gameState.scrollY = 0
        drawLearnPage()
      }
    }
    else if (touchStartPage === 'catalog') {
      const touchEndTime = Date.now()
      const touchDuration = touchEndTime - touchStartTime
      const x = touchStartX
      const y = touchStartY
      
      // 判断是否为单击
      const isTap = !hasMoved && touchDuration < tapTimeThreshold
      
      if (isTap) {
        // 检查点击的是哪个课程项
        const startY = 120 // 调整为120，因为上面有分类按钮
        const itemHeight = 50
        
        // 计算点击的索引（考虑滚动）
        const index = Math.floor((y - startY + gameState.scrollY) / itemHeight)
        
        // 确保点击在课程列表区域（不在按钮区域和底部提示区域）
        if (index >= 0 && index < lessonData.length && y >= 110 && y < canvas.height - 100) {
          // 切换到选中的课程
          gameState.currentLesson = index
          gameState.scrollY = 0
          drawLearnPage()
        }
      }
    }
  })
}

// 启动游戏
init()
