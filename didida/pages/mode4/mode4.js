// 联想记忆模式
const associationData = require('../../data/associations.js')

Page({
  data: {
    currentLevel: 'kindergarten',
    currentType: null,
    currentAssociation: null,
    currentAssociations: [],
    associationTypes: {},
    currentIndex: 0,
    isCollected: false
  },

  onLoad(options) {
    const level = options.level || 'kindergarten'
    const types = associationData.getAvailableTypes(level)

    this.setData({
      currentLevel: level,
      associationTypes: types
    })
  },

  // 选择阶段
  selectLevel(e) {
    const level = e.currentTarget.dataset.level
    const types = associationData.getAvailableTypes(level)

    this.setData({
      currentLevel: level,
      currentType: null,
      currentAssociation: null,
      currentAssociations: [],
      associationTypes: types
    })
  },

  // 选择联想类型
  selectType(e) {
    const type = e.currentTarget.dataset.type
    const associations = associationData.getAssociationsByType(this.data.currentLevel, type)

    this.setData({
      currentType: type,
      currentAssociations: associations
    })
  },

  // 返回类型选择
  backToTypes() {
    this.setData({
      currentType: null,
      currentAssociations: []
    })
  },

  // 查看详情
  viewDetail(e) {
    const item = e.currentTarget.dataset.item
    const index = this.data.currentAssociations.findIndex(a => a.id === item.id)

    this.setData({
      currentAssociation: item,
      currentIndex: index,
      isCollected: this.checkCollected(item.id)
    })
  },

  // 返回列表
  backToList() {
    this.setData({
      currentAssociation: null,
      isCollected: false
    })
  },

  // 下一个
  nextAssociation() {
    const { currentIndex, currentAssociations } = this.data
    const nextIndex = (currentIndex + 1) % currentAssociations.length

    const nextAssociation = currentAssociations[nextIndex]
    this.setData({
      currentAssociation: nextAssociation,
      currentIndex: nextIndex,
      isCollected: this.checkCollected(nextAssociation.id)
    })
  },

  // 播放音频
  playAudio() {
    const { currentAssociation } = this.data
    if (!currentAssociation) return

    wx.showToast({
      title: '正在发音...',
      icon: 'none',
      duration: 1000
    })

    if (wx.createInnerAudioContext) {
      const audio = wx.createInnerAudioContext()
      audio.src = `https://dict.youdao.com/dictvoice?audio=${currentAssociation.word}&type=1`
      audio.play()
    }
  },

  // 切换收藏
  toggleCollect() {
    const { currentAssociation, isCollected } = this.data
    if (!currentAssociation) return

    const userInfo = wx.getStorageSync('userInfo') || {}
    if (!userInfo.collectedAssociations) {
      userInfo.collectedAssociations = []
    }

    if (isCollected) {
      // 取消收藏
      userInfo.collectedAssociations = userInfo.collectedAssociations.filter(id => id !== currentAssociation.id)
    } else {
      // 添加收藏
      userInfo.collectedAssociations.push(currentAssociation.id)
    }

    wx.setStorageSync('userInfo', userInfo)
    this.setData({
      isCollected: !isCollected
    })

    wx.showToast({
      title: isCollected ? '已取消收藏' : '已收藏',
      icon: 'success'
    })
  },

  // 检查是否收藏
  checkCollected(associationId) {
    const userInfo = wx.getStorageSync('userInfo') || {}
    return userInfo.collectedAssociations &&
      userInfo.collectedAssociations.includes(associationId)
  },

  // 查看相关单词
  viewRelatedWord(e) {
    const word = e.currentTarget.dataset.word
    wx.showToast({
      title: `单词: ${word}`,
      icon: 'none'
    })
    // 可以跳转到单词详情页
  },

  // 获取联想类型颜色
  getAssociationTypeColor(type) {
    const allTypes = associationData.getAssociationTypes()
    const typeInfo = allTypes[type]
    return typeInfo ? typeInfo.color : '#4A90E2'
  },

  // 获取联想类型图标
  getAssociationTypeIcon(type) {
    const allTypes = associationData.getAssociationTypes()
    const typeInfo = allTypes[type]
    return typeInfo ? typeInfo.icon : '💡'
  },

  // 获取类型下单词数量
  getAssociationCount(type) {
    const associations = associationData.getAssociationsByType(this.data.currentLevel, type)
    return associations.length
  }
})
