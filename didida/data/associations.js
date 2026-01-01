// 联想记忆数据 - 完整版本
// 包含：词根记忆、读音相似、拼写相似、包含关系、含义相似/相反

module.exports = {
  // 联想类型定义
  associationTypes: {
    '词根记忆': {
      icon: '🌳',
      color: '#4CAF50',
      description: '通过词根词缀记忆单词'
    },
    '读音相似': {
      icon: '🔊',
      color: '#2196F3',
      description: '发音相似或相同的单词'
    },
    '拼写相似': {
      icon: '✏️',
      color: '#FF9800',
      description: '拼写结构相似的单词'
    },
    '包含关系': {
      icon: '📦',
      color: '#9C27B0',
      description: '一个单词包含另一个单词'
    },
    '含义相似': {
      icon: '👥',
      color: '#E91E63',
      description: '意思相近的同义词'
    },
    '含义相反': {
      icon: '🔄',
      color: '#F44336',
      description: '意思相反的反义词'
    },
    '形状联想': {
      icon: '🔷',
      color: '#00BCD4',
      description: '单词形状与实物相似'
    }
  },

  // 幼儿园联想记忆
  kindergarten: [
    // 读音相似
    {
      id: 'assoc_kg_001',
      type: '读音相似',
      word: 'eye',
      phonetic: '/aɪ/',
      meaning: '眼睛',
      image: '👁️',
      association: 'eye的读音像"爱"，我们用眼睛去爱',
      memoryTip: 'eye(爱)眼睛',
      relatedWords: ['I', 'see', 'look']
    },
    {
      id: 'assoc_kg_002',
      type: '读音相似',
      word: 'cat',
      phonetic: '/kæt/',
      meaning: '猫',
      image: '🐱',
      association: 'cat读音像"凯特"，像个小女孩的名字',
      memoryTip: '凯特的猫cat',
      relatedWords: ['rat', 'bat', 'hat']
    },
    {
      id: 'assoc_kg_003',
      type: '读音相似',
      word: 'dog',
      phonetic: '/dɒɡ/',
      meaning: '狗',
      image: '🐕',
      association: 'dog读音像"道哥"，狗狗很讲道义',
      memoryTip: '道哥dog',
      relatedWords: ['log', 'frog']
    },
    {
      id: 'assoc_kg_004',
      type: '读音相似',
      word: 'nose',
      phonetic: '/nəʊz/',
      meaning: '鼻子',
      image: '👃',
      association: 'nose读音像"no-思"，鼻子不能堵塞',
      memoryTip: '鼻子no思，要通畅',
      relatedWords: ['rose', 'close']
    },

    // 拼写相似
    {
      id: 'assoc_kg_005',
      type: '拼写相似',
      word: 'cat',
      phonetic: '/kæt/',
      meaning: '猫',
      image: '🐱',
      association: 'cat改一个字母变成hat(帽子)、bat(蝙蝠)、mat(垫子)',
      memoryTip: 'cat猫-hat帽-bat蝠-mat垫',
      relatedWords: ['hat', 'bat', 'mat', 'rat']
    },
    {
      id: 'assoc_kg_006',
      type: '拼写相似',
      word: 'red',
      phonetic: '/red/',
      meaning: '红色',
      image: '🔴',
      association: 'red加一个字母变成bed(床)',
      memoryTip: '红色red-床bed',
      relatedWords: ['bed', 'led', 'ted']
    },
    {
      id: 'assoc_kg_007',
      type: '拼写相似',
      word: 'book',
      phonetic: '/bʊk/',
      meaning: '书',
      image: '📚',
      association: 'book和look(看)、cook(做饭)只差一个字母',
      memoryTip: 'book书-look看-cook做饭',
      relatedWords: ['look', 'cook', 'took']
    },
    {
      id: 'assoc_kg_008',
      type: '拼写相似',
      word: 'run',
      phonetic: '/rʌn/',
      meaning: '跑',
      image: '🏃',
      association: 'run和sun(太阳)、fun(乐趣)只差一个字母',
      memoryTip: 'run跑-sun日-fun乐',
      relatedWords: ['sun', 'fun', 'bun']
    },

    // 包含关系
    {
      id: 'assoc_kg_009',
      type: '包含关系',
      word: 'ear',
      phonetic: '/ɪə(r)/',
      meaning: '耳朵',
      image: '👂',
      association: 'hear(听见)里面有ear(耳朵)，用耳朵听',
      memoryTip: 'hear听-ear耳',
      relatedWords: ['hear', 'near', 'year']
    },
    {
      id: 'assoc_kg_010',
      type: '包含关系',
      word: 'art',
      phonetic: '/ɑːt/',
      meaning: '艺术',
      image: '🎨',
      association: 'heart(心)里面有art(艺术)，艺术需要用心',
      memoryTip: 'heart心-art艺术',
      relatedWords: ['heart', 'part', 'start']
    },
    {
      id: 'assoc_kg_011',
      type: '包含关系',
      word: 'sun',
      phonetic: '/sʌn/',
      meaning: '太阳',
      image: '☀️',
      association: 'funny(有趣)里面有sun(太阳)，太阳天很有趣',
      memoryTip: 'funny趣-sun日',
      relatedWords: ['funny', 'sunny']
    },
    {
      id: 'assoc_kg_012',
      type: '包含关系',
      word: 'hand',
      phonetic: '/hænd/',
      meaning: '手',
      image: '✋',
      association: 'happy(快乐)里面有and(和)和hand(手)',
      memoryTip: 'happy快乐-hand手',
      relatedWords: ['happy', 'candy']
    },

    // 形状联想
    {
      id: 'assoc_kg_013',
      type: '形状联想',
      word: 'eye',
      phonetic: '/aɪ/',
      meaning: '眼睛',
      image: '👁️',
      association: 'eye的拼写就像眼睛，e代表眼睛，y代表鼻子',
      memoryTip: 'eye像眼睛，y是鼻子',
      relatedWords: ['see', 'look']
    },
    {
      id: 'assoc_kg_014',
      type: '形状联想',
      word: 'chair',
      phonetic: '/tʃeə(r)/',
      meaning: '椅子',
      image: '🪑',
      association: 'chair里面有h，像椅子的靠背',
      memoryTip: 'chair椅h靠背',
      relatedWords: ['sit', 'table']
    },
    {
      id: 'assoc_kg_015',
      type: '形状联想',
      word: 'flower',
      phonetic: '/ˈflaʊə(r)/',
      meaning: '花',
      image: '🌸',
      association: 'flower里面有ow，像花朵的形状',
      memoryTip: 'flower花ow花瓣',
      relatedWords: ['bloom', 'grow']
    },

    // 含义相似
    {
      id: 'assoc_kg_016',
      type: '含义相似',
      word: 'dad',
      phonetic: '/dæd/',
      meaning: '爸爸',
      image: '👨',
      association: 'dad和father意思相同，都是爸爸',
      memoryTip: 'dad=father爸爸',
      relatedWords: ['father', 'papa']
    },
    {
      id: 'assoc_kg_017',
      type: '含义相似',
      word: 'mom',
      phonetic: '/mɒm/',
      meaning: '妈妈',
      image: '👩',
      association: 'mom和mother意思相同，都是妈妈',
      memoryTip: 'mom=mother妈妈',
      relatedWords: ['mother', 'mama']
    },
    {
      id: 'assoc_kg_018',
      type: '含义相似',
      word: 'hello',
      phonetic: '/həˈləʊ/',
      meaning: '你好',
      image: '👋',
      association: 'hello和hi意思相同，都是打招呼',
      memoryTip: 'hello=hi你好',
      relatedWords: ['hi', 'hey']
    },
    {
      id: 'assoc_kg_019',
      type: '含义相似',
      word: 'happy',
      phonetic: '/ˈhæpi/',
      meaning: '快乐',
      image: '😊',
      association: 'happy和glad意思相同，都表示开心',
      memoryTip: 'happy=glad快乐',
      relatedWords: ['glad', 'joy']
    },

    // 含义相反
    {
      id: 'assoc_kg_020',
      type: '含义相反',
      word: 'big',
      phonetic: '/bɪɡ/',
      meaning: '大',
      image: '🐘',
      association: 'big(大)的反义词是small(小)',
      memoryTip: 'big大-small小',
      relatedWords: ['small', 'large']
    },
    {
      id: 'assoc_kg_021',
      type: '含义相反',
      word: 'yes',
      phonetic: '/jes/',
      meaning: '是的',
      image: '✅',
      association: 'yes(是)的反义词是no(不)',
      memoryTip: 'yes是-no不',
      relatedWords: ['no', 'yeah']
    },
    {
      id: 'assoc_kg_022',
      type: '含义相反',
      word: 'fast',
      phonetic: '/fɑːst/',
      meaning: '快',
      image: '🏃',
      association: 'fast(快)的反义词是slow(慢)',
      memoryTip: 'fast快-slow慢',
      relatedWords: ['slow', 'quick']
    },
    {
      id: 'assoc_kg_023',
      type: '含义相反',
      word: 'hot',
      phonetic: '/hɒt/',
      meaning: '热',
      image: '🔥',
      association: 'hot(热)的反义词是cold(冷)',
      memoryTip: 'hot热-cold冷',
      relatedWords: ['cold', 'warm']
    }
  ],

  // 小学联想记忆
  primary: [
    // 词根记忆
    {
      id: 'assoc_p_001',
      type: '词根记忆',
      word: 'act',
      phonetic: '/ækt/',
      meaning: '行动',
      image: '🎬',
      association: 'act词根表示"做，行动"。actor演员，action动作，active积极的',
      memoryTip: 'act行动-actor演员-action动作-active积极',
      relatedWords: ['actor', 'action', 'active', 'activity']
    },
    {
      id: 'assoc_p_002',
      type: '词根记忆',
      word: 'form',
      phonetic: '/fɔːm/',
      meaning: '形式',
      image: '📋',
      association: 'form词根表示"形式，形状"。inform通知，uniform制服，perform表演',
      memoryTip: 'form形式-inform通知-uniform制服-perform表演',
      relatedWords: ['inform', 'uniform', 'perform', 'information']
    },
    {
      id: 'assoc_p_003',
      type: '词根记忆',
      word: 'port',
      phonetic: '/pɔːt/',
      meaning: '运输',
      image: '🚢',
      association: 'port词根表示"携带，运输"。import进口，export出口，sport运动(身体搬运)',
      memoryTip: 'port运输-import进口-export出口-sport运动',
      relatedWords: ['import', 'export', 'sport', 'report']
    },
    {
      id: 'assoc_p_004',
      type: '词根记忆',
      word: 'tele',
      phonetic: '/ˈteli/',
      meaning: '远的',
      image: '📺',
      association: 'tele词根表示"远"。telephone电话，television电视，telescope望远镜',
      memoryTip: 'tele远-telephone电话-television电视-telescope望远镜',
      relatedWords: ['telephone', 'television', 'telescope', 'telegram']
    },
    {
      id: 'assoc_p_005',
      type: '词根记忆',
      word: 'vis',
      phonetic: '/vɪz/',
      meaning: '看',
      image: '👁️',
      association: 'vis词根表示"看"。visit参观，vision视力，television电视',
      memoryTip: 'vis看-visit参观-vision视力-television电视',
      relatedWords: ['visit', 'vision', 'visible', 'television']
    },

    // 读音相似
    {
      id: 'assoc_p_006',
      type: '读音相似',
      word: 'flower',
      phonetic: '/ˈflaʊə(r)/',
      meaning: '花',
      image: '🌸',
      association: 'flower和flour(面粉)读音完全一样',
      memoryTip: 'flower花-flour面粉，读音相同',
      relatedWords: ['flour', 'bloom']
    },
    {
      id: 'assoc_p_007',
      type: '读音相似',
      word: 'son',
      phonetic: '/sʌn/',
      meaning: '儿子',
      image: '👦',
      association: 'son和sun(太阳)读音完全一样',
      memoryTip: 'son儿子-sun太阳，读音相同',
      relatedWords: ['sun', 'daughter']
    },
    {
      id: 'assoc_p_008',
      type: '读音相似',
      word: 'see',
      phonetic: '/siː/',
      meaning: '看见',
      image: '👀',
      association: 'see和sea(海)、C(字母C)读音一样',
      memoryTip: 'see看见-sea海-C字母',
      relatedWords: ['sea', 'look', 'watch']
    },
    {
      id: 'assoc_p_009',
      type: '读音相似',
      word: 'write',
      phonetic: '/raɪt/',
      meaning: '写',
      image: '✍️',
      association: 'write和right(正确的)读音一样',
      memoryTip: 'write写-right正确，读音相同',
      relatedWords: ['right', 'read', 'draw']
    },
    {
      id: 'assoc_p_010',
      type: '读音相似',
      word: 'by',
      phonetic: '/baɪ/',
      meaning: '在...旁边',
      image: '➡️',
      association: 'by和buy(买)、bye(再见)读音一样',
      memoryTip: 'by在-bye再见-buy买，读音相同',
      relatedWords: ['buy', 'bye', 'near']
    },

    // 拼写相似
    {
      id: 'assoc_p_011',
      type: '拼写相似',
      word: 'house',
      phonetic: '/haʊs/',
      meaning: '房子',
      image: '🏠',
      association: 'house改一个字母变成mouse(老鼠)',
      memoryTip: 'house房-mouse鼠，只差一个字母',
      relatedWords: ['mouse', 'horse', 'mouth']
    },
    {
      id: 'assoc_p_012',
      type: '拼写相似',
      word: 'right',
      phonetic: '/raɪt/',
      meaning: '正确的',
      image: '✅',
      association: 'right改一个字母变成light(光)、night(夜)、fight(打架)',
      memoryTip: 'right对-light光-night夜-fight打',
      relatedWords: ['light', 'night', 'fight', 'might']
    },
    {
      id: 'assoc_p_013',
      type: '拼写相似',
      word: 'here',
      phonetic: '/hɪə(r)/',
      meaning: '这里',
      image: '📍',
      association: 'here改一个字母变成there(那里)',
      memoryTip: 'here这-there那，h和t互换',
      relatedWords: ['there', 'where', 'near']
    },
    {
      id: 'assoc_p_014',
      type: '拼写相似',
      word: 'from',
      phonetic: '/frɒm/',
      meaning: '来自',
      image: '🏃',
      association: 'from和form(形式)只差一个字母',
      memoryTip: 'from来自-form形式，一个字母区别',
      relatedWords: ['form', 'room', 'for']
    },
    {
      id: 'assoc_p_015',
      type: '拼写相似',
      word: 'three',
      phonetic: '/θriː/',
      meaning: '三',
      image: '3️⃣',
      association: 'three改一个字母变成tree(树)',
      memoryTip: 'three三-tree树，r和ee互换位置',
      relatedWords: ['tree', 'free', 'street']
    },

    // 包含关系
    {
      id: 'assoc_p_016',
      type: '包含关系',
      word: 'all',
      phonetic: '/ɔːl/',
      meaning: '所有',
      image: '🌟',
      association: 'ball(球)、wall(墙)、tall(高)都有all',
      memoryTip: 'all所有-ball球-wall墙-tall高',
      relatedWords: ['ball', 'wall', 'tall', 'small', 'call']
    },
    {
      id: 'assoc_p_017',
      type: '包含关系',
      word: 'ear',
      phonetic: '/ɪə(r)/',
      meaning: '耳朵',
      image: '👂',
      association: 'hear(听)、near(近)、year(年)、dear(亲爱的)都有ear',
      memoryTip: 'ear耳-hear听-near近-year年-dear亲',
      relatedWords: ['hear', 'near', 'year', 'dear', 'clear']
    },
    {
      id: 'assoc_p_018',
      type: '包含关系',
      word: 'art',
      phonetic: '/ɑːt/',
      meaning: '艺术',
      image: '🎨',
      association: 'heart(心)、part(部分)、start(开始)、cart(车)都有art',
      memoryTip: 'art艺-heart心-part部-start始-cart车',
      relatedWords: ['heart', 'part', 'start', 'smart', 'chart']
    },
    {
      id: 'assoc_p_019',
      type: '包含关系',
      word: 'book',
      phonetic: '/bʊk/',
      meaning: '书',
      image: '📚',
      association: 'look(看)、cook(厨)、took(拿)都有ook',
      memoryTip: 'book书-look看-cook厨-took拿',
      relatedWords: ['look', 'cook', 'took', 'hook']
    },
    {
      id: 'assoc_p_020',
      type: '包含关系',
      word: 'hand',
      phonetic: '/hænd/',
      meaning: '手',
      image: '✋',
      association: 'happy(快乐)、candy(糖果)、and(和)都有and',
      memoryTip: 'hand手-happy乐-candy糖-and和',
      relatedWords: ['happy', 'candy', 'stand', 'band']
    },

    // 含义相似
    {
      id: 'assoc_p_021',
      type: '含义相似',
      word: 'big',
      phonetic: '/bɪɡ/',
      meaning: '大',
      image: '🐘',
      association: 'big和large、huge意思相似，都表示大',
      memoryTip: 'big大=large大=huge大',
      relatedWords: ['large', 'huge', 'enormous']
    },
    {
      id: 'assoc_p_022',
      type: '含义相似',
      word: 'small',
      phonetic: '/smɔːl/',
      meaning: '小',
      image: '🐭',
      association: 'small和little、tiny意思相似，都表示小',
      memoryTip: 'small小=little小=tiny小',
      relatedWords: ['little', 'tiny', 'short']
    },
    {
      id: 'assoc_p_023',
      type: '含义相似',
      word: 'say',
      phonetic: '/seɪ/',
      meaning: '说',
      image: '💬',
      association: 'say和speak、tell、talk意思相似，都表示说',
      memoryTip: 'say说=speak说=tell讲=talk谈',
      relatedWords: ['speak', 'tell', 'talk', 'shout']
    },
    {
      id: 'assoc_p_024',
      type: '含义相似',
      word: 'look',
      phonetic: '/lʊk/',
      meaning: '看',
      image: '👀',
      association: 'look和see、watch意思相似，都表示看',
      memoryTip: 'look看=see看=watch看',
      relatedWords: ['see', 'watch', 'view', 'stare']
    },
    {
      id: 'assoc_p_025',
      type: '含义相似',
      word: 'happy',
      phonetic: '/ˈhæpi/',
      meaning: '快乐',
      image: '😊',
      association: 'happy和glad、joyful意思相似，都表示快乐',
      memoryTip: 'happy快乐=glad高兴=joyful欢喜',
      relatedWords: ['glad', 'joyful', 'cheerful', 'pleased']
    },

    // 含义相反
    {
      id: 'assoc_p_026',
      type: '含义相反',
      word: 'big',
      phonetic: '/bɪɡ/',
      meaning: '大',
      image: '🐘',
      association: 'big(大)的反义词是small(小)',
      memoryTip: 'big大-small小',
      relatedWords: ['small', 'large']
    },
    {
      id: 'assoc_p_027',
      type: '含义相反',
      word: 'tall',
      phonetic: '/tɔːl/',
      meaning: '高',
      image: '🌳',
      association: 'tall(高)的反义词是short(矮)',
      memoryTip: 'tall高-short矮',
      relatedWords: ['short', 'high']
    },
    {
      id: 'assoc_p_028',
      type: '含义相反',
      word: 'hot',
      phonetic: '/hɒt/',
      meaning: '热',
      image: '🔥',
      association: 'hot(热)的反义词是cold(冷)',
      memoryTip: 'hot热-cold冷',
      relatedWords: ['cold', 'warm']
    },
    {
      id: 'assoc_p_029',
      type: '含义相反',
      word: 'old',
      phonetic: '/əʊld/',
      meaning: '老',
      image: '👴',
      association: 'old(老)的反义词是new(新)或young(年轻)',
      memoryTip: 'old老-new新，old老-young幼',
      relatedWords: ['new', 'young']
    },
    {
      id: 'assoc_p_030',
      type: '含义相反',
      word: 'fast',
      phonetic: '/fɑːst/',
      meaning: '快',
      image: '🏃',
      association: 'fast(快)的反义词是slow(慢)',
      memoryTip: 'fast快-slow慢',
      relatedWords: ['slow', 'quick']
    },
    {
      id: 'assoc_p_031',
      type: '含义相反',
      word: 'love',
      phonetic: '/lʌv/',
      meaning: '爱',
      image: '❤️',
      association: 'love(爱)的反义词是hate(恨)',
      memoryTip: 'love爱-hate恨',
      relatedWords: ['hate', 'like']
    },
    {
      id: 'assoc_p_032',
      type: '含义相反',
      word: 'easy',
      phonetic: '/ˈiːzi/',
      meaning: '容易',
      image: '😊',
      association: 'easy(容易)的反义词是difficult(困难)或hard(难)',
      memoryTip: 'easy易-difficult难-hard难',
      relatedWords: ['difficult', 'hard']
    },
    {
      id: 'assoc_p_033',
      type: '含义相反',
      word: 'come',
      phonetic: '/kʌm/',
      meaning: '来',
      image: '🚶',
      association: 'come(来)的反义词是go(去)',
      memoryTip: 'come来-go去',
      relatedWords: ['go', 'arrive']
    },
    {
      id: 'assoc_p_034',
      type: '含义相反',
      word: 'yes',
      phonetic: '/jes/',
      meaning: '是',
      image: '✅',
      association: 'yes(是)的反义词是no(不)',
      memoryTip: 'yes是-no不',
      relatedWords: ['no', 'right']
    },
    {
      id: 'assoc_p_035',
      type: '含义相反',
      word: 'good',
      phonetic: '/ɡʊd/',
      meaning: '好',
      image: '👍',
      association: 'good(好)的反义词是bad(坏)',
      memoryTip: 'good好-bad坏',
      relatedWords: ['bad', 'fine', 'nice']
    }
  ],

  // 初中联想记忆
  junior: [
    // 词根记忆
    {
      id: 'assoc_j_001',
      type: '词根记忆',
      word: 'spect',
      phonetic: '/spekt/',
      meaning: '看',
      image: '👁️',
      association: 'spect词根表示"看"。inspect检查，respect尊重，expect期待',
      memoryTip: 'spect看-inspect查-respect尊-expect期',
      relatedWords: ['inspect', 'respect', 'expect', 'aspect', 'spectator']
    },
    {
      id: 'assoc_j_002',
      type: '词根记忆',
      word: 'struct',
      phonetic: '/strʌkt/',
      meaning: '建造',
      image: '🏗️',
      association: 'struct词根表示"建造"。structure结构，construct建设，destroy破坏',
      memoryTip: 'struct建-structure构-construct建-destroy破',
      relatedWords: ['structure', 'construct', 'instruct', 'destruction']
    },
    {
      id: 'assoc_j_003',
      type: '词根记忆',
      word: 'duc',
      phonetic: '/djuːk/',
      meaning: '引导',
      image: '➡️',
      association: 'duc词根表示"引导"。educate教育，introduce介绍，produce生产',
      memoryTip: 'duc引-educate教-introduce介-produce产',
      relatedWords: ['educate', 'introduce', 'produce', 'reduce', 'conduct']
    },
    {
      id: 'assoc_j_004',
      type: '词根记忆',
      word: 'ject',
      phonetic: '/dʒekt/',
      meaning: '投掷',
      image: '🎯',
      association: 'ject词根表示"投掷"。object物体，subject科目，reject拒绝',
      memoryTip: 'ject投-object物-subject科-reject拒',
      relatedWords: ['object', 'subject', 'reject', 'inject', 'project']
    },
    {
      id: 'assoc_j_005',
      type: '词根记忆',
      word: 'press',
      phonetic: '/pres/',
      meaning: '压',
      image: '📰',
      association: 'press词根表示"压"。express表达，depress压抑，impress留下印象',
      memoryTip: 'press压-express表-depress抑-impress印',
      relatedWords: ['express', 'depress', 'impress', 'pressure', 'compress']
    },
    {
      id: 'assoc_j_006',
      type: '词根记忆',
      word: 'script',
      phonetic: '/skrɪpt/',
      meaning: '写',
      image: '✍️',
      association: 'script词根表示"写"。describe描述，prescribe开处方，manuscript手稿',
      memoryTip: 'script写-describe述-prescribe开-manuscript稿',
      relatedWords: ['describe', 'prescribe', 'manuscript', 'subscribe']
    },
    {
      id: 'assoc_j_007',
      type: '词根记忆',
      word: 'bio',
      phonetic: '/ˈbaɪəʊ/',
      meaning: '生命',
      image: '🧬',
      association: 'bio词根表示"生命"。biology生物，biography传记，autobiography自传',
      memoryTip: 'bio命-biology生-biography传-autobiography自传',
      relatedWords: ['biology', 'biography', 'autobiography', 'symbiosis']
    },
    {
      id: 'assoc_j_008',
      type: '词根记忆',
      word: 'geo',
      phonetic: '/dʒiːəʊ/',
      meaning: '地球',
      image: '🌍',
      association: 'geo词根表示"地球"。geography地理，geology地质，geometry几何',
      memoryTip: 'geo地-geography理-geology质-geometry计',
      relatedWords: ['geography', 'geology', 'geometry', 'geography']
    },

    // 读音相似
    {
      id: 'assoc_j_009',
      type: '读音相似',
      word: 'weather',
      phonetic: '/ˈweðə(r)/',
      meaning: '天气',
      image: '🌤️',
      association: 'weather和whether(是否)读音完全一样',
      memoryTip: 'weather天-whether否，读音相同',
      relatedWords: ['whether', 'climate', 'forecast']
    },
    {
      id: 'assoc_j_010',
      type: '读音相似',
      word: 'peace',
      phonetic: '/piːs/',
      meaning: '和平',
      image: '☮️',
      association: 'peace和piece(片)读音完全一样',
      memoryTip: 'peace和平-piece片，读音相同',
      relatedWords: ['piece', 'peaceful', 'war']
    },
    {
      id: 'assoc_j_011',
      type: '读音相似',
      word: 'wait',
      phonetic: '/weɪt/',
      meaning: '等待',
      image: '⏳',
      association: 'wait和weight(重量)读音完全一样',
      memoryTip: 'wait等-weight重，读音相同',
      relatedWords: ['weight', 'heavy', 'await']
    },
    {
      id: 'assoc_j_012',
      type: '读音相似',
      word: 'brake',
      phonetic: '/breɪk/',
      meaning: '刹车',
      image: '🚗',
      association: 'brake和break(打破)读音完全一样',
      memoryTip: 'brake刹-break破，读音相同',
      relatedWords: ['break', 'stop', 'slow']
    },
    {
      id: 'assoc_j_013',
      type: '读音相似',
      word: 'hole',
      phonetic: '/həʊl/',
      meaning: '洞',
      image: '🕳️',
      association: 'hole和whole(全部)读音完全一样',
      memoryTip: 'hole洞-whole全，读音相同',
      relatedWords: ['whole', 'complete', 'empty']
    },

    // 拼写相似
    {
      id: 'assoc_j_014',
      type: '拼写相似',
      word: 'quiet',
      phonetic: '/ˈkwaɪət/',
      meaning: '安静的',
      image: '🤫',
      association: 'quiet改字母顺序变成quite(非常)',
      memoryTip: 'quiet静-quite非，字母顺序不同',
      relatedWords: ['quite', 'silent', 'calm']
    },
    {
      id: 'assoc_j_015',
      type: '拼写相似',
      word: 'adapt',
      phonetic: '/əˈdæpt/',
      meaning: '适应',
      image: '🔄',
      association: 'adapt改一个字母变成adopt(收养)',
      memoryTip: 'adapt适应-adopt收养，一个字母区别',
      relatedWords: ['adopt', 'adjust', 'change']
    },
    {
      id: 'assoc_j_016',
      type: '拼写相似',
      word: 'affect',
      phonetic: '/əˈfekt/',
      meaning: '影响',
      image: '↔️',
      association: 'affect和effect(效果)只差一个字母，容易混淆',
      memoryTip: 'affect影响(动词)-effect效果(名词)',
      relatedWords: ['effect', 'influence', 'impact']
    },
    {
      id: 'assoc_j_017',
      type: '拼写相似',
      word: 'principal',
      phonetic: '/ˈprɪnsəpl/',
      meaning: '校长',
      image: '🎓',
      association: 'principal和principle(原则)只差一个字母',
      memoryTip: 'principal校长(人)-principle原则(理)',
      relatedWords: ['principle', 'school', 'headmaster']
    },
    {
      id: 'assoc_j_018',
      type: '拼写相似',
      word: 'diary',
      phonetic: '/ˈdaɪəri/',
      meaning: '日记',
      image: '📓',
      association: 'diary和dairy(乳制品)只差一个字母',
      memoryTip: 'diary日记-dairy乳制品，一个字母区别',
      relatedWords: ['dairy', 'journal', 'notebook']
    },

    // 包含关系
    {
      id: 'assoc_j_019',
      type: '包含关系',
      word: 'the',
      phonetic: '/ðə/',
      meaning: '这/那',
      image: '🔍',
      association: 'there(那里)、these(这些)、their(他们的)、other(其他的)都有the',
      memoryTip: 'the那-there那-these这-their他-other他',
      relatedWords: ['there', 'these', 'their', 'other', 'together']
    },
    {
      id: 'assoc_j_020',
      type: '包含关系',
      word: 'in',
      phonetic: '/ɪn/',
      meaning: '在...里面',
      image: '📦',
      association: 'into(进入)、inside(里面)、include(包含)都有in',
      memoryTip: 'in里-into进-inside内-include含',
      relatedWords: ['into', 'inside', 'include', 'inform', 'begin']
    },
    {
      id: 'assoc_j_021',
      type: '包含关系',
      word: 'port',
      phonetic: '/pɔːt/',
      meaning: '港口',
      image: '🚢',
      association: 'support(支持)、import(进口)、export(出口)、report(报告)都有port',
      memoryTip: 'port港-support支-import进-export出-report报',
      relatedWords: ['support', 'import', 'export', 'report', 'transport']
    },
    {
      id: 'assoc_j_022',
      type: '包含关系',
      word: 'act',
      phonetic: '/ækt/',
      meaning: '行动',
      image: '🎬',
      association: 'action(动作)、active(积极的)、actor(演员)、practice(练习)都有act',
      memoryTip: 'act动-action作-active极-actor员-practice练',
      relatedWords: ['action', 'active', 'actor', 'practice', 'react']
    },
    {
      id: 'assoc_j_023',
      type: '包含关系',
      word: 'form',
      phonetic: '/fɔːm/',
      meaning: '形式',
      image: '📋',
      association: 'information(信息)、perform(表演)、platform(平台)、uniform(制服)都有form',
      memoryTip: 'form形-information息-perform演-platform台-uniform服',
      relatedWords: ['information', 'perform', 'platform', 'uniform', 'transform']
    },

    // 含义相似
    {
      id: 'assoc_j_024',
      type: '含义相似',
      word: 'big',
      phonetic: '/bɪɡ/',
      meaning: '大',
      image: '🐘',
      association: 'big和large、huge、vast、enormous意思相似',
      memoryTip: 'big大=large大=huge大=vast大=enormous大',
      relatedWords: ['large', 'huge', 'vast', 'enormous', 'giant']
    },
    {
      id: 'assoc_j_025',
      type: '含义相似',
      word: 'happy',
      phonetic: '/ˈhæpi/',
      meaning: '快乐',
      image: '😊',
      association: 'happy和glad、joyful、cheerful、delighted意思相似',
      memoryTip: 'happy乐=glad喜=joyful欢=cheerful悦=delighted乐',
      relatedWords: ['glad', 'joyful', 'cheerful', 'delighted', 'pleased']
    },
    {
      id: 'assoc_j_026',
      type: '含义相似',
      word: 'say',
      phonetic: '/seɪ/',
      meaning: '说',
      image: '💬',
      association: 'say和speak、tell、talk、state、declare意思相似',
      memoryTip: 'say说=speak说=tell讲=talk谈=state述=declare宣',
      relatedWords: ['speak', 'tell', 'talk', 'state', 'declare', 'express']
    },
    {
      id: 'assoc_j_027',
      type: '含义相似',
      word: 'think',
      phonetic: '/θɪŋk/',
      meaning: '想',
      image: '💭',
      association: 'think和believe、consider、suppose、assume意思相似',
      memoryTip: 'think想=believe信=consider虑=suppose设=assume假',
      relatedWords: ['believe', 'consider', 'suppose', 'assume', 'imagine']
    },
    {
      id: 'assoc_j_028',
      type: '含义相似',
      word: 'important',
      phonetic: '/ɪmˈpɔːtnt/',
      meaning: '重要的',
      image: '⭐',
      association: 'important和significant、essential、vital、crucial意思相似',
      memoryTip: 'important重=significant重=essential要=vital关=crucial重',
      relatedWords: ['significant', 'essential', 'vital', 'crucial', 'major']
    },

    // 含义相反
    {
      id: 'assoc_j_029',
      type: '含义相反',
      word: 'accept',
      phonetic: '/əkˈsept/',
      meaning: '接受',
      image: '✅',
      association: 'accept(接受)的反义词是refuse(拒绝)或reject(拒绝)',
      memoryTip: 'accept受-refuse拒-reject拒',
      relatedWords: ['refuse', 'reject', 'receive']
    },
    {
      id: 'assoc_j_030',
      type: '含义相反',
      word: 'succeed',
      phonetic: '/səkˈsiːd/',
      meaning: '成功',
      image: '🏆',
      association: 'succeed(成功)的反义词是fail(失败)',
      memoryTip: 'succeed成-fail败',
      relatedWords: ['fail', 'achieve', 'win']
    },
    {
      id: 'assoc_j_031',
      type: '含义相反',
      word: 'encourage',
      phonetic: '/ɪnˈkʌrɪdʒ/',
      meaning: '鼓励',
      image: '💪',
      association: 'encourage(鼓励)的反义词是discourage(打击)',
      memoryTip: 'encourage励-discourage挫',
      relatedWords: ['discourage', 'support', 'inspire']
    },
    {
      id: 'assoc_j_032',
      type: '含义相反',
      word: 'increase',
      phonetic: '/ɪnˈkriːs/',
      meaning: '增加',
      image: '📈',
      association: 'increase(增加)的反义词是decrease(减少)',
      memoryTip: 'increase增-decrease减',
      relatedWords: ['decrease', 'reduce', 'raise']
    },
    {
      id: 'assoc_j_033',
      type: '含义相反',
      word: 'connect',
      phonetic: '/kəˈnekt/',
      meaning: '连接',
      image: '🔗',
      association: 'connect(连接)的反义词是disconnect(断开)或separate(分离)',
      memoryTip: 'connect连-disconnect断-separate离',
      relatedWords: ['disconnect', 'separate', 'join', 'link']
    },
    {
      id: 'assoc_j_034',
      type: '含义相反',
      word: 'expensive',
      phonetic: '/ɪkˈspensɪv/',
      meaning: '昂贵的',
      image: '💰',
      association: 'expensive(昂贵)的反义词是cheap(便宜)',
      memoryTip: 'expensive贵-cheap廉',
      relatedWords: ['cheap', 'pricey', 'dear']
    },
    {
      id: 'assoc_j_035',
      type: '含义相反',
      word: 'dangerous',
      phonetic: '/ˈdeɪndʒərəs/',
      meaning: '危险的',
      image: '⚠️',
      association: 'dangerous(危险)的反义词是safe(安全的)',
      memoryTip: 'dangerous险-safe安',
      relatedWords: ['safe', 'secure', 'risky']
    }
  ],

  // 获取指定级别的联想记忆
  getAssociationsByLevel(level) {
    if (level === 'kindergarten') {
      return this.kindergarten
    } else if (level === 'primary') {
      return this.primary
    } else if (level === 'junior') {
      return this.junior
    }
    return []
  },

  // 获取指定类型的联想记忆
  getAssociationsByType(level, type) {
    let associations = this.getAssociationsByLevel(level)
    return associations.filter(a => a.type === type)
  },

  // 根据ID获取联想记忆
  getAssociationById(id) {
    const all = [...this.kindergarten, ...this.primary, ...this.junior]
    return all.find(a => a.id === id)
  },

  // 获取联想类型列表
  getAssociationTypes() {
    return this.associationTypes
  },

  // 获取指定级别的可用类型
  getAvailableTypes(level) {
    let associations = this.getAssociationsByLevel(level)
    const types = {}
    associations.forEach(a => {
      if (!types[a.type]) {
        types[a.type] = this.associationTypes[a.type]
      }
    })
    return types
  }
}
