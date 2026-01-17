// pages/songs/songs.js
const app = getApp()
const storage = require('../../utils/storage')
const audio = require('../../utils/audio')
const category = require('../../utils/category')

Page({
  data: {
    activeTab: 'basic',
    filteredSongs: [],
    showDetail: false,
    currentSong: {},
    favoriteSongs: [],
    playingSong: '',
    audioPlayer: null
  },

  onLoad() {
    this.setData({
      audioPlayer: audio.createPlayer()
    })
    this.loadSongs()
    this.loadFavorites()
  },

  onUnload() {
    if (this.data.audioPlayer) {
      this.data.audioPlayer.destroy()
    }
  },

  loadSongs() {
    const filteredSongs = app.globalData.songs.filter(s => s.type === 'basic')
    this.setData({ filteredSongs })
  },

  loadFavorites() {
    const favoriteSongs = storage.get(storage.STORAGE_KEYS.FAVORITE_SONGS, [])
    this.setData({ favoriteSongs })
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    const filteredSongs = app.globalData.songs.filter(s => s.type === tab)
    this.setData({ activeTab: tab, filteredSongs })
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
    this.setData({ showDetail: false })
  },

  playSong() {
    const songName = this.data.currentSong.name

    if (this.data.playingSong === songName) {
      this.data.audioPlayer.pause()
      this.setData({ playingSong: '' })
      return
    }

    this.data.audioPlayer.stop()
    this.setData({ playingSong: songName })

    wx.showToast({
      title: '正在播放: ' + songName,
      icon: 'none',
      duration: 2000
    })

    audio.speakTTS(songName, { lang: 'en-US' })
  },

  stopSong() {
    if (this.data.audioPlayer) {
      this.data.audioPlayer.stop()
      this.setData({ playingSong: '' })
    }
  },

  toggleFavorite() {
    const currentSong = this.data.currentSong
    const favoriteSongs = storage.toggleSongFavorite(currentSong.name)
    const favorite = !currentSong.favorite

    this.setData({
      favoriteSongs,
      currentSong: {
        ...currentSong,
        favorite
      }
    })

    wx.showToast({
      title: favorite ? '已收藏' : '已取消收藏',
      icon: 'success'
    })
  }
})
