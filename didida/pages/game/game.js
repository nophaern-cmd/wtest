// pages/game/game.js
const app = getApp()
const { getImageUrl } = require('../../images/image-config.js')

Page({
  data: {
    // 游戏状态
    gameStarted: false,
    gameOver: false,
    showSettings: false,
    difficulty: 'kindergarten',
    wrongFirstMode: false,
    score: 0,
    finalScore: 0,
    lives: 3,
    currentRound: 0,
    totalRounds: 10,
    correctCount: 0,
    wrongCount: 0,

    // 游戏数据
    currentWord: '',
    wordTop: 100,
    wordAnim: '',
    options: [],
    selectedOption: null,
    resultShown: false,
    showExplosion: false,
    explosionType: '',
    explosionEmoji: '',

    // 已使用的单词（避免重复）
    usedWords: [],

    // 历史记录
    history: [],

    // 错题本
    wrongWords: [],
    currentWrongWords: [],

    // 单词库
    words: [],

    // 定时器
    fallTimer: null
  },

  onLoad(options) {
    if (options && options.stage) {
      this.setData({ difficulty: options.stage })
    }
    // 加载错题本
    this.loadWrongWords()
    // 加载单词库
    this.loadWords()
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
    const wordsData = require('../../data/words.js')
    let allWords = []

    // 根据阶段获取单词
    if (this.data.difficulty === 'kindergarten') {
      allWords = wordsData.kindergartenWords
    } else if (this.data.difficulty === 'primary') {
      allWords = wordsData.primaryWords
    } else if (this.data.difficulty === 'middle') {
      allWords = wordsData.juniorWords
    }

    // 只筛选"26字母"和"颜色"分类的单词
    const filteredWords = allWords.filter(w => w.category === '26字母' || w.category === '颜色')

    // 转换为游戏格式，添加图片URL
    const gameWords = filteredWords.map(w => ({
      word: w.word,
      emoji: w.image,
      imageUrl: getImageUrl(w.image, true),
      text: w.meaning
    }))

    this.setData({ words: gameWords })
  },

  // 加载错题本
  loadWrongWords() {
    try {
      const wrongWords = wx.getStorageSync('wrongWords') || []
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
        imageUrl: w.imageUrl || getImageUrl(w.emoji, true)
      })),
      primary: this.data.wrongWords.filter(w => w.difficulty === 'primary').map(w => ({
        ...w,
        imageUrl: w.imageUrl || getImageUrl(w.emoji, true)
      })),
      middle: this.data.wrongWords.filter(w => w.difficulty === 'middle').map(w => ({
        ...w,
        imageUrl: w.imageUrl || getImageUrl(w.emoji, true)
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

  // 开始游戏
  startGame() {
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
