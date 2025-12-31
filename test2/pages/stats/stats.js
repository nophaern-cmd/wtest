// pages/stats/stats.js
const app = getApp();

Page({
  data: {
    totalScore: 0,
    totalGames: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    accuracy: 0,
    lastPlayTime: '从未',

    subjectStats: [],
    gameStats: [],
    achievements: []
  },

  onLoad() {
    this.loadStats();
  },

  onShow() {
    this.loadStats();
  },

  loadStats() {
    const userData = app.globalData.userData;
    if (!userData) {
      return;
    }

    const totalScore = userData.totalScore || 0;
    const totalGames = userData.totalGames || 0;
    const totalQuestions = userData.totalQuestions || 0;
    const totalCorrect = userData.totalCorrect || 0;
    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    const lastPlayTime = userData.lastPlayTime
      ? this.formatTime(userData.lastPlayTime)
      : '从未';

    const subjectStats = this.calculateSubjectStats(userData.subjectProgress);
    const gameStats = this.calculateGameStats(userData.gameProgress);
    const achievements = this.calculateAchievements(userData);

    this.setData({
      totalScore,
      totalGames,
      totalQuestions,
      totalCorrect,
      accuracy,
      lastPlayTime,
      subjectStats,
      gameStats,
      achievements
    });
  },

  calculateSubjectStats(progress) {
    const subjects = [
      { id: 'chinese', name: '语文', icon: '📖', color: '#FF6B6B' },
      { id: 'math', name: '数学', icon: '🔢', color: '#52C41A' },
      { id: 'english', name: '英语', icon: '🅰️', color: '#4A90E2' },
      { id: 'history', name: '历史', icon: '📜', color: '#9B59B6' }
    ];

    return subjects.map(subject => {
      const data = progress[subject.id] || { total: 0, correct: 0 };
      const accuracy = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;

      return {
        ...subject,
        total: data.total,
        correct: data.correct,
        accuracy
      };
    });
  },

  calculateGameStats(progress) {
    const games = [
      { id: 'poker', name: '知识扑克', icon: '🃏' },
      { id: 'angrybird', name: '答题大作战', icon: '🐦' },
      { id: 'tank', name: '知识坦克', icon: '🎮' }
    ];

    return games.map(game => {
      const data = progress[game.id] || { total: 0, correct: 0 };
      const accuracy = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;

      return {
        ...game,
        total: data.total,
        correct: data.correct,
        accuracy
      };
    });
  },

  calculateAchievements(userData) {
    const achievements = [
      {
        id: 'first_game',
        name: '初次体验',
        desc: '完成第1个游戏',
        icon: '🌟',
        unlocked: userData.totalGames >= 1
      },
      {
        id: 'ten_games',
        name: '游戏达人',
        desc: '完成10个游戏',
        icon: '🎯',
        unlocked: userData.totalGames >= 10
      },
      {
        id: 'hundred_questions',
        name: '题海战士',
        desc: '答题100道',
        icon: '📚',
        unlocked: userData.totalQuestions >= 100
      },
      {
        id: 'high_accuracy',
        name: '准确大师',
        desc: '正确率超过80%',
        icon: '💯',
        unlocked: userData.totalQuestions >= 10 &&
                    (userData.totalCorrect / userData.totalQuestions) >= 0.8
      },
      {
        id: 'score_1000',
        name: '千分成就',
        desc: '总分达到1000',
        icon: '🏆',
        unlocked: userData.totalScore >= 1000
      },
      {
        id: 'all_subjects',
        name: '全面发展',
        desc: '尝试所有学科',
        icon: '🌈',
        unlocked: Object.keys(userData.subjectProgress).length >= 4
      }
    ];

    return achievements;
  },

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) {
      return '刚刚';
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`;
    } else if (diff < 604800000) {
      return `${Math.floor(diff / 86400000)}天前`;
    } else {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  },

  clearData() {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有学习数据吗？此操作不可恢复！',
      confirmText: '确定清除',
      confirmColor: '#F44336',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.removeStorageSync('userData');

            app.globalData.userData = {
              totalGames: 0,
              totalScore: 0,
              totalCorrect: 0,
              totalQuestions: 0,
              subjectProgress: {},
              gameProgress: {},
              lastPlayTime: null,
              streakDays: 0
            };

            this.loadStats();

            wx.showToast({
              title: '数据已清除',
              icon: 'success'
            });
          } catch (e) {
            wx.showToast({
              title: '清除失败',
              icon: 'error'
            });
          }
        }
      }
    });
  }
});
