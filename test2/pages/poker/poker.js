// pages/poker/poker.js
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

    topCard: {},
    bottomCard: {},
    topCardFlipped: false,
    bottomCardFlipped: false,
    resultShown: false,
    isCorrect: false,
    correctAnswer: '',

    questionBank: [],
    usedQuestions: []
  },

  onLoad(options) {
    const subject = options.subject || 'math';
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
      usedQuestions: []
    });

    this.nextRound();
  },

  nextRound() {
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

    this.setData({
      usedQuestions: [...this.data.usedQuestions, question.question],
      topCard: {
        question: question.question,
        hint: question.hint || '请判断下方卡片是否为正确答案'
      },
      bottomCard: {
        answer: this.generateAnswer(question),
        isCorrect: Math.random() > 0.3
      },
      topCardFlipped: false,
      bottomCardFlipped: false,
      resultShown: false,
      isCorrect: false,
      correctAnswer: question.answer
    });
  },

  generateAnswer(question) {
    if (Math.random() > 0.3) {
      return question.answer;
    }

    const wrongOptions = question.options.filter(opt => opt !== question.answer);
    return wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
  },

  flipCard(e) {
    const position = e.currentTarget.dataset.position;
    if (position === 'top') {
      this.setData({ topCardFlipped: !this.data.topCardFlipped });
    } else {
      this.setData({ bottomCardFlipped: !this.data.bottomCardFlipped });
    }
  },

  checkMatch(e) {
    const userMatch = e.currentTarget.dataset.match;
    const isCorrectAnswer = this.data.bottomCard.answer === this.data.correctAnswer;

    const isCorrect = (userMatch && isCorrectAnswer) || (!userMatch && !isCorrectAnswer);

    this.setData({ resultShown: true, isCorrect });

    if (isCorrect) {
      const combo = this.data.combo + 1;
      const maxCombo = Math.max(combo, this.data.maxCombo);
      const comboBonus = Math.floor(combo * 2);

      this.setData({
        score: this.data.score + 10 + comboBonus,
        correctCount: this.data.correctCount + 1,
        combo,
        maxCombo,
        currentRound: this.data.currentRound + 1
      });

      this.saveProgress(true);
    } else {
      this.setData({
        lives: this.data.lives - 1,
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
        this.nextRound();
      }
    }, 1500);
  },

  saveProgress(isCorrect) {
    const userData = app.globalData.userData;
    const subject = this.data.subject;
    const game = 'poker';

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
