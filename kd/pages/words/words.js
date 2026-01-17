// pages/words/words.js
const app = getApp()
const storage = require('../../utils/storage')
const audio = require('../../utils/audio')

Page({
  data: {
    activeTab: 'basic',
    basicWords: [],
    phonicsData: [],
    showDetail: false,
    currentWord: {},
    currentIndex: 0,
    learnedWords: [],
    audioPlayer: null
  },

  onLoad() {
    this.setData({
      audioPlayer: audio.createPlayer()
    })
    this.loadWords()
    this.loadProgress()
  },

  onUnload() {
    if (this.data.audioPlayer) {
      this.data.audioPlayer.destroy()
    }
  },

  loadWords() {
    const basicWords = app.globalData.words.basic.map(word => ({
      ...word,
      learned: false
    }))

    const phonicsList = Object.keys(app.globalData.words.phonics).map(letter => ({
      letter,
      words: app.globalData.words.phonics[letter].map(word => ({
        ...word,
        learned: false
      })),
      expanded: false
    }))

    this.setData({
      basicWords,
      phonicsData: phonicsList
    })
  },

  loadProgress() {
    const learnedWords = storage.get(storage.STORAGE_KEYS.LEARNED_WORDS_LIST, [])

    const basicWords = this.data.basicWords.map(word => ({
      ...word,
      learned: learnedWords.includes(word.english)
    }))

    const phonicsData = this.data.phonicsData.map(letter => ({
      ...letter,
      words: letter.words.map(word => ({
        ...word,
        learned: learnedWords.includes(word.english)
      }))
    }))

    this.setData({
      basicWords,
      phonicsData,
      learnedWords
    })
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
  },

  toggleLetter(e) {
    const letter = e.currentTarget.dataset.letter
    const phonicsData = this.data.phonicsData.map(item => {
      if (item.letter === letter) {
        return { ...item, expanded: !item.expanded }
      }
      return item
    })
    this.setData({ phonicsData })
  },

  showWordDetail(e) {
    const word = e.currentTarget.dataset.word
    const index = this.data.basicWords.findIndex(w => w.english === word.english)
    this.setData({
      currentWord: word,
      currentIndex: index,
      showDetail: true
    })
  },

  hideWordDetail() {
    this.setData({ showDetail: false })
  },

  prevWord() {
    const newIndex = this.data.currentIndex > 0 ? this.data.currentIndex - 1 : this.data.basicWords.length - 1
    this.setData({
      currentWord: this.data.basicWords[newIndex],
      currentIndex: newIndex
    })
  },

  nextWord() {
    const newIndex = this.data.currentIndex < this.data.basicWords.length - 1 ? this.data.currentIndex + 1 : 0
    this.setData({
      currentWord: this.data.basicWords[newIndex],
      currentIndex: newIndex
    })
  },

  toggleWordLearned(word, showToast = true) {
    const learnedWords = storage.updateWordProgress(word.english, !word.learned)
    const learned = !word.learned

    const basicWords = this.data.basicWords.map(item => {
      if (item.english === word.english) {
        return { ...item, learned }
      }
      return item
    })

    const phonicsData = this.data.phonicsData.map(letter => ({
      ...letter,
      words: letter.words.map(item => {
        if (item.english === word.english) {
          return { ...item, learned }
        }
        return item
      })
    }))

    this.setData({
      basicWords,
      phonicsData,
      learnedWords
    })

    if (showToast) {
      wx.showToast({
        title: learned ? '已标记为掌握' : '已取消标记',
        icon: learned ? 'success' : 'none'
      })
    }

    return learned
  },

  markAsLearnedDirect(e) {
    const word = e.currentTarget.dataset.word
    this.toggleWordLearned(word)
  },

  markAsLearned() {
    const currentWord = this.data.currentWord
    const learned = this.toggleWordLearned(currentWord)
    this.setData({
      currentWord: {
        ...currentWord,
        learned
      }
    })
  },

  quickSpeak(e) {
    const word = e.currentTarget.dataset.word.english
    this.speakText(word)
  },

  speakWord() {
    const word = this.data.currentWord.english
    this.speakText(word)
  },

  speakText(text) {
    console.log('开始朗读:', text)
    if (this.data.audioPlayer) {
      this.data.audioPlayer.playText(text)
    }
  },

  // 处理图片触摸滑动
  handleImageTouchStart(e) {
    this.touchStartX = e.touches[0].clientX
    this.touchStartY = e.touches[0].clientY
    this.touchStartTime = Date.now()
  },

  handleImageTouchEnd(e) {
    if (!this.touchStartX || !this.touchStartY) return

    const touchEndX = e.changedTouches[0].clientX
    const touchEndY = e.changedTouches[0].clientY
    const touchEndTime = Date.now()

    const deltaX = touchEndX - this.touchStartX
    const deltaY = touchEndY - this.touchStartY
    const deltaTime = touchEndTime - this.touchStartTime

    // 判断是点击还是滑动
    const isClick = Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 300
    if (isClick) {
      // 点击图片播放声音
      this.speakWord()
      return
    }

    // 滑动判断（水平或垂直滑动距离超过 30px）
    if (Math.abs(deltaX) < 30 && Math.abs(deltaY) < 30) {
      return
    }

    // 往上滑或者往左滑 -> 上一个单词
    if (deltaY < 0 || deltaX < 0) {
      this.prevWord()
    }
    // 往下滑或者往右滑 -> 下一个单词
    else if (deltaY > 0 || deltaX > 0) {
      this.nextWord()
    }

    this.touchStartX = null
    this.touchStartY = null
    this.touchStartTime = null
  }
})
