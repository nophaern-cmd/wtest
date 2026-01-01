// 词根词缀数据
module.exports = {
  // 常见前缀
  prefixes: [
    {
      prefix: 'bi-',
      meaning: '两个，双',
      examples: [
        { word: 'bicycle', meaning: '自行车', explanation: '两个轮子' },
        { word: 'bilingual', meaning: '双语的', explanation: '两种语言' },
        { word: 'binary', meaning: '二进制的', explanation: '二的' }
      ]
    },
    {
      prefix: 'pre-',
      meaning: '在...之前',
      examples: [
        { word: 'prestudy', meaning: '预习', explanation: '在学习之前' },
        { word: 'prehistory', meaning: '史前', explanation: '历史之前' }
      ]
    },
    {
      prefix: 'un-',
      meaning: '不，非',
      examples: [
        { word: 'unhappy', meaning: '不快乐', explanation: '不快乐' },
        { word: 'unlike', meaning: '不像', explanation: '不像' }
      ]
    }
  ],

  // 常见后缀
  suffixes: [
    {
      suffix: '-er',
      meaning: '人，职业',
      examples: [
        { word: 'teacher', meaning: '老师', explanation: '教书的人' },
        { word: 'worker', meaning: '工人', explanation: '工作的人' },
        { word: 'scientist', meaning: '科学家', explanation: '做科学研究的人' }
      ]
    },
    {
      suffix: '-y',
      meaning: '形容词后缀',
      examples: [
        { word: 'rainy', meaning: '下雨的', explanation: '多雨的' },
        { word: 'sunny', meaning: '晴朗的', explanation: '多阳光的' },
        { word: 'excited', meaning: '兴奋的', explanation: '感到兴奋' }
      ]
    },
    {
      suffix: '-tion',
      meaning: '名词后缀',
      examples: [
        { word: 'information', meaning: '信息', explanation: '告知的事情' },
        { word: 'station', meaning: '车站', explanation: '站的地方' }
      ]
    }
  ],

  // 词根
  roots: [
    {
      root: 'geo',
      meaning: '地球',
      examples: [
        { word: 'geography', meaning: '地理', explanation: 'geo(地球)+graph(写)' },
        { word: 'geology', meaning: '地质学', explanation: 'geo(地球)+logy(学科)' }
      ]
    },
    {
      root: 'sci',
      meaning: '知识',
      examples: [
        { word: 'science', meaning: '科学', explanation: '系统的知识' },
        { word: 'scientist', meaning: '科学家', explanation: '研究知识的人' }
      ]
    },
    {
      root: 'nerv',
      meaning: '神经',
      examples: [
        { word: 'nervous', meaning: '紧张的', explanation: '神经紧绷的' },
        { word: 'nerve', meaning: '神经', explanation: '神经' }
      ]
    },
    {
      root: 'cycle',
      meaning: '轮子，循环',
      examples: [
        { word: 'bicycle', meaning: '自行车', explanation: '两个轮子' },
        { word: 'motorcycle', meaning: '摩托车', explanation: '机动车轮' }
      ]
    }
  ],

  // 获取相似词组
  getSimilarWords(word) {
    const similarGroups = [
      { words: ['cat', 'bat', 'hat', 'mat', 'fat'], common: '以-at结尾' },
      { words: ['one', 'two', 'three', 'four', 'five'], common: '数字' },
      { words: ['mother', 'father', 'brother', 'sister'], common: '家庭成员' },
      { words: ['red', 'yellow', 'blue', 'green'], common: '颜色' },
      { words: ['breakfast', 'lunch', 'dinner'], common: '一日三餐' },
      { words: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], common: '星期' },
      { words: ['happy', 'glad', 'excited'], common: '表示开心' },
      { words: ['cat', 'dog', 'lion', 'elephant'], common: '动物' },
      { words: ['rainy', 'sunny', 'windy', 'snowy'], common: '天气形容词' },
      { words: ['subway', 'bicycle', 'train'], common: '交通工具' }
    ]

    for (const group of similarGroups) {
      if (group.words.includes(word)) {
        return group.words.filter(w => w !== word)
      }
    }
    return []
  }
}
