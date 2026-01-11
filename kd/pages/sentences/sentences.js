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
    this.speakText(sentence)
  },

  // 快速朗读句子（从列表直接点击）
  quickSpeak(e) {
    const sentence = e.currentTarget.dataset.sentence.english
    this.speakText(sentence)
  },

  // 朗读文本的通用方法
  speakText(text) {
    console.log('开始朗读句子:', text)
    
    // 使用有道词典的TTS服务
    const audioUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=2`
    
    const audioContext = wx.createInnerAudioContext()
    audioContext.src = audioUrl
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
      console.log('音频播放失败:', res)
      audioContext.destroy()
      wx.hideToast()
      wx.showToast({
        title: '朗读失败，请在真机测试',
        icon: 'none'
      })
    })
  }
})
