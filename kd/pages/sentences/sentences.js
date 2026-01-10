// pages/sentences/sentences.js
const app = getApp()

Page({
  data: {
    currentCategory: 'all',
    filteredSentences: [],
    showDetail: false,
    currentSentence: {},
    learnedSentences: [],
    categories: {
      size: '大小',
      description: '描述',
      daily: '日常',
      greeting: '问候',
      question: '询问',
      festival: '节日',
      speed: '速度'
    }
  },

  onLoad() {
    this.loadSentences()
    this.loadProgress()
  },

  loadSentences() {
    const sentences = app.globalData.sentences.map(sentence => {
      let category = 'description'
      if (sentence.english.includes('big') || sentence.english.includes('small')) {
        category = 'size'
      } else if (sentence.english.includes('How are you') || sentence.english.includes('happy') || sentence.english.includes('name')) {
        category = 'greeting'
      } else if (sentence.english.includes('Christmas') || sentence.english.includes('Halloween') || sentence.english.includes('Trick')) {
        category = 'festival'
      } else if (sentence.english.includes('fast') || sentence.english.includes('slow')) {
        category = 'speed'
      } else if (sentence.english.includes('What') || sentence.english.includes('What\'s')) {
        category = 'question'
      }
      return {
        ...sentence,
        category,
        learned: false
      }
    })

    this.setData({
      filteredSentences: sentences
    })
  },

  loadProgress() {
    const learnedSentences = wx.getStorageSync('learnedSentencesList') || []

    const sentences = app.globalData.sentences.map(sentence => {
      let category = 'description'
      if (sentence.english.includes('big') || sentence.english.includes('small')) {
        category = 'size'
      } else if (sentence.english.includes('How are you') || sentence.english.includes('happy') || sentence.english.includes('name')) {
        category = 'greeting'
      } else if (sentence.english.includes('Christmas') || sentence.english.includes('Halloween') || sentence.english.includes('Trick')) {
        category = 'festival'
      } else if (sentence.english.includes('fast') || sentence.english.includes('slow')) {
        category = 'speed'
      } else if (sentence.english.includes('What') || sentence.english.includes('What\'s')) {
        category = 'question'
      }
      return {
        ...sentence,
        category,
        learned: learnedSentences.includes(sentence.english)
      }
    })

    this.setData({
      filteredSentences: sentences,
      learnedSentences
    })
  },

  filterCategory(e) {
    const category = e.currentTarget.dataset.category
    let sentences = app.globalData.sentences

    if (category !== 'all') {
      sentences = sentences.filter(sentence => {
        let sCategory = 'description'
        if (sentence.english.includes('big') || sentence.english.includes('small')) {
          sCategory = 'size'
        } else if (sentence.english.includes('How are you') || sentence.english.includes('happy') || sentence.english.includes('name')) {
          sCategory = 'greeting'
        } else if (sentence.english.includes('Christmas') || sentence.english.includes('Halloween') || sentence.english.includes('Trick')) {
          sCategory = 'festival'
        } else if (sentence.english.includes('fast') || sentence.english.includes('slow')) {
          sCategory = 'speed'
        } else if (sentence.english.includes('What') || sentence.english.includes('What\'s')) {
          sCategory = 'question'
        }
        return sCategory === category
      })
    }

    this.setData({
      currentCategory: category,
      filteredSentences: sentences.map(sentence => ({
        ...sentence,
        learned: this.data.learnedSentences.includes(sentence.english)
      }))
    })
  },

  showSentenceDetail(e) {
    const sentence = e.currentTarget.dataset.sentence
    this.setData({
      currentSentence: sentence,
      showDetail: true
    })
  },

  hideSentenceDetail() {
    this.setData({
      showDetail: false
    })
  },

  markAsLearned() {
    const currentSentence = this.data.currentSentence
    let learnedSentences = this.data.learnedSentences

    if (currentSentence.learned) {
      learnedSentences = learnedSentences.filter(s => s !== currentSentence.english)
    } else {
      learnedSentences.push(currentSentence.english)
    }

    wx.setStorageSync('learnedSentencesList', learnedSentences)
    wx.setStorageSync('learnedSentences', learnedSentences.length)

    const filteredSentences = this.data.filteredSentences.map(sentence => {
      if (sentence.english === currentSentence.english) {
        return { ...sentence, learned: !sentence.learned }
      }
      return sentence
    })

    this.setData({
      filteredSentences,
      learnedSentences,
      currentSentence: {
        ...currentSentence,
        learned: !currentSentence.learned
      }
    })

    wx.showToast({
      title: currentSentence.learned ? '已取消标记' : '已标记为掌握',
      icon: 'success'
    })
  },

  speakSentence() {
    const sentence = this.data.currentSentence.english

    wx.showToast({
      title: '正在朗读...',
      icon: 'none'
    })

    // 使用微信语音合成
    if (typeof wx.createTtsContext === 'function') {
      const tts = wx.createTtsContext()
      tts.speak({
        text: sentence,
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
})
