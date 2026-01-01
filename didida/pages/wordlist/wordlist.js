// pages/wordlist/wordlist.js
const app = getApp()

Page({
  data: {
    activeTab: 'all',
    wordList: [],
    statusText: {
      unlearned: '未学习',
      learned: '学习中',
      mastered: '已掌握'
    }
  },

  onLoad(options) {
    this.loadWordList()
  },

  // 加载单词列表
  loadWordList() {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) return

    // 示例单词数据
    const sampleWords = [
      { id: 1, word: 'Hello', phonetic: '/həˈloʊ/', meaning: '你好', status: 'mastered' },
      { id: 2, word: 'Good morning', phonetic: '/ɡʊd ˈmɔːrnɪŋ/', meaning: '早上好', status: 'learned' },
      { id: 3, word: 'Red', phonetic: '/red/', meaning: '红色', status: 'mastered' },
      { id: 4, word: 'Blue', phonetic: '/bluː/', meaning: '蓝色', status: 'learned' },
      { id: 5, word: 'Classroom', phonetic: '/ˈklæsruːm/', meaning: '教室', status: 'unlearned' },
      { id: 6, word: 'Teacher', phonetic: '/ˈtiːtʃər/', meaning: '老师', status: 'unlearned' }
    ]

    this.setData({ wordList: sampleWords })
  },

  // 搜索单词
  searchWord(e) {
    const keyword = e.detail.value.toLowerCase()
    if (!keyword) {
      this.loadWordList()
      return
    }

    const filteredWords = this.data.wordList.filter(word =>
      word.word.toLowerCase().includes(keyword) ||
      word.meaning.includes(keyword)
    )

    this.setData({ wordList: filteredWords })
  },

  // 切换标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
    this.loadWordList()
  },

  // 查看单词详情
  viewWordDetail(e) {
    const word = e.currentTarget.dataset.word
    wx.showToast({
      title: `查看单词: ${word.word}`,
      icon: 'none'
    })
  }
})
