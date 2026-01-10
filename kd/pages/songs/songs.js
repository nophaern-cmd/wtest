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
    }
  },

  onLoad() {
    this.loadSongs()
    this.loadFavorites()
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
  }
})
