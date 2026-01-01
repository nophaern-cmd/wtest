const associationsData = require('../../data/associations.js')
const wordsData = require('../../data/words.js')

Page({
  data: {
    level: 'kindergarten',
    levelText: '幼儿园',
    associationTypes: [],
    selectedType: '',
    selectedTypeName: '',
    filteredAssociations: [],
    currentAssociation: null,
    currentIndex: 0,
    typeNames: {
      'shape': '形状联想',
      'sound': '读音联想',
      'action': '动作联想',
      'color': '颜色联想',
      'number': '数字联想',
      'animal': '动物联想',
      'body': '身体联想',
      'scene': '场景联想',
      'root': '词根联想',
      'story': '故事联想',
      'phonetic': '语音联想',
      'visual': '视觉联想',
      'composition': '合成词联想'
    },
    typeIcons: {
      'shape': '🔷',
      'sound': '🎵',
      'action': '🏃',
      'color': '🎨',
      'number': '🔢',
      'animal': '🐱',
      'body': '👁️',
      'scene': '🏫',
      'root': '🌳',
      'story': '📖',
      'phonetic': '🔊',
      'visual': '👀',
      'composition': '🧩'
    }
  },

  onLoad(options) {
    const level = options.level || 'kindergarten'
    const levelText = wordsData.levels[level]
    const associations = associationsData.getAssociationsByLevel(level)

    // 统计各类型数量
    const typeCount = {}
    associations.forEach(item => {
      if (!typeCount[item.type]) {
        typeCount[item.type] = 0
      }
      typeCount[item.type]++
    })

    // 生成联想类型列表
    const associationTypes = Object.keys(typeCount).map(type => ({
      type,
      name: this.data.typeNames[type] || type,
      icon: this.data.typeIcons[type] || '💡',
      count: typeCount[type]
    }))

    this.setData({
      level,
      levelText,
      associationTypes,
      associations
    })
  },

  // 选择联想类型
  selectType(e) {
    const type = e.currentTarget.dataset.type
    const { associations } = this.data

    const filtered = associations.filter(item => item.type === type)
    const typeInfo = this.data.associationTypes.find(t => t.type === type)

    this.setData({
      selectedType: type,
      selectedTypeName: typeInfo ? typeInfo.name : type,
      filteredAssociations: filtered
    })
  },

  // 查看联想详情
  viewAssociation(e) {
    const item = e.currentTarget.dataset.item
    const { filteredAssociations } = this.data
    const index = filteredAssociations.findIndex(a => a.id === item.id)

    this.setData({
      currentAssociation: item,
      currentIndex: index
    })
  },

  // 返回列表
  backToList() {
    this.setData({
      currentAssociation: null
    })
  },

  // 获取类型名称
  getTypeName(type) {
    return this.data.typeNames[type] || type
  },

  // 播放音频
  playAudio(e) {
    const word = e.currentTarget.dataset.word
    const audio = wx.createInnerAudioContext()
    audio.src = `https://dict.youdao.com/dictvoice?audio=${word}&type=1`
    audio.play()

    wx.showToast({
      title: '正在发音...',
      icon: 'none',
      duration: 500
    })
  },

  // 查看相关单词
  viewRelatedWord(e) {
    const word = e.currentTarget.dataset.word
    const wordData = wordsData.getWordById(word)

    if (wordData) {
      wx.showModal({
        title: wordData.word,
        content: `${wordData.phonetic}\n${wordData.meaning}`,
        showCancel: false
      })
    } else {
      wx.showToast({
        title: '该单词暂无详细信息',
        icon: 'none'
      })
    }
  },

  // 上一个单词
  prevWord() {
    const { currentIndex, filteredAssociations } = this.data
    if (currentIndex > 0) {
      this.setData({
        currentIndex: currentIndex - 1,
        currentAssociation: filteredAssociations[currentIndex - 1]
      })
    }
  },

  // 下一个单词
  nextWord() {
    const { currentIndex, filteredAssociations } = this.data
    if (currentIndex < filteredAssociations.length - 1) {
      this.setData({
        currentIndex: currentIndex + 1,
        currentAssociation: filteredAssociations[currentIndex + 1]
      })
    }
  },

  // 标记已掌握
  markKnown() {
    const { currentAssociation } = this.data
    const userInfo = wx.getStorageSync('userInfo') || {}

    // 保存学习记录
    if (!userInfo.studiedWords) {
      userInfo.studiedWords = []
    }

    // 查找单词ID
    const wordData = wordsData.getWordsByLevel(this.data.level).find(w => w.word === currentAssociation.word)
    if (wordData) {
      const existingIndex = userInfo.studiedWords.findIndex(w => w.id === wordData.id)
      if (existingIndex >= 0) {
        userInfo.studiedWords[existingIndex].count++
      } else {
        userInfo.studiedWords.push({
          id: wordData.id,
          word: wordData.word,
          count: 1,
          known: true,
          lastStudyDate: new Date().getTime()
        })
      }

      wx.setStorageSync('userInfo', userInfo)
    }

    wx.showToast({
      title: '已标记掌握!',
      icon: 'success'
    })

    // 自动下一个
    if (this.data.currentIndex < this.data.filteredAssociations.length - 1) {
      setTimeout(() => {
        this.nextWord()
      }, 1000)
    }
  }
})
