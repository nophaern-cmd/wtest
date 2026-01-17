// pages/quiz/quiz.js
const app = getApp()
const storage = require('../../utils/storage')
const category = require('../../utils/category')

Page({
  data: {
    quizStarted: false,
    quizFinished: false,
    quizType: '',
    questions: [],
    currentIndex: 0,
    correctCount: 0,
    showResult: false,
    currentQuestion: {},
    totalQuestions: 0,
    highestScore: 0,
    totalQuizzes: 0,
    avgScore: 0,
    startTime: 0,
    endTime: 0,
    timeUsed: 0,
    accuracy: 0,
    resultEmoji: '',
    resultTitle: '',
    resultDesc: ''
  },

  onLoad() {
    this.loadStats()
  },

  onShow() {
    this.loadStats()
  },

  loadStats() {
    const stats = storage.getQuizStats()
    this.setData(stats)
  },

  startQuiz(e) {
    const type = e.currentTarget.dataset.type
    this.generateQuestions(type)

    this.setData({
      quizStarted: true,
      quizFinished: false,
      quizType: type,
      currentIndex: 0,
      correctCount: 0,
      startTime: Date.now()
    })

    this.loadQuestion()
  },

  generateQuestions(type) {
    let questions = []

    if (type === 'words') {
      questions = this.generateWordQuestions()
    } else if (type === 'sentences') {
      questions = this.generateSentenceQuestions()
    } else {
      questions = [...this.generateWordQuestions(), ...this.generateSentenceQuestions()]
    }

    questions = category.shuffleArray(questions).slice(0, 10)

    this.setData({
      questions,
      totalQuestions: questions.length
    })
  },

  generateWordQuestions() {
    const words = app.globalData.words.basic
    return words.map(word => {
      const options = this.generateOptionsWithEmoji(word.english, words, word.chinese, word.emoji)
      return {
        type: 'word',
        question: `选择 "${word.english}" 的意思`,
        options,
        correctAnswer: word.chinese,
        questionEmoji: word.emoji
      }
    })
  },

  generateSentenceQuestions() {
    const sentences = app.globalData.sentences
    return sentences.map(sentence => {
      const options = this.generateOptions(sentence.english, sentences.map(s => s.chinese), sentence.chinese)
      return {
        type: 'sentence',
        question: `选择 "${sentence.english}" 的中文翻译`,
        options,
        correctAnswer: sentence.chinese
      }
    })
  },

  generateOptions(correct, allOptions, correctText) {
    let options = [correctText]
    const otherOptions = allOptions.filter(o => o !== correctText)
    const shuffled = category.shuffleArray(otherOptions)
    options = [...options, ...shuffled.slice(0, 3)]

    return category.shuffleArray(options).map((opt, index) => ({
      label: ['A', 'B', 'C', 'D'][index],
      text: opt,
      selected: false,
      isCorrect: opt === correctText
    }))
  },

  generateOptionsWithEmoji(correct, allWords, correctText, correctEmoji) {
    let options = [{ text: correctText, emoji: correctEmoji }]
    const otherWords = allWords.filter(w => w.chinese !== correctText)
    const shuffled = category.shuffleArray(otherWords)
    options = [...options, ...shuffled.slice(0, 3).map(w => ({ text: w.chinese, emoji: w.emoji }))]

    return category.shuffleArray(options).map((opt, index) => ({
      label: ['A', 'B', 'C', 'D'][index],
      text: opt.text,
      emoji: opt.emoji,
      selected: false,
      isCorrect: opt.text === correctText
    }))
  },

  loadQuestion() {
    const currentQuestion = this.data.questions[this.data.currentIndex]
    this.setData({
      currentQuestion,
      showResult: false
    })
  },

  selectOption(e) {
    if (this.data.showResult) return

    const index = e.currentTarget.dataset.index
    const currentQuestion = this.data.currentQuestion

    const options = currentQuestion.options.map((opt, i) => ({
      ...opt,
      selected: i === index
    }))

    this.setData({
      currentQuestion: {
        ...currentQuestion,
        options
      },
      showResult: true
    })

    if (options[index].isCorrect) {
      this.setData({ correctCount: this.data.correctCount + 1 })
      wx.vibrateShort()
    } else {
      wx.vibrateShort({ type: 'heavy' })
    }
  },

  nextQuestion() {
    if (this.data.currentIndex < this.data.totalQuestions - 1) {
      this.setData({ currentIndex: this.data.currentIndex + 1 })
      this.loadQuestion()
    } else {
      this.finishQuiz()
    }
  },

  finishQuiz() {
    const endTime = Date.now()
    const timeUsed = Math.round((endTime - this.data.startTime) / 1000)
    const accuracy = Math.round((this.data.correctCount / this.data.totalQuestions) * 100)

    storage.saveQuizScore({
      type: this.data.quizType,
      score: this.data.correctCount,
      total: this.data.totalQuestions,
      accuracy,
      timeUsed,
      date: new Date().toISOString()
    })

    const { emoji, title, desc } = this.getResultInfo(accuracy)

    this.setData({
      quizFinished: true,
      endTime,
      timeUsed,
      accuracy,
      resultEmoji: emoji,
      resultTitle: title,
      resultDesc: desc
    })
  },

  getResultInfo(accuracy) {
    if (accuracy >= 90) {
      return { emoji: '🏆', title: '太棒了！', desc: '你的表现非常优秀！' }
    }
    if (accuracy >= 70) {
      return { emoji: '👏', title: '做得好！', desc: '继续努力，你会更好！' }
    }
    if (accuracy >= 60) {
      return { emoji: '💪', title: '继续加油！', desc: '多复习一下，下次会更好！' }
    }
    return { emoji: '📚', title: '需要复习', desc: '多花点时间学习词汇和句型吧！' }
  },

  restartQuiz() {
    this.startQuiz({
      currentTarget: { dataset: { type: this.data.quizType } }
    })
  },

  goHome() {
    wx.reLaunch({ url: '/pages/index/index' })
  }
})
