// pages/songs/songs.js
const app = getApp()

Page({
  data: {
    activeTab: 'basic',
    filteredSongs: [],
    showDetail: false,
    currentSong: {},
    favoriteSongs: [],
    songTypes: {
      basic: '基础互动类',
      festival: '节日主题类',
      mc: 'MC音乐'
    },
    playingSong: '',
    audioContext: null
  },

  onLoad() {
    this.loadSongs()
    this.loadFavorites()
    this.initAudio()
  },

  onUnload() {
    // 页面卸载时销毁音频上下文
    if (this.data.audioContext) {
      this.data.audioContext.destroy()
    }
  },

  initAudio() {
    // 创建音频上下文
    const audioContext = wx.createInnerAudioContext()
    audioContext.src = ''
    this.setData({
      audioContext
    })
  },

  loadSongs() {
    const songs = app.globalData.songs
    this.setData({
      filteredSongs: songs.filter(s => s.type === 'basic')
    })
  },

  loadFavorites() {
    const favoriteSongs = wx.getStorageSync('favoriteSongs') || []
    this.setData({
      favoriteSongs
    })
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    const songs = app.globalData.songs
    const filteredSongs = songs.filter(s => s.type === tab)

    this.setData({
      activeTab: tab,
      filteredSongs
    })
  },

  showSongDetail(e) {
    const song = e.currentTarget.dataset.song
    this.setData({
      currentSong: {
        ...song,
        favorite: this.data.favoriteSongs.includes(song.name)
      },
      showDetail: true
    })
  },

  hideSongDetail() {
    this.setData({
      showDetail: false
    })
  },

  playSong() {
    const songName = this.data.currentSong.name
    const audioContext = this.data.audioContext

    if (!audioContext) {
      wx.showToast({
        title: '音频播放器初始化失败',
        icon: 'none'
      })
      return
    }

    // 如果正在播放且是同一首歌，则暂停
    if (this.data.playingSong === songName) {
      audioContext.pause()
      this.setData({
        playingSong: ''
      })
      wx.showToast({
        title: '已暂停',
        icon: 'none'
      })
      return
    }

    // 停止当前播放
    audioContext.stop()

    // 设置音频源（这里需要实际的音频文件，暂时使用TTS模拟）
    // 如果有实际音频文件，可以这样设置：
    // audioContext.src = '/assets/songs/' + this.encodeSongName(songName) + '.mp3'

    // 使用TTS播放歌曲名称作为演示
    wx.showToast({
      title: '正在播放: ' + songName,
      icon: 'none',
      duration: 2000
    })

    // 如果有TTS功能，使用TTS播放
    if (typeof wx.createTtsContext === 'function') {
      const tts = wx.createTtsContext()
      tts.speak({
        text: songName,
        lang: 'en-US',
        success: () => {
          console.log('TTS播放成功')
        },
        fail: (err) => {
          console.log('TTS播放失败:', err)
        }
      })
    }

    this.setData({
      playingSong: songName
    })
  },

  stopSong() {
    const audioContext = this.data.audioContext
    if (audioContext) {
      audioContext.stop()
      this.setData({
        playingSong: ''
      })
    }
  },

  toggleFavorite() {
    const currentSong = this.data.currentSong
    let favoriteSongs = this.data.favoriteSongs

    if (currentSong.favorite) {
      favoriteSongs = favoriteSongs.filter(s => s !== currentSong.name)
    } else {
      favoriteSongs.push(currentSong.name)
    }

    wx.setStorageSync('favoriteSongs', favoriteSongs)

    this.setData({
      favoriteSongs,
      currentSong: {
        ...currentSong,
        favorite: !currentSong.favorite
      }
    })

    wx.showToast({
      title: currentSong.favorite ? '已取消收藏' : '已收藏',
      icon: 'success'
    })
  },

  // 编码歌曲名称用于文件名
  encodeSongName(name) {
    return name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')
  }
})
