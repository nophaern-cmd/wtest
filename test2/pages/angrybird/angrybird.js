// pages/angrybird/angrybird.js
const app = getApp();

Page({
  data: {
    subject: '',
    subjectName: '',
    difficulty: 'primary',
    gameStarted: false,
    gameOver: false,
    score: 0,
    lives: 3,
    currentRound: 0,
    totalRounds: 10,
    correctCount: 0,
    wrongCount: 0,
    combo: 0,
    maxCombo: 0,
    currentScore: 0,

    currentQuestion: {},
    options: [],
    obstacleHP: 3,
    obstacleHit: false,
    showResult: false,
    resultType: '',

    questionBank: [],
    usedQuestions: []
  },

  onLoad(options) {
    const subject = options.subject || 'english';
    const difficulty = options.difficulty || 'primary';

    const subjectMap = {
      chinese: '语文',
      math: '数学',
      english: '英语',
      history: '历史'
    };

    this.setData({
      subject,
      subjectName: subjectMap[subject] || subject,
      difficulty,
      questionBank: app.getQuestions(subject, difficulty)
    });
  },

  startGame() {
    this.setData({
      gameStarted: true,
      gameOver: false,
      score: 0,
      lives: 3,
      currentRound: 0,
      correctCount: 0,
      wrongCount: 0,
      combo: 0,
      maxCombo: 0,
      obstacleHP: 3,
      usedQuestions: []
    });

    this.nextQuestion();
  },

  nextQuestion() {
    if (this.data.currentRound >= this.data.totalRounds || this.data.lives <= 0) {
      this.endGame();
      return;
    }

    const questions = this.data.questionBank;
    const availableQuestions = questions.filter(q => !this.data.usedQuestions.includes(q.question));

    if (availableQuestions.length === 0) {
      this.setData({ usedQuestions: [] });
    }

    const finalQuestions = this.data.usedQuestions.length === 0
      ? questions
      : questions.filter(q => !this.data.usedQuestions.includes(q.question));

    const randomIndex = Math.floor(Math.random() * finalQuestions.length);
    const question = finalQuestions[randomIndex];

    const options = [...question.options].sort(() => Math.random() - 0.5);
    const optionObjects = options.map(opt => ({
      text: opt,
      correct: opt === question.answer,
      selected: false,
      result: ''
    }));

    this.setData({
      usedQuestions: [...this.data.usedQuestions, question.question],
      currentQuestion: question,
      options: optionObjects,
      showResult: false,
      obstacleHit: false
    });
  },

  selectOption(e) {
    if (this.data.showResult) return;

    const index = e.currentTarget.dataset.index;
    const options = [...this.data.options];
    options[index].selected = true;

    const selectedOption = options[index];
    const isCorrect = selectedOption.correct;

    options.forEach((opt, i) => {
      if (i === index) {
        opt.result = isCorrect ? 'correct' : 'wrong';
      } else if (opt.correct) {
        opt.result = 'correct';
      }
    });

    this.setData({
      options,
      showResult: true,
      resultType: isCorrect ? 'correct' : 'wrong',
      obstacleHit: isCorrect
    });

    if (isCorrect) {
      const combo = this.data.combo + 1;
      const maxCombo = Math.max(combo, this.data.maxCombo);
      const comboBonus = Math.floor(combo * 3);
      const currentScore = 10 + comboBonus;

      this.setData({
        score: this.data.score + currentScore,
        currentScore,
        correctCount: this.data.correctCount + 1,
        combo,
        maxCombo,
        obstacleHP: Math.max(0, this.data.obstacleHP - 1),
        currentRound: this.data.currentRound + 1
      });

      if (this.data.obstacleHP <= 0) {
        this.setData({ obstacleHP: 3 });
      }

      this.saveProgress(true);
    } else {
      this.setData({
        lives: this.data.lives - 1,
        currentScore: -5,
        wrongCount: this.data.wrongCount + 1,
        combo: 0,
        currentRound: this.data.currentRound + 1
      });

      this.saveProgress(false);
    }

    setTimeout(() => {
      if (this.data.lives <= 0 || this.data.currentRound >= this.data.totalRounds) {
        this.endGame();
      } else {
        this.nextQuestion();
      }
    }, 1500);
  },

  saveProgress(isCorrect) {
    const userData = app.globalData.userData;
    const subject = this.data.subject;
    const game = 'angrybird';

    if (!userData.subjectProgress[subject]) {
      userData.subjectProgress[subject] = { total: 0, correct: 0 };
    }
    if (!userData.gameProgress[game]) {
      userData.gameProgress[game] = { total: 0, correct: 0 };
    }

    userData.subjectProgress[subject].total++;
    userData.gameProgress[game].total++;
    if (isCorrect) {
      userData.subjectProgress[subject].correct++;
      userData.gameProgress[game].correct++;
    }

    app.saveUserData();
  },

  endGame() {
    const userData = app.globalData.userData;
    userData.totalGames++;
    userData.totalScore += this.data.score;
    userData.totalCorrect += this.data.correctCount;
    userData.totalQuestions += this.data.currentRound;
    userData.lastPlayTime = new Date().getTime();

    app.saveUserData();

    this.setData({
      gameOver: true,
      score: userData.totalScore
    });
  },

  restartGame() {
    this.startGame();
  },

  goHome() {
    wx.switchTab({
      url: '/pages/home/home'
    });
  }
});
