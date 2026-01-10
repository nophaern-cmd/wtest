App({
  globalData: {
    words: {
      basic: [
        { english: 'big', chinese: '大', emoji: '📐' },
        { english: 'small', chinese: '小', emoji: '🔍' },
        { english: 'color', chinese: '颜色', emoji: '🎨' },
        { english: 'blue', chinese: '蓝色', emoji: '🔵' },
        { english: 'red', chinese: '红色', emoji: '🔴' },
        { english: 'yellow', chinese: '黄色', emoji: '🟡' },
        { english: 'green', chinese: '绿色', emoji: '🟢' },
        { english: 'monster', chinese: '怪物', emoji: '👹' },
        { english: 'ball', chinese: '球', emoji: '⚽' },
        { english: 'teddy', chinese: '泰迪熊', emoji: '🧸' },
        { english: 'train', chinese: '火车', emoji: '🚂' },
        { english: 'doll', chinese: '娃娃', emoji: '🪆' },
        { english: 'car', chinese: '汽车', emoji: '🚗' },
        { english: 'bike', chinese: '自行车', emoji: '🚲' },
        { english: 'fast', chinese: '快', emoji: '⚡' },
        { english: 'slow', chinese: '慢', emoji: '🐌' },
        { english: 'happy', chinese: '开心', emoji: '😊' },
        { english: 'sad', chinese: '伤心', emoji: '😢' },
        { english: 'Christmas', chinese: '圣诞节', emoji: '🎄' },
        { english: 'father Christmas', chinese: '圣诞老人', emoji: '🎅' },
        { english: 'reindeer', chinese: '驯鹿', emoji: '🦌' },
        { english: 'light', chinese: '灯', emoji: '💡' },
        { english: 'tree', chinese: '树', emoji: '🌲' },
        { english: 'gift', chinese: '礼物', emoji: '🎁' },
        { english: 'toy', chinese: '玩具', emoji: '🧸' },
        { english: 'hat', chinese: '帽子', emoji: '🧢' },
        { english: 'sleigh', chinese: '雪橇', emoji: '🛷' },
        { english: 'pumpkin', chinese: '南瓜', emoji: '🎃' },
        { english: 'witch', chinese: '女巫', emoji: '🧙' },
        { english: 'Trick-or-Treat', chinese: '不给糖，就捣蛋', emoji: '🍬' }
      ],
      phonics: {
        'Aa': [
          { english: 'apple', chinese: '苹果', emoji: '🍎' },
          { english: 'ant', chinese: '蚂蚁', emoji: '🐜' },
          { english: 'alligator', chinese: '鳄鱼', emoji: '🐊' },
          { english: 'ax', chinese: '斧头', emoji: '🪓' }
        ],
        'Bb': [
          { english: 'bear', chinese: '熊', emoji: '🐻' },
          { english: 'bird', chinese: '鸟', emoji: '🐦' },
          { english: 'bed', chinese: '床', emoji: '🛏️' },
          { english: 'banana', chinese: '香蕉', emoji: '🍌' }
        ],
        'Cc': [
          { english: 'cat', chinese: '小猫', emoji: '🐱' },
          { english: 'cup', chinese: '杯子', emoji: '🥤' },
          { english: 'computer', chinese: '电脑', emoji: '💻' },
          { english: 'car', chinese: '小车', emoji: '🚗' }
        ],
        'Hh': [
          { english: 'hat', chinese: '帽子', emoji: '🧢' },
          { english: 'horse', chinese: '马', emoji: '🐎' },
          { english: 'hotdog', chinese: '热狗', emoji: '🌭' },
          { english: 'house', chinese: '房子', emoji: '🏠' }
        ],
        'Ii': [
          { english: 'igloo', chinese: '冰屋', emoji: '❄️' },
          { english: 'iguana', chinese: '蜥蜴', emoji: '🦎' },
          { english: 'insect', chinese: '昆虫', emoji: '🐝' },
          { english: 'ink', chinese: '墨水', emoji: '🖤' }
        ],
        'Ss': [
          { english: 'snake', chinese: '蛇', emoji: '🐍' },
          { english: 'sun', chinese: '太阳', emoji: '☀️' }
        ],
        'Dd': [
          { english: 'dog', chinese: '狗', emoji: '🐶' },
          { english: 'duck', chinese: '鸭子', emoji: '🦆' },
          { english: 'doll', chinese: '娃娃', emoji: '🪆' },
          { english: 'desk', chinese: '书桌', emoji: '🖥️' }
        ],
        'Ee': [
          { english: 'egg', chinese: '鸡蛋', emoji: '🥚' },
          { english: 'envelope', chinese: '信封', emoji: '✉️' },
          { english: 'elbow', chinese: '肘', emoji: '🦾' },
          { english: 'elephant', chinese: '大象', emoji: '🐘' }
        ],
        'Rr': [
          { english: 'rabbit', chinese: '兔子', emoji: '🐰' },
          { english: 'red', chinese: '红色', emoji: '🔴' }
        ]
      }
    },
    sentences: [
      { english: 'Can you be big/small?', chinese: '你可以变大/变小吗？' },
      { english: 'I am big/small.', chinese: '我变大/变小。' },
      { english: 'I can see a monster.', chinese: '我能看到一个怪物。' },
      { english: "It's got two big yellow eyes.", chinese: '它有两只黄色的大眼睛。' },
      { english: 'This is my face.', chinese: '这是我的脸。' },
      { english: "I've got one big red mouth.", chinese: '我有一个红色的嘴巴。' },
      { english: "It's circle.", chinese: '这是圆形。' },
      { english: "It's blue circle.", chinese: '这是蓝色的圆形。' },
      { english: 'I sit on my chair.', chinese: '我坐在椅子上。' },
      { english: 'I read my book.', chinese: '我在读书。' },
      { english: 'How are you today?', chinese: '你今天好吗？' },
      { english: "I'm happy.", chinese: '我很开心。' },
      { english: "What's your name?", chinese: '你叫什么名字？' },
      { english: "I'm CC", chinese: '我是CC。' },
      { english: 'What is this?', chinese: '这是什么？' },
      { english: "This is...", chinese: '这是……' },
      { english: "It's a...", chinese: '它是一个……' },
      { english: 'Here you are.', chinese: '这个给你。' },
      { english: 'Thank you.', chinese: '谢谢。' },
      { english: "It's fast.", chinese: '它很快。' },
      { english: "It's slow.", chinese: '它很慢。' },
      { english: 'Trick-or-Treat', chinese: '不给糖，就捣蛋。' },
      { english: 'Happy Halloween', chinese: '万圣节快乐。' },
      { english: 'Merry Christmas!', chinese: '圣诞节快乐！' },
      { english: 'What do you want for Christmas?', chinese: '你想要什么圣诞礼物？' },
      { english: "It's Christmas Day!", chinese: '今天是圣诞节呀！' }
    ],
    songs: [
      { name: 'This is my face', type: 'basic' },
      { name: 'Weather song', type: 'basic' },
      { name: 'Hello, teacher.', type: 'basic' },
      { name: 'If you are happy', type: 'basic' },
      { name: "I'm so happy", type: 'basic' },
      { name: 'Shape rap', type: 'basic' },
      { name: 'Colours everywhere', type: 'basic' },
      { name: 'Look at my toys', type: 'basic' },
      { name: 'My toys song', type: 'basic' },
      { name: 'Five little monkeys', type: 'basic' },
      { name: 'Knock knock trick or treat', type: 'festival' },
      { name: 'Merry Christmas song', type: 'festival' },
      { name: 'What do you want for Christmas', type: 'festival' },
      { name: 'A Ram Sam Sam', type: 'mc' },
      { name: 'Boo', type: 'mc' },
      { name: 'Johnny Giraffe', type: 'mc' }
    ],
    stories: [
      { name: 'The big monster', description: '含故事创编任务' },
      { name: "Let's play", description: '互动故事' },
      { name: 'Peppas Christmas', description: '圣诞节主题故事' },
      { name: 'Scary, not scary', description: 'RAZ分级绘本' },
      { name: 'Two', description: 'RAZ分级绘本' },
      { name: 'Christmas Eve', description: 'RAZ分级绘本' }
    ]
  },
  onLaunch() {
    console.log('小程序启动')
  }
})
