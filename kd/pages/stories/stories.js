// pages/stories/stories.js
const app = getApp()

Page({
  data: {
    stories: [],
    showDetail: false,
    currentStory: {},
    readStories: []
  },

  onLoad() {
    this.loadStories()
    this.loadReadStatus()
  },

  loadStories() {
    const stories = app.globalData.stories.map(story => {
      let type = '绘本'
      if (story.name.includes('story') || story.name.includes('Peppa')) {
        type = '故事'
      }
      return {
        ...story,
        type,
        emoji: this.getStoryEmoji(story.name)
      }
    })

    this.setData({
      stories
    })
  },

  getStoryEmoji(name) {
    const emojiMap = {
      'The big monster': '👹',
      'Lets play': '🎮',
      'Peppas Christmas': '🎄',
      'Scary, not scary': '👻',
      'Two': '2️⃣',
      'Christmas Eve': '🎅'
    }
    return emojiMap[name] || '📖'
  },

  loadReadStatus() {
    const readStories = wx.getStorageSync('readStories') || []
    this.setData({
      readStories
    })
  },

  showStoryDetail(e) {
    const story = e.currentTarget.dataset.story

    const storyContent = {
      'The big monster': {
        content: '一个关于大怪物的有趣故事，通过描述怪物的身体部位来学习身体和颜色相关的词汇。故事鼓励孩子们观察和描述。',
        points: ['学习身体部位词汇', '练习颜色描述', '提高观察能力']
      },
      'Lets play': {
        content: '一个互动性强的故事，讲述了孩子们一起玩耍的场景。通过故事学习日常动作和表达。',
        points: ['学习日常动作词汇', '练习表达请求', '培养社交能力']
      },
      'Peppas Christmas': {
        content: '佩佩一家的圣诞节故事，充满了节日的欢乐氛围。通过故事了解圣诞节的传统和习俗。',
        points: ['了解圣诞节文化', '学习节日词汇', '感受节日氛围']
      },
      'Scary, not scary': {
        content: 'RAZ分级绘本，讲述有些东西看起来很可怕，但实际上并不可怕。帮助孩子克服恐惧。',
        points: ['情绪管理', '勇敢面对未知', '反义词学习']
      },
      'Two': {
        content: 'RAZ分级绘本，关于数字二的概念。通过有趣的画面学习数字和数量。',
        points: ['数字认知', '数量理解', '基础数学']
      },
      'Christmas Eve': {
        content: 'RAZ分级绘本，讲述了平安夜的温馨故事。充满节日的期待和喜悦。',
        points: ['节日传统', '情感表达', '家庭观念']
      }
    }

    const contentInfo = storyContent[story.name] || { content: '', points: [] }

    this.setData({
      currentStory: {
        ...story,
        ...contentInfo,
        read: this.data.readStories.includes(story.name)
      },
      showDetail: true
    })
  },

  hideStoryDetail() {
    this.setData({
      showDetail: false
    })
  },

  markAsRead() {
    const currentStory = this.data.currentStory
    let readStories = this.data.readStories

    if (currentStory.read) {
      readStories = readStories.filter(s => s !== currentStory.name)
    } else {
      readStories.push(currentStory.name)
    }

    wx.setStorageSync('readStories', readStories)

    this.setData({
      readStories,
      currentStory: {
        ...currentStory,
        read: !currentStory.read
      }
    })

    wx.showToast({
      title: currentStory.read ? '已取消标记' : '已标记为已读',
      icon: 'success'
    })
  }
})
