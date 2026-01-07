// pages/game/game.js
const app = getApp()
let imageConfigModule

try {
  imageConfigModule = require('../../images/image-config.js')
  console.log('image-config 模块加载成功, keys:', Object.keys(imageConfigModule))
} catch (e) {
  console.error('加载 image-config.js 失败:', e)
}

const getImageUrl = imageConfigModule ? imageConfigModule.getImageUrl : null

Page({
  data: {
    // 游戏状态
    gameStarted: false,
    gameOver: false,
    showSettings: false,
    gameTypeSelected: false, // 是否已选择游戏类型
    currentGameType: 'pair', // 当前游戏类型
    difficulty: 'kindergarten',
    wrongFirstMode: false,
    score: 0,
    finalScore: 0,
    lives: 3,
    currentRound: 0,
    totalRounds: 10,
    correctCount: 0,
    wrongCount: 0,

    // 单词配对游戏数据
    currentWord: '',
    wordTop: 100,
    wordAnim: '',
    options: [],
    selectedOption: null,
    resultShown: false,
    showExplosion: false,
    explosionType: '',
    explosionEmoji: '',

    // 看图找词游戏数据
    sceneImage: '', // 当前场景图片
    sceneWords: [], // 场景中的单词列表（包含位置）
    targetWord: null, // 当前要找的单词
    wordOptions: [], // 选项列表
    foundWords: [], // 已找到的单词
    selectedPosition: null, // 当前点击的位置

    // 已使用的单词（避免重复）
    usedWords: [],

    // 历史记录
    history: [],

    // 错题本
    wrongWords: [],
    currentWrongWords: [],

    // 单词库
    words: [],

    // 场景图片配置
    sceneImages: {
      room: {
        image: '/images/scenes/room.png',
        words: [
          { word: 'apple', x: 20, y: 30, emoji: '🍎' },
          { word: 'book', x: 50, y: 40, emoji: '📚' },
          { word: 'cat', x: 70, y: 25, emoji: '🐱' },
          { word: 'red', x: 30, y: 60, emoji: '🔴' },
          { word: 'blue', x: 60, y: 55, emoji: '🔵' }
        ]
      },
      park: {
        image: '/images/scenes/park.png',
        words: [
          { word: 'green', x: 25, y: 35, emoji: '🟢' },
          { word: 'yellow', x: 55, y: 30, emoji: '🟡' },
          { word: 'bird', x: 75, y: 45, emoji: '🐦' },
          { word: 'dog', x: 40, y: 60, emoji: '🐕' },
          { word: 'sun', x: 65, y: 55, emoji: '☀️' }
        ]
      },
      classroom: {
        image: '/images/scenes/classroom.png',
        words: [
          { word: 'pen', x: 15, y: 25, emoji: '✏️' },
          { word: 'pencil', x: 40, y: 30, emoji: '🖊️' },
          { word: 'chair', x: 65, y: 35, emoji: '🪑' },
          { word: 'pink', x: 25, y: 55, emoji: '🩷' },
          { word: 'purple', x: 50, y: 60, emoji: '🟣' }
        ]
      }
    },

    // 定时器
    fallTimer: null,

    // 当前游戏信息
    currentGameIcon: '🎯',
    currentGameName: '单词配对',
    currentGameDesc: '选择与单词对应的图片，挑战高分！',

    // 游戏类型列表
    gameTypes: {
      pair: {
        icon: '🎯',
        name: '单词配对',
        desc: '选择与单词对应的图片，挑战高分！'
      },
      findWord: {
        icon: '🔍',
        name: '看图找词',
        desc: '在图片中找出隐藏的单词！'
      },
      audio: {
        icon: '🔊',
        name: '听音选图',
        desc: '听发音选择正确图片，锻炼听力！'
      },
      spell: {
        icon: '✏️',
        name: '拼写挑战',
        desc: '根据图片拼写单词，巩固记忆！'
      }
    }
  },

  onLoad(options) {
    console.log('game page onLoad, options:', options)

    try {
      if (options && options.stage) {
        console.log('设置难度为:', options.stage)
        this.setData({ difficulty: options.stage })
      }

      // 加载错题本
      console.log('开始加载错题本')
      this.loadWrongWords()

      // 加载单词库
      console.log('开始加载单词库')
      this.loadWords()

      console.log('game page onLoad 完成')
    } catch (e) {
      console.error('game page onLoad 出错:', e)
    }
  },

  onShow() {
    // 每次显示页面时更新错题本
    this.updateWrongWordsByDiff()
  },

  onUnload() {
    this.clearTimers()
  },

  // 加载单词库
  loadWords() {
    try {
      console.log('开始加载单词库, 当前难度:', this.data.difficulty)

      if (!getImageUrl) {
        console.error('getImageUrl 函数未定义!')
        return
      }

      const wordsData = require('../../data/words.js')
      console.log('wordsData keys:', Object.keys(wordsData))

      let allWords = []

      // 根据阶段获取单词
      if (this.data.difficulty === 'kindergarten') {
        allWords = wordsData.kindergartenWords
      } else if (this.data.difficulty === 'primary') {
        allWords = wordsData.primaryWords
      } else if (this.data.difficulty === 'middle') {
        allWords = wordsData.juniorWords
      }

      console.log('总单词数:', allWords ? allWords.length : 0)

      if (!allWords || allWords.length === 0) {
        console.error('没有找到单词数据!')
        return
      }

      // 只筛选"26字母"和"颜色"分类的单词
      const filteredWords = allWords.filter(w => w.category === '26字母' || w.category === '颜色')

      console.log('筛选后单词数:', filteredWords.length)

      // 转换为游戏格式，添加图片URL
      const gameWords = filteredWords.map(w => {
        const imageUrl = getImageUrl(w.image, true)
        console.log('单词:', w.word, 'emoji:', w.image, '图片URL:', imageUrl)
        return {
          word: w.word,
          emoji: w.image,
          imageUrl: imageUrl,
          text: w.meaning
        }
      })

      this.setData({ words: gameWords })
      console.log('最终游戏单词数:', gameWords.length)
    } catch (e) {
      console.error('loadWords 出错:', e)
    }
  },

  // 加载错题本
  loadWrongWords() {
    try {
      console.log('开始加载错题本')
      const wrongWords = wx.getStorageSync('wrongWords') || []
      console.log('错题本数据:', wrongWords)
      this.setData({ wrongWords })
      this.updateWrongWordsByDiff()
    } catch (e) {
      console.error('加载错题本失败', e)
    }
  },

  // 更新错题本按难度分组
  updateWrongWordsByDiff() {
    const wrongWordsByDiff = {
      kindergarten: this.data.wrongWords.filter(w => w.difficulty === 'kindergarten').map(w => ({
        ...w,
        imageUrl: w.imageUrl || (getImageUrl ? getImageUrl(w.emoji, true) : '')
      })),
      primary: this.data.wrongWords.filter(w => w.difficulty === 'primary').map(w => ({
        ...w,
        imageUrl: w.imageUrl || (getImageUrl ? getImageUrl(w.emoji, true) : '')
      })),
      middle: this.data.wrongWords.filter(w => w.difficulty === 'middle').map(w => ({
        ...w,
        imageUrl: w.imageUrl || (getImageUrl ? getImageUrl(w.emoji, true) : '')
      }))
    }
    this.setData({ wrongWordsByDiff })
  },

  // 保存错题本
  saveWrongWords() {
    try {
      wx.setStorageSync('wrongWords', this.data.wrongWords)
      this.updateWrongWordsByDiff()
    } catch (e) {
      console.error('保存错题本失败', e)
    }
  },

  // 切换错题优先
  toggleWrongFirst() {
    const wrongFirstMode = !this.data.wrongFirstMode
    this.setData({ wrongFirstMode })
  },

  // 选择游戏类型
  selectGameType(e) {
    const type = e.currentTarget.dataset.type
    const gameInfo = this.data.gameTypes[type]

    // 震动反馈
    wx.vibrateShort({ type: 'light' })

    this.setData({
      currentGameType: type,
      currentGameIcon: gameInfo.icon,
      currentGameName: gameInfo.name,
      currentGameDesc: gameInfo.desc,
      gameTypeSelected: true
    })
  },

  // 返回游戏列表
  backToGames() {
    this.setData({ gameTypeSelected: false })
  },

  // 开始游戏
  startGame() {
    // 根据游戏类型初始化数据
    if (this.data.currentGameType === 'findWord') {
      // 看图找词游戏
      this.initFindWordGame()
    } else {
      // 单词配对游戏
      this.initPairGame()
    }
  },

  // 初始化单词配对游戏
  initPairGame() {
    this.setData({
      gameStarted: true,
      gameOver: false,
      score: 0,
      lives: 3,
      currentRound: 0,
      correctCount: 0,
      wrongCount: 0,
      history: [],
      currentWrongWords: [],
      usedWords: []
    })
    this.nextWord()
  },

  // 初始化看图找词游戏
  initFindWordGame() {
    console.log('开始初始化看图找词游戏')

    if (!getImageUrl) {
      console.error('getImageUrl 函数未定义!')
      return
    }

    // 重新加载所有单词（不限于"26字母"和"颜色"）
    const wordsData = require('../../data/words.js')
    let allWords = []

    if (this.data.difficulty === 'kindergarten') {
      allWords = wordsData.kindergartenWords
    } else if (this.data.difficulty === 'primary') {
      allWords = wordsData.primaryWords
    } else if (this.data.difficulty === 'middle') {
      allWords = wordsData.juniorWords
    }

    // 转换为游戏格式
    const allGameWords = allWords.map(w => ({
      word: w.word,
      emoji: w.image,
      imageUrl: getImageUrl(w.image, true),
      text: w.meaning
    }))

    console.log('加载所有单词数:', allGameWords.length)

    const sceneKeys = Object.keys(this.data.sceneImages)
    console.log('可用场景:', sceneKeys)

    const randomScene = sceneKeys[Math.floor(Math.random() * sceneKeys.length)]
    const scene = this.data.sceneImages[randomScene]
    console.log('选择的场景:', randomScene)

    // 筛选出场景中包含的单词（从所有单词库中）
    const availableWords = scene.words.map(sceneWord => {
      const wordData = allGameWords.find(w => w.word === sceneWord.word)
      console.log('场景单词:', sceneWord.word, '在单词库中找到:', !!wordData)
      return wordData ? {
        ...wordData,
        x: sceneWord.x,
        y: sceneWord.y,
        emoji: sceneWord.emoji
      } : null
    }).filter(w => w !== null)

    console.log('可用场景单词数:', availableWords.length)

    this.setData({
      gameStarted: true,
      gameOver: false,
      score: 0,
      correctCount: 0,
      wrongCount: 0,
      sceneImage: scene.image,
      sceneWords: availableWords,
      foundWords: [],
      foundWordMarkers: [], // 预处理的标记数据
      selectedPosition: null
    })

    this.nextFindWord()
  },

  // 看图找词：下一个单词
  nextFindWord() {
    if (!getImageUrl) {
      console.error('getImageUrl 函数未定义!')
      return
    }

    const unFoundWords = this.data.sceneWords.filter(w =>
      !this.data.foundWords.includes(w.word)
    )

    if (unFoundWords.length === 0) {
      this.endGame()
      return
    }

    const targetWord = unFoundWords[Math.floor(Math.random() * unFoundWords.length)]

    // 重新加载所有单词用于生成选项
    const wordsData = require('../../data/words.js')
    let allWords = []

    if (this.data.difficulty === 'kindergarten') {
      allWords = wordsData.kindergartenWords
    } else if (this.data.difficulty === 'primary') {
      allWords = wordsData.primaryWords
    } else if (this.data.difficulty === 'middle') {
      allWords = wordsData.juniorWords
    }

    // 转换为游戏格式
    const allGameWords = allWords.map(w => ({
      word: w.word,
      emoji: w.image,
      imageUrl: getImageUrl(w.image, true),
      text: w.meaning
    }))

    // 生成2个错误选项
    const wrongOptions = allGameWords
      .filter(w => w.word !== targetWord.word)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2)

    const options = [...wrongOptions, targetWord]
      .sort(() => Math.random() - 0.5)

    this.setData({
      targetWord: targetWord,
      wordOptions: options,
      selectedPosition: null
    })
  },

  // 看图找词：点击场景中的位置
  clickScenePosition(e) {
    const x = e.detail.x / e.currentTarget.width * 100
    const y = e.detail.y / e.currentTarget.height * 100

    // 检查是否点击了某个单词的位置
    const clickedWord = this.data.sceneWords.find(w => {
      const dx = x - w.x
      const dy = y - w.y
      return Math.sqrt(dx * dx + dy * dy) < 10 // 10单位半径
    })

    if (clickedWord && clickedWord.word === this.data.targetWord.word) {
      // 找到了，同时更新foundWords和foundWordMarkers
      const newFoundWords = [...this.data.foundWords, clickedWord.word]
      const newMarker = {
        word: clickedWord.word,
        x: clickedWord.x,
        y: clickedWord.y,
        emoji: clickedWord.emoji
      }
      this.setData({
        selectedPosition: { x: clickedWord.x, y: clickedWord.y },
        foundWords: newFoundWords,
        foundWordMarkers: [...this.data.foundWordMarkers, newMarker]
      })
    } else {
      // 没找到或点错了
      this.setData({
        selectedPosition: null,
        wrongCount: this.data.wrongCount + 1
      })
    }
  },

  // 看图找词：选择选项
  selectFindWordOption(e) {
    const index = e.currentTarget.dataset.index
    const selected = this.data.wordOptions[index]

    if (selected.word === this.data.targetWord.word) {
      // 选对了，找到对应的场景单词信息
      const sceneWord = this.data.sceneWords.find(w => w.word === this.data.targetWord.word)
      const newMarker = {
        word: this.data.targetWord.word,
        x: sceneWord ? sceneWord.x : 50,
        y: sceneWord ? sceneWord.y : 50,
        emoji: sceneWord ? sceneWord.emoji : ''
      }

      this.setData({
        score: this.data.score + 1,
        correctCount: this.data.correctCount + 1,
        foundWords: [...this.data.foundWords, this.data.targetWord.word],
        foundWordMarkers: [...this.data.foundWordMarkers, newMarker]
      })
    } else {
      // 选错了
      this.setData({
        score: this.data.score - 1,
        wrongCount: this.data.wrongCount + 1
      })
    }

    setTimeout(() => {
      this.nextFindWord()
    }, 1000)
  },

  // 重新开始
  restartGame() {
    this.setData({
      gameStarted: true,
      gameOver: false,
      score: 0,
      lives: 3,
      currentRound: 0,
      correctCount: 0,
      wrongCount: 0,
      history: [],
      currentWrongWords: [],
      usedWords: []
    })
    this.nextWord()
  },

  // 下一个单词
  nextWord() {
    this.clearTimers()

    // 检查是否完成10个单词
    if (this.data.currentRound >= this.data.totalRounds || this.data.lives <= 0) {
      this.endGame()
      return
    }

    let wordList = this.data.words

    // 错题优先模式
    if (this.data.wrongFirstMode && this.data.wrongWords.length > 0) {
      const difficultyWrongWords = this.data.wrongWords.filter(w => w.difficulty === this.data.difficulty)
      if (difficultyWrongWords.length > 0) {
        wordList = difficultyWrongWords
      }
    }

    // 过滤掉已使用的单词
    const availableWords = wordList.filter(w => !this.data.usedWords.includes(w.word))

    // 如果所有单词都用过了，重置已使用列表
    if (availableWords.length === 0) {
      this.setData({ usedWords: [] })
    } else if (availableWords.length === 1) {
      // 只剩一个单词时，也重置（避免最后一个单词一直重复）
      this.setData({ usedWords: [] })
    }

    // 重新获取可用单词列表
    const finalWordList = this.data.usedWords.length === 0 ? wordList : wordList.filter(w => !this.data.usedWords.includes(w.word))

    // 随机选择一个单词
    const randomIndex = Math.floor(Math.random() * finalWordList.length)
    const currentWord = finalWordList[randomIndex]

    // 添加到已使用列表
    const newUsedWords = [...this.data.usedWords, currentWord.word]
    this.setData({ usedWords: newUsedWords })

    // 选择另一个不同的选项
    let otherWord
    const fullWordList = this.data.words
    do {
      otherWord = fullWordList[Math.floor(Math.random() * fullWordList.length)]
    } while (otherWord.word === currentWord.word)

    // 随机排列两个选项
    const options = [
      { ...currentWord, correct: true },
      { ...otherWord, correct: false }
    ].sort(() => Math.random() - 0.5)

    // 先移除动画类，强制重绘后再添加
    this.setData({
      currentWord: currentWord.word,
      options: options,
      selectedOption: null,
      resultShown: false,
      wordAnim: '',
      showExplosion: false,
      currentRound: this.data.currentRound + 1
    })

    // 使用 nextTick 确保 DOM 更新后再添加动画类
    wx.nextTick(() => {
      this.setData({ wordAnim: 'falling' })
    })

    // 单词掉落动画（5秒后自动触发超时）
    this.fallTimer = setTimeout(() => {
      this.handleTimeout()
    }, 5000)
  },

  // 超时处理
  handleTimeout() {
    if (this.data.selectedOption !== null) return
    this.clearTimers()

    // 找出正确答案的索引
    const correctIndex = this.data.options.findIndex(opt => opt.correct)

    this.setData({
      selectedOption: correctIndex,
      resultShown: true
    })

    this.handleWrongAnswer(true)
  },

  // 处理错误答案
  handleWrongAnswer(isTimeout = false) {
    const correctWord = this.data.options.find(opt => opt.correct)

    // 更新统计
    this.setData({
      score: this.data.score - 1,
      lives: this.data.lives - 1,
      wrongCount: this.data.wrongCount + 1
    })

    this.showExplosion('wrong', '💥')

    // 添加到当前错题列表
    const newWrongWords = [...this.data.currentWrongWords, {
      ...correctWord,
      difficulty: this.data.difficulty,
      addedToBook: false
    }]
    this.setData({ currentWrongWords: newWrongWords })

    // 添加到历史记录
    const history = [...this.data.history, {
      word: this.data.currentWord,
      emoji: correctWord.emoji,
      imageUrl: correctWord.imageUrl,
      correct: false
    }]
    this.setData({ history })

    // 延迟后继续
    setTimeout(() => {
      if (this.data.lives <= 0) {
        this.endGame()
      } else {
        this.nextWord()
      }
    }, 800)
  },

  // 处理正确答案
  handleCorrectAnswer() {
    const correctWord = this.data.options.find(opt => opt.correct)

    // 更新统计
    this.setData({
      score: this.data.score + 1,
      correctCount: this.data.correctCount + 1
    })

    this.showExplosion('correct', '🎉')

    // 添加到历史记录
    const history = [...this.data.history, {
      word: this.data.currentWord,
      emoji: correctWord.emoji,
      imageUrl: correctWord.imageUrl,
      correct: true
    }]
    this.setData({ history })

    // 显示结果
    this.setData({
      resultShown: true
    })

    // 延迟后继续
    setTimeout(() => {
      this.nextWord()
    }, 800)
  },

  // 显示爆炸效果
  showExplosion(type, emoji) {
    this.setData({
      showExplosion: true,
      explosionType: type,
      explosionEmoji: emoji
    })

    setTimeout(() => {
      this.setData({ showExplosion: false })
    }, 800)
  },

  // 选择选项
  selectOption(e) {
    if (this.data.selectedOption !== null) return

    const index = parseInt(e.currentTarget.dataset.index)
    const selected = this.data.options[index]

    this.clearTimers()
    this.setData({ selectedOption: index, resultShown: true })

    if (selected.correct) {
      this.handleCorrectAnswer()
    } else {
      this.handleWrongAnswer(false)
    }
  },

  // 切换错题本
  toggleWrongBook(e) {
    const index = e.currentTarget.dataset.index
    const currentWrongWords = [...this.data.currentWrongWords]
    const item = currentWrongWords[index]

    if (item.addedToBook) {
      // 从错题本移除
      const wrongWords = this.data.wrongWords.filter(w =>
        !(w.word === item.word && w.difficulty === item.difficulty)
      )
      item.addedToBook = false
      this.setData({ wrongWords, currentWrongWords })
    } else {
      // 添加到错题本
      const wrongWords = [...this.data.wrongWords, {
        word: item.word,
        emoji: item.emoji,
        text: item.text,
        difficulty: item.difficulty
      }]
      item.addedToBook = true
      this.setData({ wrongWords, currentWrongWords })
    }

    this.saveWrongWords()
  },

  // 结束游戏
  endGame() {
    this.clearTimers()
    this.setData({
      gameOver: true,
      finalScore: this.data.score,
      wordAnim: '',
      showExplosion: false
    })
  },

  // 返回
  goBack() {
    if (this.data.gameStarted) {
      wx.showModal({
        title: '提示',
        content: '游戏进行中，确定要退出吗？',
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack()
          }
        }
      })
    } else {
      wx.navigateBack()
    }
  },

  // 清除定时器
  clearTimers() {
    if (this.fallTimer) {
      clearTimeout(this.fallTimer)
      this.fallTimer = null
    }
  }
})
