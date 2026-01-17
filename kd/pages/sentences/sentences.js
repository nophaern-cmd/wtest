// pages/sentences/sentences.js
const app = getApp()
const storage = require('../../utils/storage')
const audio = require('../../utils/audio')
const category = require('../../utils/category')

Page({
  data: {
    currentCategory: 'all',
    filteredSentences: [],
    showDetail: false,
    currentSentence: {},
    learnedSentences: [],
    categories: category.SENTENCE_CATEGORIES,
    audioPlayer: null
  },

  onLoad() {
    this.setData({
      audioPlayer: audio.createPlayer()
    })
    this.loadSentences()
    this.loadProgress()
  },

  onUnload() {
    if (this.data.audioPlayer) {
      this.data.audioPlayer.destroy()
    }
  },

  loadSentences() {
    const sentences = category.enrichSentences(app.globalData.sentences, this.data.learnedSentences)
    this.setData({ filteredSentences: sentences })
  },

  loadProgress() {
    const learnedSentences = storage.get(storage.STORAGE_KEYS.LEARNED_SENTENCES_LIST, [])
    const sentences = category.enrichSentences(app.globalData.sentences, learnedSentences)
    this.setData({
      filteredSentences: sentences,
      learnedSentences
    })
  },

  filterCategory(e) {
    const categoryValue = e.currentTarget.dataset.category
    const allSentences = category.enrichSentences(app.globalData.sentences, this.data.learnedSentences)
    const filteredSentences = category.filterSentencesByCategory(allSentences, categoryValue)

    this.setData({
      currentCategory: categoryValue,
      filteredSentences
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
    this.setData({ showDetail: false })
  },

  markAsLearned() {
    const currentSentence = this.data.currentSentence
    const learnedSentences = storage.updateSentenceProgress(currentSentence.english, !currentSentence.learned)
    const learned = !currentSentence.learned

    const filteredSentences = this.data.filteredSentences.map(sentence => {
      if (sentence.english === currentSentence.english) {
        return { ...sentence, learned }
      }
      return sentence
    })

    this.setData({
      filteredSentences,
      learnedSentences,
      currentSentence: {
        ...currentSentence,
        learned
      }
    })

    wx.showToast({
      title: learned ? '已标记为掌握' : '已取消标记',
      icon: 'success'
    })
  },

  speakSentence() {
    const sentence = this.data.currentSentence.english
    this.speakText(sentence)
  },

  quickSpeak(e) {
    const sentence = e.currentTarget.dataset.sentence.english
    this.speakText(sentence)
  },

  speakText(text) {
    console.log('开始朗读句子:', text)
    if (this.data.audioPlayer) {
      this.data.audioPlayer.playText(text)
    }
  }
})
