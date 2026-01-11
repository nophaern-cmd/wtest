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
    const index = this.data.basicWords.findIndex(w => w.english === word.english)
    this.setData({
      currentWord: word,
      currentIndex: index,
      showDetail: true
    })
  },

  hideWordDetail() {
    this.setData({
      showDetail: false
    })
  },

  // 上一个单词
  prevWord() {
    const newIndex = this.data.currentIndex > 0 ? this.data.currentIndex - 1 : this.data.basicWords.length - 1
    this.setData({
      currentWord: this.data.basicWords[newIndex],
      currentIndex: newIndex
    })
  },

  // 下一个单词
  nextWord() {
    const newIndex = this.data.currentIndex < this.data.basicWords.length - 1 ? this.data.currentIndex + 1 : 0
    this.setData({
      currentWord: this.data.basicWords[newIndex],
      currentIndex: newIndex
    })
  },

  // 直接标记为已掌握（从列表点击）
  markAsLearnedDirect(e) {
    const word = e.currentTarget.dataset.word
    let learnedWords = this.data.learnedWords

    if (word.learned) {
      learnedWords = learnedWords.filter(w => w !== word.english)
    } else {
      learnedWords.push(word.english)
    }

    wx.setStorageSync('learnedWordsList', learnedWords)
    wx.setStorageSync('learnedWords', learnedWords.length)

    const basicWords = this.data.basicWords.map(item => {
      if (item.english === word.english) {
        return { ...item, learned: !item.learned }
      }
      return item
    })

    const phonicsData = this.data.phonicsData.map(letter => ({
      ...letter,
      words: letter.words.map(item => {
        if (item.english === word.english) {
          return { ...item, learned: !item.learned }
        }
        return item
      })
    }))

    this.setData({
      basicWords,
      phonicsData,
      learnedWords
    })

    wx.showToast({
      title: word.learned ? '已取消标记' : '已标记为掌握',
      icon: 'none',
      duration: 1000
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

  // 快速朗读单词（从列表直接点击）
  quickSpeak(e) {
    const word = e.currentTarget.dataset.word.english
    this.speakText(word)
  },

  speakWord() {
    const word = this.data.currentWord.english
    this.speakText(word)
  },

  // 朗读文本的通用方法
  speakText(text) {
    console.log('开始朗读:', text)

    // 尝试多个TTS源
    const audioUrls = [
      // 有道TTS (type=2 是美式英语)
      `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=2`,
      // 备用: type=1 是英式英语
      `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=1`,
      // Google Translate TTS
      `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encodeURIComponent(text)}`
    ]

    this.playAudio(audioUrls[0], 0, audioUrls)
  },

  // 播放音频的递归方法
  playAudio(url, index, urls) {
    console.log(`尝试播放音频 ${index + 1}:`, url)

    const audioContext = wx.createInnerAudioContext()
    audioContext.src = url
    audioContext.autoplay = false

    audioContext.onCanplay(() => {
      console.log('音频已就绪，开始播放')
      wx.hideToast()
      audioContext.play()
    })

    audioContext.onPlay(() => {
      console.log('音频正在播放')
    })

    audioContext.onEnded(() => {
      console.log('音频播放结束')
      audioContext.destroy()
    })

    audioContext.onError((res) => {
      console.log(`音频 ${index + 1} 播放失败:`, res)
      audioContext.destroy()

      // 尝试下一个URL
      if (index + 1 < urls.length) {
        this.playAudio(urls[index + 1], index + 1, urls)
      } else {
        wx.hideToast()
        wx.showToast({
          title: '朗读失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  
  // 播放音频的递归方法
  playAudio(url, index, urls) {
    console.log(`尝试播放音频 ${index + 1}:`, url)
    
    const audioContext = wx.createInnerAudioContext()
    audioContext.src = url
    audioContext.autoplay = false
    
    audioContext.onCanplay(() => {
      console.log('音频已就绪，开始播放')
      wx.hideToast()
      audioContext.play()
    })
    
    audioContext.onPlay(() => {
      console.log('音频正在播放')
    })
    
    audioContext.onEnded(() => {
      console.log('音频播放结束')
      audioContext.destroy()
    })
    
    audioContext.onError((res) => {
      console.log(`音频 ${index + 1} 播放失败:`, res)
      audioContext.destroy()
      
      // 尝试下一个URL
      if (index + 1 < urls.length) {
        this.playAudio(urls[index + 1], index + 1, urls)
      } else {
        wx.hideToast()
        wx.showToast({
          title: '朗读失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
})
