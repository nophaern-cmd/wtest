// pages/mode1/mode1.js
const app = getApp()

Page({
  data: {
    stage: 'kindergarten',
    category: '',
    categoryName: '',
    wordIndex: 0,
    words: [],
    word: {
      word: '',
      phonetic: '',
      pos: '',
      meaning: '',
      exampleEn: '',
      exampleCn: '',
      sentenceEn: '',
      sentenceCn: '',
      image: ''
    }
  },

  onLoad(options) {
    if (options.stage) this.setData({ stage: options.stage })
    if (options.category) this.setData({ category: options.category })
    if (options.categoryName) this.setData({ categoryName: options.categoryName })

    this.loadWords()
    
    // 自动开始学习
    if (this.data.words.length > 0) {
      this.initCurrentWord()
      this.updatePageStyle()
      
      // 自动播放音频（仅第一步）
      setTimeout(() => {
        this.playAudio()
      }, 500)
    }
  },

  // 加载单词
  loadWords() {
    const words = this.getRealWords()
    this.setData({ words })
  },

  // 获取真实单词数据
  getRealWords() {
    const wordsData = require('../../data/words.js')
    let allWords = []
    
    // 根据阶段获取单词
    if (this.data.stage === 'kindergarten') {
      allWords = wordsData.kindergartenWords
    } else if (this.data.stage === 'primary') {
      allWords = wordsData.primaryWords
    } else if (this.data.stage === 'middle') {
      allWords = wordsData.juniorWords
    }
    
    // 根据分类筛选
    if (this.data.category) {
      allWords = allWords.filter(w => w.category === this.data.category)
    }
    
    // 如果没有找到单词，使用默认分类
    if (allWords.length === 0) {
      allWords = wordsData.kindergartenWords.filter(w => w.category === '颜色')
    }

    // 返回该分类所有单词（不再限制数量）
    return allWords
  },

  // 获取示例单词
  getSampleWords() {
    const wordMaps = {
      greeting: [
        { word: 'Hello', phonetic: '/həˈloʊ/', pos: 'int.', meaning: '你好', exampleEn: 'Hello, nice to meet you.', exampleCn: '你好，很高兴见到你。', sentenceEn: 'Hello, how are you today?', sentenceCn: '你好，你今天怎么样？' },
        { word: 'Good morning', phonetic: '/ɡʊd ˈmɔːrnɪŋ/', pos: 'int.', meaning: '早上好', exampleEn: 'Good morning, teacher.', exampleCn: '老师早上好。', sentenceEn: 'Good morning! Let\'s start our day.', sentenceCn: '早上好！让我们开始新的一天。' }
      ],
      colors: [
        { word: 'Red', phonetic: '/red/', pos: 'n./adj.', meaning: '红色', exampleEn: 'The apple is red.', exampleCn: '苹果是红色的。', sentenceEn: 'I see a red flower.', sentenceCn: '我看到一朵红色的花。' },
        { word: 'Blue', phonetic: '/bluː/', pos: 'n./adj.', meaning: '蓝色', exampleEn: 'The sky is blue.', exampleCn: '天空是蓝色的。', sentenceEn: 'I like the blue car.', sentenceCn: '我喜欢那辆蓝色的车。' }
      ],
      school: [
        { word: 'Classroom', phonetic: '/ˈklæsruːm/', pos: 'n.', meaning: '教室', exampleEn: 'This is our classroom.', exampleCn: '这是我们的教室。', sentenceEn: 'We study in the classroom every day.', sentenceCn: '我们每天都在教室里学习。' },
        { word: 'Teacher', phonetic: '/ˈtiːtʃər/', pos: 'n.', meaning: '老师', exampleEn: 'She is a good teacher.', exampleCn: '她是一位好老师。', sentenceEn: 'The teacher is very kind.', sentenceCn: '老师非常和蔼。' }
      ]
    }

    return wordMaps[this.data.category] || wordMaps.colors
  },

  // 初始化当前单词
  initCurrentWord() {
    const words = this.data.words
    const wordIndex = this.data.wordIndex

    if (words.length === 0) {
      wx.showToast({ title: '暂无单词', icon: 'none' })
      return
    }

    const word = words[wordIndex]

    // 生成3个例句
    const sentences = this.generateSentences(word)

    // 转换单词格式以适配现有UI
    const formattedWord = {
      word: word.word,
      phonetic: word.phonetic || '',
      pos: 'n.',
      meaning: word.meaning,
      sentences: sentences,
      image: this.getImageUrl(word.image)
    }

    this.setData({ word: formattedWord })
  },

  // 生成例句
  generateSentences(word) {
    const sentences = []

    // 生成额外的例句（基于单词的语义）
    const wordLower = word.word.toLowerCase().trim()
    const meaning = word.meaning
    const category = word.category || ''

    // 根据不同类型生成例句
    if (meaning.includes('字母') || category.includes('字母')) {
      // 字母类单词 - 使用原始句子
      if (word.sentence && word.sentenceTranslation) {
        sentences.push({
          en: word.sentence,
          cn: word.sentenceTranslation
        })
      }
      sentences.push({
        en: `Can you write the letter ${word.word}?`,
        cn: '你会写字母' + word.word + '吗？'
      })
      if (sentences.length < 3) {
        sentences.push({
          en: `Point to the letter ${word.word}.`,
          cn: '指向字母' + word.word + '。'
        })
      }
    } else if (meaning.includes('颜色') || category.includes('颜色') || ['red', 'blue', 'green', 'yellow', 'pink', 'purple', 'orange'].includes(wordLower)) {
      // 颜色类单词
      if (word.sentence && word.sentenceTranslation) {
        sentences.push({
          en: word.sentence,
          cn: word.sentenceTranslation
        })
      }
      const colorExamples = [
        {
          en: `My favorite color is ${word.word}.`,
          cn: '我最喜欢的颜色是' + word.meaning + '。'
        },
        {
          en: `The ${word.word} flower is beautiful.`,
          cn: '这朵' + word.meaning + '的花很美。'
        },
        {
          en: `Look at that ${word.word} bird.`,
          cn: '看那只' + word.meaning + '的鸟。'
        }
      ]
      sentences.push(...colorExamples.slice(0, 3 - sentences.length))
    } else if (meaning.includes('数字') || category.includes('数字') || !isNaN(wordLower) || ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'].includes(wordLower)) {
      // 数字类单词
      if (word.sentence && word.sentenceTranslation) {
        sentences.push({
          en: word.sentence,
          cn: word.sentenceTranslation
        })
      }
      const numberExamples = [
        {
          en: `I have ${word.word} apples.`,
          cn: '我有' + word.meaning + '个苹果。'
        },
        {
          en: `Count to ${word.word} with me.`,
          cn: '跟我数到' + word.meaning + '。'
        },
        {
          en: `${word.word} plus one is ${parseInt(wordLower) + 1 || 'one more'}.`,
          cn: word.meaning + '加一等于更多。'
        }
      ]
      sentences.push(...numberExamples.slice(0, 3 - sentences.length))
    } else if (meaning.includes('动物') || category.includes('动物') || ['cat', 'dog', 'bird', 'bear', 'fish', 'elephant', 'lion', 'monkey', 'panda', 'tiger', 'rabbit', 'ant', 'duck', 'mouse', 'pig'].includes(wordLower)) {
      // 动物类单词
      if (word.sentence && word.sentenceTranslation) {
        sentences.push({
          en: word.sentence,
          cn: word.sentenceTranslation
        })
      }
      const animalExamples = [
        {
          en: `I like the ${word.word}.`,
          cn: '我喜欢这只' + word.meaning + '。'
        },
        {
          en: `Look at the ${word.word} over there.`,
          cn: '看那边的' + word.meaning + '。'
        },
        {
          en: `The ${word.word} is running fast.`,
          cn: '这只' + word.meaning + '跑得很快。'
        }
      ]
      sentences.push(...animalExamples.slice(0, 3 - sentences.length))
    } else {
      // 其他单词的通用例句
      if (word.sentence && word.sentenceTranslation) {
        sentences.push({
          en: word.sentence,
          cn: word.sentenceTranslation
        })
      }
      const commonExamples = [
        {
          en: `This is a ${word.word}.`,
          cn: '这是一个' + word.meaning + '。'
        },
        {
          en: `I have a ${word.word}.`,
          cn: '我有一个' + word.meaning + '。'
        },
        {
          en: `Do you like ${word.word}?`,
          cn: '你喜欢' + word.meaning + '吗？'
        }
      ]
      sentences.push(...commonExamples.slice(0, 3 - sentences.length))
    }

    return sentences.slice(0, 3)
  },

  // 获取图片URL
  getImageUrl(emoji) {
    // 引入图片配置
    const { getImageUrl: configGetImageUrl } = require('../../images/image-config.js')
    // 使用本地图片
    return configGetImageUrl(emoji, true)
  },

  // 打乱数组
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]
    }
    return array
  },

  // 更新页面样式
  updatePageStyle() {
    const navigationBarColors = {
      kindergarten: '#FF9F43',
      primary: '#54A0FF',
      middle: '#5F27CD'
    }

    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: navigationBarColors[this.data.stage] || '#FF9F43'
    })
  },

  // 播放音频
  playAudio() {
    const word = this.data.word.word

    // 使用在线 TTS 服务（百度翻译TTS，更稳定）
    const ttsUrl = `https://fanyi.baidu.com/gettts?lan=en&text=${encodeURIComponent(word)}&spd=3&source=web`

    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.src = ttsUrl

    innerAudioContext.onPlay(() => {
      console.log('音频开始播放')
    })

    innerAudioContext.onEnded(() => {
      console.log('音频播放结束')
      innerAudioContext.destroy()
    })

    innerAudioContext.onError((err) => {
      console.log('音频播放失败', err)
      innerAudioContext.destroy()
      this.fallbackTTS(word)
    })

    innerAudioContext.play()
  },

  // 备用TTS方案
  fallbackTTS(text) {
    // 显示文字提示
    wx.showToast({
      title: `🗣️ ${text}`,
      icon: 'none',
      duration: 1500
    })
  },

  // 播放句子音频
  playSentenceAudio(e) {
    const index = e.currentTarget.dataset.index
    const sentences = this.data.word.sentences
    if (sentences && sentences[index]) {
      const sentence = sentences[index].en

      // 使用在线 TTS 服务
      const ttsUrl = `https://fanyi.baidu.com/gettts?lan=en&text=${encodeURIComponent(sentence)}&spd=3&source=web`

      const innerAudioContext = wx.createInnerAudioContext()
      innerAudioContext.src = ttsUrl

      innerAudioContext.onPlay(() => {
        console.log('句子音频开始播放')
      })

      innerAudioContext.onEnded(() => {
        console.log('句子音频播放结束')
        innerAudioContext.destroy()
      })

      innerAudioContext.onError((err) => {
        console.log('句子音频播放失败', err)
        innerAudioContext.destroy()
        this.fallbackTTS(sentence)
      })

      innerAudioContext.play()
    }
  },

  // 上一个单词
  prevWord() {
    if (this.data.wordIndex > 0) {
      const newIndex = this.data.wordIndex - 1
      this.setData({
        wordIndex: newIndex
      })
      this.initCurrentWord()

      // 自动播放音频
      setTimeout(() => {
        this.playAudio()
      }, 300)
    }
  },

  // 下一个单词
  nextWord() {
    if (this.data.wordIndex < this.data.words.length - 1) {
      // 还有下一个单词
      const newIndex = this.data.wordIndex + 1
      this.setData({
        wordIndex: newIndex
      })
      this.initCurrentWord()

      // 自动播放音频
      setTimeout(() => {
        this.playAudio()
      }, 300)
    } else {
      // 所有单词学习完成
      this.completeWord()
    }
  },

  // 完成单词学习
  completeWord() {
    // 更新学习进度
    app.updateStudyProgress(this.data.word.word, 'mastered')

    // 显示完成动画
    wx.showToast({
      title: '学习完成！',
      icon: 'success',
      duration: 2000
    })

    // 延迟后返回
    setTimeout(() => {
      wx.showModal({
        title: '恭喜',
        content: '该分类所有单词学习完成！',
        confirmText: '返回',
        cancelText: '再次学习',
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack()
          } else {
            // 重置到第一个单词
            this.setData({
              wordIndex: 0
            })
            this.initCurrentWord()
          }
        }
      })
    }, 2000)
  }
})
