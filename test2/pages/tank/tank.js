// pages/tank/tank.js
const app = getApp();

Page({
  data: {
    subject: '',
    subjectName: '',
    difficulty: 'primary',
    gameStarted: false,
    gameOver: false,
    score: 0,
    fortressHP: 100,
    maxFortressHP: 100,
    currentRound: 0,
    totalRounds: 10,
    correctCount: 0,
    wrongCount: 0,

    currentQuestion: {},
    options: [],
    enemies: [],
    tankX: 50,
    tankMoving: false,
    showAttack: false,
    enemyTimer: null,

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
      fortressHP: 100,
      maxFortressHP: 100,
      currentRound: 0,
      correctCount: 0,
      wrongCount: 0,
      usedQuestions: [],
      enemies: []
    });

    this.nextWave();
  },

  nextWave() {
    if (this.data.currentRound >= this.data.totalRounds || this.data.fortressHP <= 0) {
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
      state: ''
    }));

    const enemyCount = Math.min(2 + Math.floor(this.data.currentRound / 2), 4);
    const enemies = [];
    const enemyEmojis = ['👹', '👾', '🤖', '👽', '🦾'];

    for (let i = 0; i < enemyCount; i++) {
      const isCorrectEnemy = Math.random() < 0.4;
      const randomOption = options[Math.floor(Math.random() * options.length)];

      enemies.push({
        id: Date.now() + i,
        emoji: enemyEmojis[i % enemyEmojis.length],
        text: isCorrectEnemy ? question.answer : randomOption,
        x: 20 + (i * (60 / (enemyCount - 1 || 1))),
        y: 10,
        shooting: false,
        isCorrect: isCorrectEnemy
      });
    }

    this.setData({
      usedQuestions: [...this.data.usedQuestions, question.question],
      currentQuestion: question,
      options: optionObjects,
      enemies,
      tankMoving: false,
      showAttack: false
    });

    this.startEnemyMove();
  },

  startEnemyMove() {
    if (this.data.enemyTimer) {
      clearInterval(this.data.enemyTimer);
    }

    const timer = setInterval(() => {
      const enemies = this.data.enemies.map(enemy => ({
        ...enemy,
        y: enemy.y + 2
      }));

      const fortressHit = enemies.some(enemy => enemy.y >= 70);
      if (fortressHit) {
        this.setData({
          fortressHP: Math.max(0, this.data.fortressHP - 10),
          enemies: enemies.filter(e => e.y < 70),
          wrongCount: this.data.wrongCount + 1
        });

        if (this.data.fortressHP <= 0) {
          clearInterval(timer);
          this.endGame();
          return;
        }
      } else {
        this.setData({ enemies });
      }

      if (enemies.filter(e => e.y < 70).length === 0) {
        clearInterval(timer);
        this.setData({
          currentRound: this.data.currentRound + 1
        });

        setTimeout(() => {
          this.nextWave();
        }, 1000);
      }
    }, 1000);

    this.setData({ enemyTimer: timer });
  },

  selectOption(e) {
    const index = e.currentTarget.dataset.index;
    const options = [...this.data.options];
    const selectedOption = options[index];
    const isCorrect = selectedOption.correct;

    options.forEach((opt, i) => {
      if (i === index) {
        opt.state = isCorrect ? 'correct' : 'wrong';
      } else if (opt.correct) {
        opt.state = 'correct';
      }
    });

    this.setData({
      options,
      showAttack: true
    });

    if (this.data.enemyTimer) {
      clearInterval(this.data.enemyTimer);
      this.setData({ enemyTimer: null });
    }

    const enemies = this.data.enemies.map(enemy => {
      if (enemy.text === selectedOption.text) {
        return { ...enemy, shooting: true };
      }
      return enemy;
    });

    this.setData({ enemies });

    setTimeout(() => {
      this.setData({ showAttack: false });

      if (isCorrect) {
        const correctEnemies = enemies.filter(e => e.text === selectedOption.text);
        const bonus = correctEnemies.length * 15;

        this.setData({
          score: this.data.score + 10 + bonus,
          correctCount: this.data.correctCount + 1,
          enemies: enemies.filter(e => e.text !== selectedOption.text)
        });

        this.saveProgress(true);

        if (this.data.enemies.filter(e => e.text !== selectedOption.text).length === 0) {
          this.setData({ currentRound: this.data.currentRound + 1 });
          setTimeout(() => {
            this.nextWave();
          }, 1000);
        } else {
          this.startEnemyMove();
        }
      } else {
        this.setData({
          fortressHP: Math.max(0, this.data.fortressHP - 15),
          wrongCount: this.data.wrongCount + 1
        });

        this.saveProgress(false);

        if (this.data.fortressHP <= 0) {
          this.endGame();
        } else {
          this.startEnemyMove();
        }
      }
    }, 500);
  },

  saveProgress(isCorrect) {
    const userData = app.globalData.userData;
    const subject = this.data.subject;
    const game = 'tank';

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
    if (this.data.enemyTimer) {
      clearInterval(this.data.enemyTimer);
    }

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
  },

  onUnload() {
    if (this.data.enemyTimer) {
      clearInterval(this.data.enemyTimer);
    }
  }
});
