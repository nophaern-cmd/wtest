// pages/category-select/category-select.js
const app = getApp()

Page({
  data: {
    stage: 'kindergarten',
    mode: '1',
    filterType: 'all',
    categories: [],
    totalWords: 0,
    learnedWords: 0,
    masteredWords: 0
  },

  onLoad(options) {
    if (options.stage) {
      this.setData({ stage: options.stage })
    }
    if (options.mode) {
      this.setData({ mode: options.mode })
    }
    this.loadCategories()
    this.loadStats()
    this.updatePageStyle()
  },

  // 加载分类数据
  loadCategories() {
    const categories = this.getCategoriesByStage(this.data.stage)
    this.setData({ categories })
  },

  // 根据阶段获取分类
    getCategoriesByStage(stage) {
    const categoryMaps = {
      kindergarten: [
        { id: '26字母', name: '26字母', icon: '🔤', wordCount: 26, difficulty: 1, progress: 0 },
        { id: '颜色', name: '颜色', icon: '🌈', wordCount: 9, difficulty: 1, progress: 0 },
        { id: '数字', name: '数字', icon: '🔢', wordCount: 16, difficulty: 1, progress: 0 },
        { id: '动物', name: '动物', icon: '🦁', wordCount: 15, difficulty: 1, progress: 0 },
        { id: '食物', name: '食物', icon: '🍎', wordCount: 9, difficulty: 1, progress: 0 },
        { id: '身体', name: '身体部位', icon: '👤', wordCount: 7, difficulty: 1, progress: 0 },
        { id: '动作', name: '动作', icon: '🏃', wordCount: 37, difficulty: 1, progress: 0 },
        { id: '称呼', name: '称呼', icon: '👨‍👩‍👧', wordCount: 3, difficulty: 1, progress: 0 },
        { id: '礼貌打招呼', name: '礼貌打招呼', icon: '👋', wordCount: 29, difficulty: 1, progress: 0 },
        { id: '教室物品', name: '教室物品', icon: '📚', wordCount: 14, difficulty: 1, progress: 0 },
        { id: '课堂指令', name: '课堂指令', icon: '📚', wordCount: 37, difficulty: 1, progress: 0 },
        { id: '节日短语', name: '节日短语', icon: '🎉', wordCount: 4, difficulty: 1, progress: 0 },
        { id: '评价与鼓励', name: '评价与鼓励', icon: '⭐', wordCount: 6, difficulty: 1, progress: 0 },
        { id: '天气自然', name: '天气自然', icon: '🌤️', wordCount: 5, difficulty: 1, progress: 0 }
      ],
      primary: [],
      junior: []
    }

    return categoryMaps[stage] || []
  },

  // 加载统计数据
  loadStats() {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) return

    const categories = this.data.categories
    let totalWords = 0
    let learnedWords = 0
    let masteredWords = 0

    categories.forEach(category => {
      totalWords += category.wordCount
      // 计算该分类的进度（简化版）
      const progress = Math.floor(Math.random() * 100)
      category.progress = progress
      learnedWords += Math.floor(category.wordCount * progress / 100 * 0.6)
      masteredWords += Math.floor(category.wordCount * progress / 100 * 0.4)
    })

    this.setData({
      categories,
      totalWords,
      learnedWords,
      masteredWords
    })
  },

  // 更新页面样式
  updatePageStyle() {
    const navigationBarColors = {
      kindergarten: '#FF9F43',
      primary: '#54A0FF',
      junior: '#5F27CD'
    }

    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: navigationBarColors[this.data.stage] || '#FF9F43'
    })
  },

  // 返回
  goBack() {
    wx.navigateBack()
  },

  // 设置筛选
  setFilter(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({ filterType: filter })
  },

  // 选择分类
  selectCategory(e) {
    const category = e.currentTarget.dataset.category

    // 震动反馈
    wx.vibrateShort({
      type: 'light'
    })

    // 跳转到学习页面
    wx.navigateTo({
      url: `/pages/mode1/mode1?stage=${this.data.stage}&category=${category.id}&categoryName=${category.name}`
    })
  }
})
