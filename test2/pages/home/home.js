// pages/home/home.js
const app = getApp();

Page({
  data: {
    totalScore: 0,
    totalGames: 0,
    selectedSubject: null,
    difficulty: 'primary',

    subjects: [
      { id: 'chinese', name: '语文', icon: '📖' },
      { id: 'math', name: '数学', icon: '🔢' },
      { id: 'english', name: '英语', icon: '🅰️' },
      { id: 'history', name: '历史', icon: '📜' }
    ],

    games: [
      {
        id: 'poker',
        name: '知识扑克',
        icon: '🃏',
        desc: '配对知识点，完成连击',
        color: '#e74c3c',
        page: 'poker',
        supportedSubjects: ['chinese', 'math', 'english', 'history']
      },
      {
        id: 'angrybird',
        name: '答题大作战',
        icon: '🐦',
        desc: '用正确答案击碎障碍',
        color: '#f39c12',
        page: 'angrybird',
        supportedSubjects: ['chinese', 'english', 'history']
      },
      {
        id: 'tank',
        name: '知识坦克',
        icon: '🎮',
        desc: '守护知识堡垒，击败错误',
        color: '#27ae60',
        page: 'tank',
        supportedSubjects: ['math', 'history']
      }
    ]
  },

  onLoad() {
    this.updateStats();
  },

  onShow() {
    this.updateStats();
  },

  updateStats() {
    const userData = app.globalData.userData;
    if (userData) {
      this.setData({
        totalScore: userData.totalScore || 0,
        totalGames: userData.totalGames || 0
      });
    }
  },

  selectSubject(e) {
    const subjectId = e.currentTarget.dataset.id;
    this.setData({
      selectedSubject: subjectId
    });
  },

  selectDifficulty(e) {
    const level = e.currentTarget.dataset.level;
    this.setData({ difficulty: level });
  },

  isGameSupported(game) {
    if (!this.data.selectedSubject) {
      return false;
    }
    return game.supportedSubjects && game.supportedSubjects.includes(this.data.selectedSubject);
  },

  playGame(e) {
    const game = e.currentTarget.dataset.game;
    const subject = this.data.selectedSubject;

    if (subject && !game.supportedSubjects.includes(subject)) {
      wx.showToast({
        title: '该游戏暂不支持此学科',
        icon: 'none'
      });
      return;
    }

    if (!subject) {
      wx.showModal({
        title: '提示',
        content: '请先选择一个学科',
        showCancel: false
      });
      return;
    }

    wx.navigateTo({
      url: `/pages/${game.page}/${game.page}?subject=${subject}&difficulty=${this.data.difficulty}`
    });
  },

  quickPlay(e) {
    const subject = e.currentTarget.dataset.subject;
    const game = e.currentTarget.dataset.game;

    wx.navigateTo({
      url: `/pages/${game}/${game}?subject=${subject}&difficulty=${this.data.difficulty}`
    });
  }
});
