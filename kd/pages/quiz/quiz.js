// pages/quiz/quiz.js
const app = getApp()

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
    const quizHistory = wx.getStorageSync('quizHistory') || []
    const totalQuizzes = quizHistory.length

    if (totalQuizzes > 0) {
      const scores = quizHistory.map(q => q.score)
      const highestScore = Math.max(...scores)
      const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / totalQuizzes)

      this.setData({
        highestScore,
        totalQuizzes,
        avgScore
      })
    }
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

    // 随机打乱并取10题
    questions = this.shuffleArray(questions).slice(0, 10)

    this.setData({
      questions,
      totalQuestions: questions.length
    })
  },

  generateWordQuestions() {
    const words = app.globalData.words.basic
    const questions = []

    words.forEach(word => {
      const options = this.generateOptionsWithEmoji(word.english, words, word.chinese, word.emoji)
      questions.push({
        type: 'word',
        question: `选择 "${word.english}" 的意思`,
        options: options,
        correctAnswer: word.chinese,
        questionEmoji: word.emoji
      })
    })

    return questions
  },

  generateSentenceQuestions() {
    const sentences = app.globalData.sentences
    const questions = []

    sentences.forEach(sentence => {
      const options = this.generateOptions(sentence.english, sentences.map(s => s.chinese), sentence.chinese)
      questions.push({
        type: 'sentence',
        question: `选择 "${sentence.english}" 的中文翻译`,
        options: options,
        correctAnswer: sentence.chinese
      })
    })

    return questions
  },

  generateOptions(correct, allOptions, correctText) {
    let options = [correctText]
    const otherOptions = allOptions.filter(o => o !== correctText)
    const shuffled = this.shuffleArray(otherOptions)
    options = [...options, ...shuffled.slice(0, 3)]

    return this.shuffleArray(options).map((opt, index) => ({
      label: ['A', 'B', 'C', 'D'][index],
      text: opt,
      selected: false,
      isCorrect: opt === correctText
    }))
  },

  generateOptionsWithEmoji(correct, allWords, correctText, correctEmoji) {
    let options = [{ text: correctText, emoji: correctEmoji }]
    const otherWords = allWords.filter(w => w.chinese !== correctText)
    const shuffled = this.shuffleArray(otherWords)
    options = [...options, ...shuffled.slice(0, 3).map(w => ({ text: w.chinese, emoji: w.emoji }))]

    return this.shuffleArray(options).map((opt, index) => ({
      label: ['A', 'B', 'C', 'D'][index],
      text: opt.text,
      emoji: opt.emoji,
      selected: false,
      isCorrect: opt.text === correctText
    }))
  },

  shuffleArray(array) {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
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
      this.setData({
        correctCount: this.data.correctCount + 1
      })
      wx.vibrateShort()
    } else {
      wx.vibrateShort({ type: 'heavy' })
    }
  },

  nextQuestion() {
    if (this.data.currentIndex < this.data.totalQuestions - 1) {
      this.setData({
        currentIndex: this.data.currentIndex + 1
      })
      this.loadQuestion()
    } else {
      this.finishQuiz()
    }
  },

  finishQuiz() {
    const endTime = Date.now()
    const timeUsed = Math.round((endTime - this.data.startTime) / 1000)
    const accuracy = Math.round((this.data.correctCount / this.data.totalQuestions) * 100)

    // 保存成绩
    const quizHistory = wx.getStorageSync('quizHistory') || []
    quizHistory.push({
      type: this.data.quizType,
      score: this.data.correctCount,
      total: this.data.totalQuestions,
      accuracy,
      timeUsed,
      date: new Date().toISOString()
    })
    wx.setStorageSync('quizHistory', quizHistory)

    // 更新最高分
    wx.setStorageSync('quizScore', accuracy)

    // 设置结果信息
    let resultEmoji, resultTitle, resultDesc
    if (accuracy >= 90) {
      resultEmoji = '🏆'
      resultTitle = '太棒了！'
      resultDesc = '你的表现非常优秀！'
    } else if (accuracy >= 70) {
      resultEmoji = '👏'
      resultTitle = '做得好！'
      resultDesc = '继续努力，你会更好！'
    } else if (accuracy >= 60) {
      resultEmoji = '💪'
      resultTitle = '继续加油！'
      resultDesc = '多复习一下，下次会更好！'
    } else {
      resultEmoji = '📚'
      resultTitle = '需要复习'
      resultDesc = '多花点时间学习词汇和句型吧！'
    }

    this.setData({
      quizFinished: true,
      endTime,
      timeUsed,
      accuracy,
      resultEmoji,
      resultTitle,
      resultDesc
    })
  },

  restartQuiz() {
    this.startQuiz({
      currentTarget: {
        dataset: {
          type: this.data.quizType
        }
      }
    })
  },

  goHome() {
    wx.reLaunch({
      url: '/pages/index/index'
    })
  }
})
