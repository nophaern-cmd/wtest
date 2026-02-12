const { sanzijingData } = require('../../utils/studyData.js');
const { poemsData } = require('../../utils/poems.js');

Page({
  data: {
    category: 'sanzijing',
    currentLesson: 0,
    totalLessons: sanzijingData.length,
    lesson: sanzijingData[0],
    lessonGroups: [],
    showNotes: true,
    showSettings: false,
    catalogList: sanzijingData,
    isPlaying: false,
    touchStartX: 0,
    touchStartY: 0
  },

  onLoad: function(options) {
    const category = options.category || 'sanzijing';
    const currentLesson = parseInt(options.index) || 0;
    const data = category === 'sanzijing' ? sanzijingData : poemsData;
    
    this.setData({
      category: category,
      currentLesson: currentLesson,
      totalLessons: data.length,
      lesson: data[currentLesson],
      catalogList: data
    }, () => {
      this.groupContent();
    });
  },

  onReady: function() {
    this.groupContent();
  },

  switchCategory: function(e) {
    const category = e.currentTarget.dataset.category;
    let data = category === 'sanzijing' ? sanzijingData : poemsData;

    this.setData({
      category: category,
      currentLesson: 0,
      totalLessons: data.length,
      lesson: data[0],
      catalogList: data
    }, () => {
      this.groupContent();
    });
  },

  selectLesson: function(e) {
    const index = e.currentTarget.dataset.index;
    const data = this.data.category === 'sanzijing' ? sanzijingData : poemsData;
    
    this.setData({
      currentLesson: index,
      lesson: data[index],
      showSettings: false
    }, () => {
      this.groupContent();
    });
  },

  groupContent: function() {
    const content = this.data.lesson.content;
    const groups = [];
    for (let i = 0; i < content.length; i += 2) {
      groups.push(content.slice(i, i + 2));
    }
    this.setData({
      lessonGroups: groups
    });
  },

  toggleNotes: function() {
    this.setData({
      showNotes: !this.data.showNotes
    });
  },

  toggleSettings: function() {
    this.setData({
      showSettings: !this.data.showSettings
    });
  },

  playContent: function() {
    if (this.data.isPlaying) {
      // 停止播放
      this.stopAudio();
      return;
    }

    // 组合要播报的文本段落
    const lesson = this.data.lesson;
    let textParts = [];
    
    // 标题
    textParts.push(lesson.title);
    // 作者
    if (lesson.author) {
      textParts.push(lesson.author);
    }
    // 内容
    lesson.content.forEach(item => {
      textParts.push(item.text);
    });

    this.audioQueue = textParts;
    this.currentAudioIndex = 0;
    this.setData({ isPlaying: true });
    this.playNextSegment();
  },

  playNextSegment: function() {
    if (this.currentAudioIndex >= this.audioQueue.length) {
      this.setData({ isPlaying: false });
      wx.showToast({ title: '播放完成', icon: 'none' });
      return;
    }

    const text = this.audioQueue[this.currentAudioIndex];
    const that = this;
    
    console.log('准备播放:', text);
    
    // 使用下载方式获取音频
    const url = `https://tts.baidu.com/text2audio?cuid=baike&lan=ZH&ctp=1&pdt=301&vol=9&rate=32&per=0&tex=${encodeURIComponent(text)}`;
    
    wx.downloadFile({
      url: url,
      success: function(res) {
        if (res.statusCode === 200) {
          console.log('下载成功:', res.tempFilePath);
          that.playAudioFile(res.tempFilePath);
        } else {
          console.error('下载失败:', res.statusCode);
          that.skipToNext();
        }
      },
      fail: function(err) {
        console.error('下载出错:', err);
        that.skipToNext();
      }
    });
  },

  playAudioFile: function(filePath) {
    const that = this;
    
    if (this.innerAudioContext) {
      this.innerAudioContext.destroy();
      this.innerAudioContext = null;
    }

    this.innerAudioContext = wx.createInnerAudioContext();
    
    this.innerAudioContext.onPlay(() => {
      console.log('正在播放');
    });

    this.innerAudioContext.onEnded(() => {
      console.log('播放结束');
      that.currentAudioIndex++;
      setTimeout(() => {
        if (that.data.isPlaying) {
          that.playNextSegment();
        }
      }, 300);
    });

    this.innerAudioContext.onError((err) => {
      console.error('播放错误:', err);
      that.skipToNext();
    });

    this.innerAudioContext.src = filePath;
    this.innerAudioContext.play();
  },

  skipToNext: function() {
    this.currentAudioIndex++;
    if (this.currentAudioIndex < this.audioQueue.length && this.data.isPlaying) {
      setTimeout(() => this.playNextSegment(), 200);
    } else {
      this.setData({ isPlaying: false });
      wx.showToast({ title: '播放结束', icon: 'none' });
    }
  },

  stopAudio: function() {
    if (this.innerAudioContext) {
      this.innerAudioContext.stop();
      this.innerAudioContext.destroy();
      this.innerAudioContext = null;
    }
    this.audioQueue = [];
    this.currentAudioIndex = 0;
    this.setData({ isPlaying: false });
  },

  prevLesson: function() {
    if (this.data.currentLesson > 0) {
      const newIndex = this.data.currentLesson - 1;
      const data = this.data.category === 'sanzijing' ? sanzijingData : poemsData;
      this.setData({
        currentLesson: newIndex,
        lesson: data[newIndex]
      }, () => {
        this.groupContent();
      });
    }
  },

  nextLesson: function() {
    const data = this.data.category === 'sanzijing' ? sanzijingData : poemsData;
    if (this.data.currentLesson < this.data.totalLessons - 1) {
      const newIndex = this.data.currentLesson + 1;
      this.setData({
        currentLesson: newIndex,
        lesson: data[newIndex]
      }, () => {
        this.groupContent();
      });
    }
  },

  // 触摸开始
  touchStart: function(e) {
    this.setData({
      touchStartX: e.touches[0].clientX,
      touchStartY: e.touches[0].clientY
    });
  },

  // 触摸结束
  touchEnd: function(e) {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - this.data.touchStartX;
    const deltaY = touchEndY - this.data.touchStartY;

    // 确保是水平滑动（水平位移大于垂直位移）
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        // 右滑 -> 上一篇
        this.prevLesson();
      } else {
        // 左滑 -> 下一篇
        this.nextLesson();
      }
    }
  }
});