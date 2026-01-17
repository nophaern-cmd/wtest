// pages/stories/stories.js
const app = getApp()
const storage = require('../../utils/storage')
const category = require('../../utils/category')

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
    const stories = category.enrichStories(app.globalData.stories, this.data.readStories)
    this.setData({ stories })
  },

  loadReadStatus() {
    const readStories = storage.get(storage.STORAGE_KEYS.READ_STORIES, [])
    this.setData({ readStories })
  },

  showStoryDetail(e) {
    const story = e.currentTarget.dataset.story
    const contentInfo = category.getStoryContent(story.name)

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
    this.setData({ showDetail: false })
  },

  markAsRead() {
    const currentStory = this.data.currentStory
    const readStories = storage.toggleStoryRead(currentStory.name)
    const read = !currentStory.read

    this.setData({
      readStories,
      currentStory: {
        ...currentStory,
        read
      }
    })

    wx.showToast({
      title: read ? '已标记为已读' : '已取消标记',
      icon: 'success'
    })
  }
})
