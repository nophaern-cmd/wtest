// 古诗词学习数据 - 20首
const poemsData = [
    {
        id: 1,
        title: "静夜思",
        author: "李白",
        dynasty: "唐",
        content: "床前明月光，\n疑是地上霜。\n举头望明月，\n低头思故乡。",
        pinyin: "chuáng qián míng yuè guāng,\nyí shì dì shàng shuāng.\njǔ tóu wàng míng yuè,\ndī tóu sī gù xiāng.",
        explanation: "明亮的月光洒在床前的窗户纸上，好像地上泛起了一层白霜。我禁不住抬起头来，看那天窗外空中的一轮明月，不由得低头沉思，想起远方的家乡。",
        notes: "床：窗户前的围栏。疑：好像。举头：抬头。"
    },
    {
        id: 2,
        title: "春晓",
        author: "孟浩然",
        dynasty: "唐",
        content: "春眠不觉晓，\n处处闻啼鸟。\n夜来风雨声，\n花落知多少。",
        pinyin: "chūn mián bù jué xiǎo,\nchù chù wén tí niǎo.\nyè lái fēng yǔ shēng,\nhuā luò zhī duō shǎo.",
        explanation: "春天睡觉舒适，不知不觉天就亮了，醒来时到处可以听见鸟的叫声。回想夜里的风雨声，不知道花儿被打落了多少。",
        notes: "晓：天亮。闻：听到。啼：鸟叫。"
    },
    {
        id: 3,
        title: "登鹳雀楼",
        author: "王之涣",
        dynasty: "唐",
        content: "白日依山尽，\n黄河入海流。\n欲穷千里目，\n更上一层楼。",
        pinyin: "bái rì yī shān jìn,\nhuáng hé rù hǎi liú.\nyù qióng qiān lǐ mù,\ngèng shàng yī céng lóu.",
        explanation: "太阳依傍山峦渐渐下沉，黄河向着大海滔滔东流。如果想要看到千里之外的风景，就要再登上一层楼。",
        notes: "依：靠着。尽：消失。欲：想要。穷：尽，达到极点。"
    },
    {
        id: 4,
        title: "咏鹅",
        author: "骆宾王",
        dynasty: "唐",
        content: "鹅鹅鹅，\n曲项向天歌。\n白毛浮绿水，\n红掌拨清波。",
        pinyin: "é é é,\nqǔ xiàng xiàng tiān gē.\nbái máo fú lǜ shuǐ,\nhóng zhǎng bō qīng bō.",
        explanation: "鹅呀鹅，弯着脖子对着天空唱歌。洁白的羽毛漂浮在碧绿的水面上，红红的脚掌拨动着清清的水波。",
        notes: "曲项：弯着脖子。歌：唱歌。浮：漂浮。拨：划动。"
    },
    {
        id: 5,
        title: "悯农（其一）",
        author: "李绅",
        dynasty: "唐",
        content: "春种一粒粟，\n秋收万颗子。\n四海无闲田，\n农夫犹饿死。",
        pinyin: "chūn zhòng yī lì sù,\nqiū shōu wàn kē zǐ.\nsì hǎi wú xián tián,\nnóng fū yóu è sǐ.",
        explanation: "春天播种下一粒粟种，秋天收获万颗粮食。天下没有闲置的田地，农民还是会被饿死。",
        notes: "粟：谷子。四海：天下。闲田：荒废的田地。犹：仍然。"
    },
    {
        id: 6,
        title: "悯农（其二）",
        author: "李绅",
        dynasty: "唐",
        content: "锄禾日当午，\n汗滴禾下土。\n谁知盘中餐，\n粒粒皆辛苦。",
        pinyin: "chú hé rì dāng wǔ,\nhàn dī hé xià tǔ.\nshuí zhī pán zhōng cān,\nlì lì jiē xīn kǔ.",
        explanation: "中午时分，农民在烈日下锄禾，汗水滴进禾苗下的土里。谁能知道碗中的米饭，每一粒都是农民辛苦劳动得来的啊！",
        notes: "禾：谷类植物。当午：正午。皆：都。"
    },
    {
        id: 7,
        title: "江南",
        author: "汉乐府",
        dynasty: "汉",
        content: "江南可采莲，\n莲叶何田田。\n鱼戏莲叶间，\n鱼戏莲叶东，\n鱼戏莲叶西，\n鱼戏莲叶南，\n鱼戏莲叶北。",
        pinyin: "jiāng nán kě cǎi lián,\nlián yè hé tián tián.\nyú xì lián yè jiān,\nyú xì lián yè dōng,\nyú xì lián yè xī,\nyú xì lián yè nán,\nyú xì lián yè běi.",
        explanation: "江南水乡适合采莲，莲叶多么茂盛啊。鱼儿在莲叶间嬉戏，一会儿游到莲叶东边，一会儿游到西边，一会儿游到南边，一会儿游到北边。",
        notes: "采莲：采摘莲子。何：多么。田田：莲叶茂盛的样子。戏：嬉戏。"
    },
    {
        id: 8,
        title: "望庐山瀑布",
        author: "李白",
        dynasty: "唐",
        content: "日照香炉生紫烟，\n遥看瀑布挂前川。\n飞流直下三千尺，\n疑是银河落九天。",
        pinyin: "rì zhào xiāng lú shēng zǐ yān,\nyáo kàn pù bù guà qián chuān.\nfēi liú zhí xià sān qiān chǐ,\nyí shì yín hé luò jiǔ tiān.",
        explanation: "太阳照射香炉峰升起紫色的烟雾，远远望去瀑布像一条白练挂在山前。飞流直泻三千尺，像是银河从九天倾泻下来。",
        notes: "香炉：庐山香炉峰。紫烟：紫色的云雾。川：河流。九天：天的最高处。"
    },
    {
        id: 9,
        title: "绝句",
        author: "杜甫",
        dynasty: "唐",
        content: "两个黄鹂鸣翠柳，\n一行白鹭上青天。\n窗含西岭千秋雪，\n门泊东吴万里船。",
        pinyin: "liǎng gè huáng lí míng cuì liǔ,\nyī háng bái lù shàng qīng tiān.\nchuāng hán xī lǐng qiān qiū xuě,\nmén bó dōng wú wàn lǐ chuán.",
        explanation: "两只黄鹂在翠绿的柳树上欢快地歌唱，一行白鹭直冲向蔚蓝的天空。从窗口可以看到西岭千年不化的积雪，门前停泊着从万里之外东吴开来的船只。",
        notes: "鸣：鸟叫。翠柳：翠绿的柳树。含：包含，看到。泊：停泊。"
    },
    {
        id: 10,
        title: "赠汪伦",
        author: "李白",
        dynasty: "唐",
        content: "李白乘舟将欲行，\n忽闻岸上踏歌声。\n桃花潭水深千尺，\n不及汪伦送我情。",
        pinyin: "lǐ bái chéng zhōu jiāng yù xíng,\nhū wén àn shàng tà gē shēng.\ntáo huā tán shuǐ shēn qiān chǐ,\nbù jí wāng lún sòng wǒ qíng.",
        explanation: "李白乘船将要离去，忽然听到岸上传来踏歌的声音。桃花潭的水深达千尺，也比不上汪伦送我的情谊深厚。",
        notes: "乘舟：坐船。将欲：将要。踏歌：一种边唱边用脚踏地的歌舞。不及：比不上。"
    },
    {
        id: 11,
        title: "早发白帝城",
        author: "李白",
        dynasty: "唐",
        content: "朝辞白帝彩云间，\n千里江陵一日还。\n两岸猿声啼不住，\n轻舟已过万重山。",
        pinyin: "zhāo cí bái dì cǎi yún jiān,\nqiān lǐ jiāng líng yī rì huán.\nliǎng àn yuán shēng tí bù zhù,\nqīng zhōu yǐ guò wàn chóng shān.",
        explanation: "清晨告别彩云缭绕的白帝城，千里之遥的江陵一天就能到达。两岸猿猴的啼叫声不断，轻快的小舟已经驶过了重重高山。",
        notes: "朝辞：早晨离开。白帝：白帝城。江陵：今湖北荆州。啼：叫。"
    },
    {
        id: 12,
        title: "望天门山",
        author: "李白",
        dynasty: "唐",
        content: "天门中断楚江开，\n碧水东流至此回。\n两岸青山相对出，\n孤帆一片日边来。",
        pinyin: "tiān mén zhōng duàn chǔ jiāng kāi,\nbì shuǐ dōng liú zhì cǐ huí.\nliǎng àn qīng shān xiāng duì chū,\ngū fān yī piàn rì biān lái.",
        explanation: "天门山被长江从中间冲断开，碧绿的江水向东流到这里回旋。两岸青山相对而立，一叶孤帆从太阳升起的地方驶来。",
        notes: "天门：天门山。楚江：长江。回：回旋。相对出：相对耸立。"
    },
    {
        id: 13,
        title: "别董大",
        author: "高适",
        dynasty: "唐",
        content: "千里黄云白日曛，\n北风吹雁雪纷纷。\n莫愁前路无知己，\n天下谁人不识君。",
        pinyin: "qiān lǐ huáng yún bái rì xūn,\nběi fēng chuī yàn xuě fēn fēn.\nmò chóu qián lù wú zhī jǐ,\ntiān xià shuí rén bù shí jūn.",
        explanation: "千里黄云遮蔽了天空，太阳昏暗无光，北风呼啸，大雁南飞，雪花纷纷飘落。不要担心前方的路上没有知己，天下谁人不认识你呢！",
        notes: "曛：昏暗。纷纷：纷乱飘落的样子。莫愁：不要发愁。知己：知心朋友。"
    },
    {
        id: 14,
        title: "凉州词",
        author: "王之涣",
        dynasty: "唐",
        content: "黄河远上白云间，\n一片孤城万仞山。\n羌笛何须怨杨柳，\n春风不度玉门关。",
        pinyin: "huáng hé yuǎn shàng bái yún jiān,\nyī piàn gū chéng wàn rèn shān.\nqiāng dí hé xū yuàn yáng liǔ,\nchūn fēng bù dù yù mén guān.",
        explanation: "黄河好像从白云间奔流而来，一座孤城矗立在万仞高山之中。何必用羌笛吹奏哀怨的《折杨柳》曲呢，春风本来就不会吹过玉门关。",
        notes: "仞：古代长度单位。羌笛：羌族的笛子。度：吹到。玉门关：古代边关。"
    },
    {
        id: 15,
        title: "出塞",
        author: "王昌龄",
        dynasty: "唐",
        content: "秦时明月汉时关，\n万里长征人未还。\n但使龙城飞将在，\n不教胡马度阴山。",
        pinyin: "qín shí míng yuè hàn shí guān,\nwàn lǐ cháng zhēng rén wèi huán.\ndàn shǐ lóng chéng fēi jiàng zài,\nbù jiào hú mǎ dù yīn shān.",
        explanation: "依旧是秦汉时的明月和边关，征战万里的将士至今没有回来。只要有像李广那样的飞将军镇守边关，就不会让敌人的骑兵越过阴山。",
        notes: "但使：只要。龙城飞将：指汉代名将李广。胡马：敌人的骑兵。阴山：北方的山脉。"
    },
    {
        id: 16,
        title: "芙蓉楼送辛渐",
        author: "王昌龄",
        dynasty: "唐",
        content: "寒雨连江夜入吴，\n平明送客楚山孤。\n洛阳亲友如相问，\n一片冰心在玉壶。",
        pinyin: "hán yǔ lián jiāng yè rù wú,\npíng míng sòng kè chǔ shān gū.\nluò yáng qīn yǒu rú xiāng wèn,\nyī piàn bīng xīn zài yù hú.",
        explanation: "寒冷的夜雨伴着江水，夜晚进入吴地。黎明时分送别友人，远山显得格外孤独。如果洛阳的亲友问起我，就说我的心如同玉壶里的冰一样纯洁。",
        notes: "连江：连着江水。平明：黎明。楚山：远处的山。冰心：纯洁的心。"
    },
    {
        id: 17,
        title: "鹿柴",
        author: "王维",
        dynasty: "唐",
        content: "空山不见人，\n但闻人语响。\n返景入深林，\n复照青苔上。",
        pinyin: "kōng shān bù jiàn rén,\ndàn wén rén yǔ xiǎng.\nfǎn jǐng rù shēn lín,\nfù zhào qīng tái shàng.",
        explanation: "空寂的山中看不见人，只听到人说话的声音。夕阳的余辉映入深林，又照在青苔上。",
        notes: "空山：空寂的山林。但闻：只听到。返景：夕阳的余辉。复：又。"
    },
    {
        id: 18,
        title: "送元二使安西",
        author: "王维",
        dynasty: "唐",
        content: "渭城朝雨浥轻尘，\n客舍青青柳色新。\n劝君更尽一杯酒，\n西出阳关无故人。",
        pinyin: "wèi chéng zhāo yǔ yì qīng chén,\nkè shè qīng qīng liǔ sè xīn.\nquàn jūn gèng jìn yī bēi jiǔ,\nxī chū yáng guān wú gù rén.",
        explanation: "渭城早晨的细雨润湿了轻尘，旅馆周围的柳树格外青翠。劝你再喝完这杯酒，向西出了阳关就没有老朋友了。",
        notes: "浥：湿润。客舍：旅馆。更尽：再喝完。阳关：古代边关。"
    },
    {
        id: 19,
        title: "九月九日忆山东兄弟",
        author: "王维",
        dynasty: "唐",
        content: "独在异乡为异客，\n每逢佳节倍思亲。\n遥知兄弟登高处，\n遍插茱萸少一人。",
        pinyin: "dú zài yì xiāng wéi yì kè,\nměi féng jiā jié bèi sī qīn.\nyáo zhī xiōng dì dēng gāo chù,\nbiàn chā zhū yú shǎo yī rén.",
        explanation: "独自一人在他乡作客，每逢节日就加倍思念亲人。遥想兄弟们登高的地方，遍插茱萸时少了我一个人。",
        notes: "异乡：他乡。倍：加倍。登高：重阳节登高。茱萸：一种植物，古人重阳节佩戴。"
    },
    {
        id: 20,
        title: "游子吟",
        author: "孟郊",
        dynasty: "唐",
        content: "慈母手中线，\n游子身上衣。\n临行密密缝，\n意恐迟迟归。\n谁言寸草心，\n报得三春晖。",
        pinyin: "cí mǔ shǒu zhōng xiàn,\nyóu zǐ shēn shàng yī.\nlín xíng mì mì féng,\nyì kǒng chí chí guī.\nshuí yán cùn cǎo xīn,\nbào dé sān chūn huī.",
        explanation: "慈母手中拿着针线，为即将远行的儿子缝制衣服。临行前密密麻麻地缝着，担心儿子迟迟不能回来。谁说像小草那样微弱的孝心，能够报答母亲如同春天阳光般的恩情呢？",
        notes: "游子：离家远行的人。临行：将要出发。意恐：担心。寸草心：小草的心意，比喻儿女的孝心。三春晖：春天的阳光，比喻母爱。"
    }
];