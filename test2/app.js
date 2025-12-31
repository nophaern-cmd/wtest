App({
  onLaunch() {
    console.log('趣味学习小程序启动');
    this.loadUserData();
    this.loadQuestionBank();
  },

  loadUserData() {
    try {
      const userData = wx.getStorageSync('userData') || {
        totalGames: 0,
        totalScore: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        subjectProgress: {},
        gameProgress: {},
        lastPlayTime: null,
        streakDays: 0
      };
      this.globalData.userData = userData;
    } catch (e) {
      console.error('加载用户数据失败', e);
    }
  },

  loadQuestionBank() {
    this.globalData.questionBank = {
      chinese: this.getChineseQuestions(),
      math: this.getMathQuestions(),
      english: this.getEnglishQuestions(),
      history: this.getHistoryQuestions()
    };
  },

  getChineseQuestions() {
    return {
      primary: [
        { type: 'hanzi', question: '汉字', answer: '爱', options: ['爱', '恨', '喜', '怒'], hint: '关爱他人' },
        { type: 'hanzi', question: '汉字', answer: '春', options: ['春', '夏', '秋', '冬'], hint: '一年之计在于春' },
        { type: 'poem', question: '《静夜思》作者', answer: '李白', options: ['李白', '杜甫', '白居易', '王维'], hint: '唐代浪漫主义诗人' },
        { type: 'poem', question: '"床前明月光"下一句', answer: '疑是地上霜', options: ['疑是地上霜', '举头望明月', '低头思故乡', '明月几时有'], hint: '最著名的唐诗之一' },
        { type: 'idiom', question: '守株待兔', answer: '寓言故事', options: ['寓言故事', '历史典故', '神话传说', '民间传说'], hint: '农夫和兔子的故事' }
      ],
      middle: [
        { type: 'poem', question: '"会当凌绝顶"下一句', answer: '一览众山小', options: ['一览众山小', '荡胸生曾云', '造化钟神秀', '决眦入归鸟'], hint: '杜甫《望岳》' },
        { type: 'poem', question: '《登鹳雀楼》作者', answer: '王之涣', options: ['王之涣', '王勃', '王维', '王昌龄'], hint: '唐代诗人' },
        { type: 'idiom', question: '画蛇添足', answer: '做多余的事', options: ['做多余的事', '做事细致', '追求完美', '反复确认'], hint: '反而把事情搞糟' },
        { type: 'hanzi', question: '"悠"的拼音', answer: 'yōu', options: ['yōu', 'yòu', 'yiu', 'yōu'], hint: '悠闲自在' }
      ]
    };
  },

  getMathQuestions() {
    return {
      primary: [
        { type: 'calc', question: '25 + 37 = ?', answer: '62', options: ['62', '52', '72', '42'], hint: '25加30是55再加7' },
        { type: 'calc', question: '12 × 8 = ?', answer: '96', options: ['96', '86', '106', '76'], hint: '10乘8是80，2乘8是16' },
        { type: 'calc', question: '100 - 34 = ?', answer: '66', options: ['66', '76', '56', '46'], hint: '百位借一' },
        { type: 'concept', question: '三角形的内角和', answer: '180度', options: ['180度', '90度', '360度', '270度'], hint: '任意三角形' },
        { type: 'concept', question: '1平方米 = ?平方厘米', answer: '10000', options: ['10000', '1000', '100', '100000'], hint: '1米=100厘米' }
      ],
      middle: [
        { type: 'calc', question: '3/4 + 1/6 = ?', answer: '11/12', options: ['11/12', '2/5', '4/10', '1/2'], hint: '通分计算' },
        { type: 'calc', question: '(x + 3)(x - 2)展开', answer: 'x² + x - 6', options: ['x² + x - 6', 'x² + 5x - 6', 'x² - x - 6', 'x² - 5x + 6'], hint: '使用分配律' },
        { type: 'concept', question: '圆周率π≈?', answer: '3.14', options: ['3.14', '3.41', '3.04', '3.24'], hint: '常用近似值' },
        { type: 'concept', question: '一元二次方程ax²+bx+c=0的判别式', answer: 'b²-4ac', options: ['b²-4ac', '4ac-b²', 'b²+4ac', '-b²+4ac'], hint: 'Δ=' }
      ]
    };
  },

  getEnglishQuestions() {
    return {
      primary: [
        { type: 'word', question: 'apple的中文意思', answer: '苹果', options: ['苹果', '香蕉', '橙子', '葡萄'], hint: '一种红色的水果' },
        { type: 'word', question: 'hello的同义词', answer: 'hi', options: ['hi', 'bye', 'good', 'bad'], hint: '打招呼' },
        { type: 'word', question: 'cat的中文意思', answer: '猫', options: ['猫', '狗', '鸟', '鱼'], hint: '一种宠物' },
        { type: 'grammar', question: 'I ___ a student.', answer: 'am', options: ['am', 'is', 'are', 'be'], hint: '第一人称单数' },
        { type: 'grammar', question: 'She ___ English.', answer: 'speaks', options: ['speaks', 'speak', 'speaking', 'spoke'], hint: '第三人称单数' }
      ],
      middle: [
        { type: 'word', question: 'beautiful的同义词', answer: 'pretty', options: ['pretty', 'ugly', 'bad', 'dirty'], hint: '形容美好' },
        { type: 'grammar', question: 'If I ___ you, I would go.', answer: 'were', options: ['were', 'am', 'was', 'be'], hint: '虚拟语气' },
        { type: 'word', question: 'unhappy的反义词', answer: 'happy', options: ['happy', 'sad', 'angry', 'upset'], hint: '去掉前缀' },
        { type: 'grammar', question: 'The book ___ by me.', answer: 'was written', options: ['was written', 'is written', 'wrote', 'writing'], hint: '被动语态' }
      ]
    };
  },

  getHistoryQuestions() {
    return {
      primary: [
        { type: 'fact', question: '中国古代四大发明不包括', answer: '地动仪', options: ['地动仪', '造纸术', '指南针', '火药'], hint: '张衡发明' },
        { type: 'fact', question: '长城的主要功能', answer: '防御', options: ['防御', '运输', '居住', '祭祀'], hint: '军事工程' },
        { type: 'fact', question: '秦始皇统一六国后建立的朝代', answer: '秦朝', options: ['秦朝', '汉朝', '唐朝', '宋朝'], hint: '第一个封建王朝' }
      ],
      middle: [
        { type: 'fact', question: '丝绸之路的起点', answer: '长安', options: ['长安', '洛阳', '敦煌', '西安'], hint: '古都' },
        { type: 'fact', question: '三国时期蜀国的建立者', answer: '刘备', options: ['刘备', '曹操', '孙权', '诸葛亮'], hint: '汉室宗亲' },
        { type: 'fact', question: '唐朝的开国皇帝', answer: '李渊', options: ['李渊', '李世民', '武则天', '李隆基'], hint: '唐高祖' },
        { type: 'fact', question: '清朝最后一个皇帝', answer: '溥仪', options: ['溥仪', '光绪', '同治', '咸丰'], hint: '宣统帝' }
      ]
    };
  },

  saveUserData() {
    try {
      wx.setStorageSync('userData', this.globalData.userData);
    } catch (e) {
      console.error('保存用户数据失败', e);
    }
  },

  getQuestions(subject, level) {
    const questions = this.globalData.questionBank[subject][level] || [];
    return questions;
  },

  globalData: {
    userData: null,
    questionBank: null
  }
})
