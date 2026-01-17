// pages/phonics/phonics.js
const app = getApp()
const audio = require('../../utils/audio')

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
    this.setData({ letters })
  },

  selectLetter(e) {
    const letter = e.currentTarget.dataset.letter
    const currentWords = app.globalData.words.phonics[letter]

    this.setData({
      selectedLetter: letter,
      currentWords,
      animatingLetter: letter,
      showAnimation: true
    })

    this.playLetterSound()

    setTimeout(() => {
      this.setData({ showAnimation: false })
    }, 1000)
  },

  playLetterSound() {
    const letter = this.data.selectedLetter
    const letterName = {
      'Aa': 'A', 'Bb': 'B', 'Cc': 'C', 'Dd': 'D', 'Ee': 'E',
      'Hh': 'H', 'Ii': 'I', 'Rr': 'R', 'Ss': 'S'
    }[letter] || letter[0]

    wx.showToast({
      title: `播放字母 ${letter}`,
      icon: 'none',
      duration: 1000
    })

    audio.speakTTS(letterName, { lang: 'en-US' })
  },

  playWordSound(e) {
    const word = e.currentTarget.dataset.word

    wx.showToast({
      title: `播放单词 ${word}`,
      icon: 'none',
      duration: 1000
    })

    audio.speakTTS(word, { lang: 'en-US' })
  }
})
