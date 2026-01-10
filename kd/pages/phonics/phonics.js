// pages/phonics/phonics.js
const app = getApp()

Page({
  data: {
    letters: [],
    selectedLetter: '',
    currentWords: [],
    showAnimation: false,
    animatingLetter: ''
  },

  onLoad() {
    this.loadLetters()
  },

  loadLetters() {
    const phonicsData = app.globalData.words.phonics
    const letters = Object.keys(phonicsData).map(letter => ({
      letter,
      count: phonicsData[letter].length
    }))

    this.setData({
      letters
    })
  },

  selectLetter(e) {
    const letter = e.currentTarget.dataset.letter
    const phonicsData = app.globalData.words.phonics
    const currentWords = phonicsData[letter]

    this.setData({
      selectedLetter: letter,
      currentWords,
      animatingLetter: letter,
      showAnimation: true
    })

    // 自动播放字母发音
    this.playLetterSound()

    // 动画1秒后关闭
    setTimeout(() => {
      this.setData({
        showAnimation: false
      })
    }, 1000)
  },

  playLetterSound() {
    const letter = this.data.selectedLetter

    wx.showToast({
      title: `播放字母 ${letter}`,
      icon: 'none',
      duration: 1000
    })

    // 使用微信语音合成播放字母发音
    if (typeof wx.createTtsContext === 'function') {
      const tts = wx.createTtsContext()
      const letterName = {
        'Aa': 'A', 'Bb': 'B', 'Cc': 'C', 'Dd': 'D', 'Ee': 'E',
        'Hh': 'H', 'Ii': 'I', 'Rr': 'R', 'Ss': 'S'
      }[letter] || letter[0]

      tts.speak({
        text: letterName,
        lang: 'en-US',
        success: () => {
          console.log('播放成功')
        },
        fail: (err) => {
          console.log('播放失败', err)
        }
      })
    } else {
      wx.showToast({
        title: '语音功能暂不可用',
        icon: 'none'
      })
    }
  },

  playWordSound(e) {
    const word = e.currentTarget.dataset.word

    wx.showToast({
      title: `播放单词 ${word}`,
      icon: 'none',
      duration: 1000
    })

    // 使用微信语音合成播放单词
    if (typeof wx.createTtsContext === 'function') {
      const tts = wx.createTtsContext()
      tts.speak({
        text: word,
        lang: 'en-US',
        success: () => {
          console.log('播放成功')
        },
        fail: (err) => {
          console.log('播放失败', err)
        }
      })
    } else {
      wx.showToast({
        title: '语音功能暂不可用',
        icon: 'none'
      })
    }
  }
})
