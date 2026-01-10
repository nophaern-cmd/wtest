// pages/words/words.js
const app = getApp()

Page({
  data: {
    activeTab: 'basic',
    basicWords: [],
    phonicsData: [],
    showDetail: false,
    currentWord: {},
    learnedWords: []
  },

  onLoad() {
    this.loadWords()
    this.loadProgress()
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
    const learnedWords = wx.getStorageSync('learnedWordsList') || []

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
    this.setData({
      activeTab: tab
    })
  },

  toggleLetter(e) {
    const letter = e.currentTarget.dataset.letter
    const phonicsData = this.data.phonicsData.map(item => {
      if (item.letter === letter) {
        return {
          ...item,
          expanded: !item.expanded
        }
      }
      return item
    })

    this.setData({
      phonicsData
    })
  },

  showWordDetail(e) {
    const word = e.currentTarget.dataset.word
    this.setData({
      currentWord: word,
      showDetail: true
    })
  },

  hideWordDetail() {
    this.setData({
      showDetail: false
    })
  },

  markAsLearned() {
    const currentWord = this.data.currentWord
    let learnedWords = this.data.learnedWords

    if (currentWord.learned) {
      learnedWords = learnedWords.filter(w => w !== currentWord.english)
    } else {
      learnedWords.push(currentWord.english)
    }

    wx.setStorageSync('learnedWordsList', learnedWords)
    wx.setStorageSync('learnedWords', learnedWords.length)

    const basicWords = this.data.basicWords.map(word => {
      if (word.english === currentWord.english) {
        return { ...word, learned: !word.learned }
      }
      return word
    })

    const phonicsData = this.data.phonicsData.map(letter => ({
      ...letter,
      words: letter.words.map(word => {
        if (word.english === currentWord.english) {
          return { ...word, learned: !word.learned }
        }
        return word
      })
    }))

    this.setData({
      basicWords,
      phonicsData,
      learnedWords,
      currentWord: {
        ...currentWord,
        learned: !currentWord.learned
      }
    })

    wx.showToast({
      title: currentWord.learned ? '已取消标记' : '已标记为掌握',
      icon: 'success'
    })
  },

  speakWord() {
    const word = this.data.currentWord.english
    const that = this

    wx.showToast({
      title: '正在朗读...',
      icon: 'none'
    })

    // 使用微信语音合成
    if (wx.createInnerAudioContext) {
      // 使用文本转语音
      if (typeof wx.createTtsContext === 'function') {
        const tts = wx.createTtsContext()
        tts.speak({
          text: word,
          lang: 'en-US',
          success: () => {
            console.log('朗读成功')
          },
          fail: (err) => {
            console.log('朗读失败', err)
          }
        })
      } else {
        wx.showToast({
          title: '朗读功能暂不可用',
          icon: 'none'
        })
      }
    }
  }
})
