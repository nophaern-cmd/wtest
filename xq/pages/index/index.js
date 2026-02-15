Page({
  data: {
    currentTurn: 'red',
    gameStatus: '游戏进行中',
    selectedPiece: null,
    moveHistory: [],
    gameEnded: false,
    soundEnabled: true,
    boardWidth: 360,
    boardHeight: 400,
    redTime: 0,
    blackTime: 0,
    redTimeStr: '00:00',
    blackTimeStr: '00:00'
  },

  pieceTypes: {
    'r_ju': { name: '车', color: 'red', type: 'ju' },
    'r_ma': { name: '马', color: 'red', type: 'ma' },
    'r_xiang': { name: '相', color: 'red', type: 'xiang' },
    'r_shi': { name: '仕', color: 'red', type: 'shi' },
    'r_shuai': { name: '帅', color: 'red', type: 'jiang' },
    'r_pao': { name: '炮', color: 'red', type: 'pao' },
    'r_bing': { name: '兵', color: 'red', type: 'zu' },
    'b_ju': { name: '车', color: 'black', type: 'ju' },
    'b_ma': { name: '马', color: 'black', type: 'ma' },
    'b_xiang': { name: '象', color: 'black', type: 'xiang' },
    'b_shi': { name: '士', color: 'black', type: 'shi' },
    'b_jiang': { name: '将', color: 'black', type: 'jiang' },
    'b_pao': { name: '炮', color: 'black', type: 'pao' },
    'b_zu': { name: '卒', color: 'black', type: 'zu' }
  },

  initialBoard: [
    ['b_ju', 'b_ma', 'b_xiang', 'b_shi', 'b_jiang', 'b_shi', 'b_xiang', 'b_ma', 'b_ju'],
    [null, null, null, null, null, null, null, null, null],
    [null, 'b_pao', null, null, null, null, null, 'b_pao', null],
    ['b_zu', null, 'b_zu', null, 'b_zu', null, 'b_zu', null, 'b_zu'],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    ['r_bing', null, 'r_bing', null, 'r_bing', null, 'r_bing', null, 'r_bing'],
    [null, 'r_pao', null, null, null, null, null, 'r_pao', null],
    [null, null, null, null, null, null, null, null, null],
    ['r_ju', 'r_ma', 'r_xiang', 'r_shi', 'r_shuai', 'r_shi', 'r_xiang', 'r_ma', 'r_ju']
  ],

  board: [],
  canvasNode: null,
  ctx: null,
  lastTapTime: 0,
  canvasRect: null,
  cellSize: 40,
  padding: 20,
  timer: null,

  onLoad() {
    this.initGame()
    this.loadSoundSetting()
    this.startTimer()
  },

  onReady() {
    this.initCanvas()
  },

  onShow() {
    if (this.ctx) {
      this.drawBoard()
    }
  },

  onUnload() {
    this.stopTimer()
  },

  loadSoundSetting() {
    try {
      const sound = wx.getStorageSync('chessSoundEnabled')
      if (sound !== '') {
        this.setData({ soundEnabled: sound })
      }
    } catch (e) {}
  },

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  },

  startTimer() {
    this.stopTimer()
    this.timer = setInterval(() => {
      if (this.data.gameEnded) return
      const turn = this.data.currentTurn
      if (turn === 'red') {
        const newTime = this.data.redTime + 1
        this.setData({
          redTime: newTime,
          redTimeStr: this.formatTime(newTime)
        })
      } else {
        const newTime = this.data.blackTime + 1
        this.setData({
          blackTime: newTime,
          blackTimeStr: this.formatTime(newTime)
        })
      }
    }, 1000)
  },

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  },

  initGame() {
    this.board = this.initialBoard.map(row => [...row])
    this.setData({
      currentTurn: 'red',
      gameStatus: '游戏进行中',
      selectedPiece: null,
      moveHistory: [],
      gameEnded: false,
      redTime: 0,
      blackTime: 0,
      redTimeStr: '00:00',
      blackTimeStr: '00:00'
    })
  },

  initCanvas() {
    const sysInfo = wx.getSystemInfoSync()
    const screenWidth = sysInfo.windowWidth
    const screenHeight = sysInfo.windowHeight

    const headerHeight = 80
    const footerHeight = 150
    const availableHeight = screenHeight - headerHeight - footerHeight - 40

    const baseWidth = 360
    const baseHeight = 400

    const scale = Math.min(
      (screenWidth - 40) / baseWidth,
      availableHeight / baseHeight
    )

    const boardWidth = Math.floor(baseWidth * scale / 9) * 9
    const boardHeight = Math.floor(boardWidth * 10 / 9)

    this.setData({
      boardWidth: boardWidth,
      boardHeight: boardHeight
    })

    this.cellSize = boardWidth / 9
    this.padding = this.cellSize / 2

    const query = wx.createSelectorQuery()
    query.select('#chessBoard').fields({ node: true, size: true }).exec((res) => {
      if (!res[0]) return

      const canvas = res[0].node
      const ctx = canvas.getContext('2d')
      const dpr = sysInfo.pixelRatio

      canvas.width = boardWidth * dpr
      canvas.height = boardHeight * dpr
      ctx.scale(dpr, dpr)

      this.canvasNode = canvas
      this.ctx = ctx

      // Delay getting rect to ensure canvas is rendered
      setTimeout(() => {
        const rectQuery = wx.createSelectorQuery()
        rectQuery.select('#chessBoard').boundingClientRect().exec((rectRes) => {
          if (rectRes[0]) {
            this.canvasRect = rectRes[0]
            this.drawBoard()
          }
        })
      }, 100)
    })
  },

  toggleSound() {
    const newValue = !this.data.soundEnabled
    this.setData({ soundEnabled: newValue })
    wx.setStorageSync('chessSoundEnabled', newValue)
  },

  playSound(type) {
    if (!this.data.soundEnabled) return

    try {
      const audioCtx = wx.createWebAudioContext()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()

      const freqs = {
        move: 800,
        capture: 400,
        check: 600,
        win: [523, 659]
      }

      const freq = Array.isArray(freqs[type]) ? freqs[type][0] : freqs[type]

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime)
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1)

      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start()
      osc.stop(audioCtx.currentTime + 0.1)

      if (type === 'win' && freqs[type][1]) {
        setTimeout(() => {
          const osc2 = audioCtx.createOscillator()
          const gain2 = audioCtx.createGain()
          osc2.type = 'sine'
          osc2.frequency.setValueAtTime(freqs[type][1], audioCtx.currentTime)
          gain2.gain.setValueAtTime(0.2, audioCtx.currentTime)
          gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15)
          osc2.connect(gain2)
          gain2.connect(audioCtx.destination)
          osc2.start()
          osc2.stop(audioCtx.currentTime + 0.15)
        }, 120)
      }

      setTimeout(() => audioCtx.close(), 300)
    } catch (e) {}
  },

  drawBoard() {
    if (!this.ctx) return

    const ctx = this.ctx
    const width = this.data.boardWidth
    const height = this.data.boardHeight
    const cellSize = this.cellSize
    const padding = this.padding

    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#DEB887'
    ctx.fillRect(0, 0, width, height)
    ctx.strokeStyle = '#8B4513'
    ctx.lineWidth = Math.max(1, cellSize / 30)

    for (let i = 0; i < 10; i++) {
      const y = padding + i * cellSize
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    for (let i = 0; i < 9; i++) {
      const x = padding + i * cellSize
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, padding + 4 * cellSize)
      ctx.stroke()
    }

    for (let i = 0; i < 9; i++) {
      const x = padding + i * cellSize
      ctx.beginPath()
      ctx.moveTo(x, padding + 5 * cellSize)
      ctx.lineTo(x, padding + 9 * cellSize)
      ctx.stroke()
    }

    ctx.beginPath()
    ctx.moveTo(padding, padding + 4 * cellSize)
    ctx.lineTo(padding, padding + 5 * cellSize)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(width - padding, padding + 4 * cellSize)
    ctx.lineTo(width - padding, padding + 5 * cellSize)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(padding + 3 * cellSize, padding)
    ctx.lineTo(padding + 5 * cellSize, padding + 2 * cellSize)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(padding + 5 * cellSize, padding)
    ctx.lineTo(padding + 3 * cellSize, padding + 2 * cellSize)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(padding + 3 * cellSize, padding + 7 * cellSize)
    ctx.lineTo(padding + 5 * cellSize, padding + 9 * cellSize)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(padding + 5 * cellSize, padding + 7 * cellSize)
    ctx.lineTo(padding + 3 * cellSize, padding + 9 * cellSize)
    ctx.stroke()

    const fontSize = cellSize * 0.5
    ctx.font = `${fontSize}px sans-serif`
    ctx.fillStyle = '#8B4513'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('楚 河', padding + 1 * cellSize, padding + 4.6 * cellSize)
    ctx.fillText('汉 界', padding + 5.5 * cellSize, padding + 4.6 * cellSize)

    this.drawPieces()
  },

  drawPieces() {
    const ctx = this.ctx
    const cellSize = this.cellSize
    const padding = this.padding

    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 9; col++) {
        const pieceKey = this.board[row][col]
        if (!pieceKey) continue

        const piece = this.pieceTypes[pieceKey]
        const x = padding + col * cellSize
        const y = padding + row * cellSize

        ctx.beginPath()
        ctx.arc(x, y, cellSize * 0.42, 0, 2 * Math.PI)
        ctx.fillStyle = '#FFF8DC'
        ctx.fill()

        ctx.strokeStyle = piece.color === 'red' ? '#C0392B' : '#2C3E50'
        ctx.lineWidth = Math.max(2, cellSize / 15)
        ctx.stroke()

        if (this.data.selectedPiece &&
            this.data.selectedPiece.row === row &&
            this.data.selectedPiece.col === col) {
          ctx.beginPath()
          ctx.arc(x, y, cellSize * 0.48, 0, 2 * Math.PI)
          ctx.strokeStyle = '#00FF00'
          ctx.lineWidth = Math.max(3, cellSize / 12)
          ctx.stroke()
        }

        const fontSize = cellSize * 0.55
        ctx.font = `bold ${fontSize}px sans-serif`
        ctx.fillStyle = piece.color === 'red' ? '#C0392B' : '#2C3E50'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        ctx.save()
        ctx.translate(x, y)
        if (piece.color === 'black') {
          ctx.rotate(Math.PI)
        }
        ctx.fillText(piece.name, 0, 0)
        ctx.restore()
      }
    }
  },

  onTouchStart(e) {
    this.touchStartPos = e.touches[0]
  },

  onTouchEnd(e) {
    const now = Date.now()
    if (now - this.lastTapTime < 150) return
    this.lastTapTime = now

    if (this.data.gameEnded) return

    const touch = e.changedTouches[0]
    const x = touch.clientX
    const y = touch.clientY

    if (!this.canvasRect) {
      setTimeout(() => this.getCanvasRectAndHandleTap(x, y), 50)
      return
    }

    this.getPositionAndHandleTap(x, y)
  },

  getCanvasRectAndHandleTap(x, y) {
    const query = wx.createSelectorQuery()
    query.select('#chessBoard').boundingClientRect().exec((rectRes) => {
      if (rectRes[0]) {
        this.canvasRect = rectRes[0]
        this.getPositionAndHandleTap(x, y)
      }
    })
  },

  getPositionAndHandleTap(x, y) {
    if (!this.canvasRect) return

    const canvasX = x - this.canvasRect.left
    const canvasY = y - this.canvasRect.top

    if (canvasX < 0 || canvasX > this.canvasRect.width || 
        canvasY < 0 || canvasY > this.canvasRect.height) {
      return
    }

    const cellSize = this.cellSize
    const padding = this.padding
    const scaleX = this.data.boardWidth / this.canvasRect.width
    const scaleY = this.data.boardHeight / this.canvasRect.height

    const col = Math.floor((canvasX * scaleX - padding) / cellSize + 0.5)
    const row = Math.floor((canvasY * scaleY - padding) / cellSize + 0.5)

    if (row >= 0 && row < 10 && col >= 0 && col < 9) {
      this.handleTap(row, col)
    }
  },

  handleTap(row, col) {
    const pieceKey = this.board[row][col]
    const piece = pieceKey ? this.pieceTypes[pieceKey] : null

    if (this.data.selectedPiece) {
      const { row: fromRow, col: fromCol } = this.data.selectedPiece

      if (fromRow === row && fromCol === col) {
        this.setData({ selectedPiece: null })
        this.drawBoard()
        return
      }

      if (this.isValidMove(fromRow, fromCol, row, col)) {
        const targetKey = this.board[row][col]
        this.movePiece(fromRow, fromCol, row, col)
        this.setData({ selectedPiece: null })
        this.playSound(targetKey ? 'capture' : 'move')
      } else if (piece && piece.color === this.data.currentTurn) {
        this.setData({ selectedPiece: { row, col } })
        this.playSound('move')
      } else {
        this.setData({ selectedPiece: null })
      }
    } else {
      if (piece && piece.color === this.data.currentTurn) {
        this.setData({ selectedPiece: { row, col } })
        this.playSound('move')
      }
    }

    this.drawBoard()
  },

  isValidMove(fromRow, fromCol, toRow, toCol) {
    const pieceKey = this.board[fromRow][fromCol]
    if (!pieceKey) return false

    const piece = this.pieceTypes[pieceKey]
    const targetKey = this.board[toRow][toCol]
    const targetPiece = targetKey ? this.pieceTypes[targetKey] : null

    if (targetPiece && targetPiece.color === piece.color) return false

    switch (piece.type) {
      case 'ju': return this.validateJu(fromRow, fromCol, toRow, toCol)
      case 'ma': return this.validateMa(fromRow, fromCol, toRow, toCol)
      case 'xiang': return this.validateXiang(fromRow, fromCol, toRow, toCol, piece.color)
      case 'shi': return this.validateShi(fromRow, fromCol, toRow, toCol, piece.color)
      case 'jiang': return this.validateJiang(fromRow, fromCol, toRow, toCol, piece.color)
      case 'pao': return this.validatePao(fromRow, fromCol, toRow, toCol)
      case 'zu': return this.validateZu(fromRow, fromCol, toRow, toCol, piece.color)
      default: return false
    }
  },

  validateJu(fromRow, fromCol, toRow, toCol) {
    if (fromRow !== toRow && fromCol !== toCol) return false
    if (fromRow === toRow) {
      for (let c = Math.min(fromCol, toCol) + 1; c < Math.max(fromCol, toCol); c++) {
        if (this.board[fromRow][c]) return false
      }
    } else {
      for (let r = Math.min(fromRow, toRow) + 1; r < Math.max(fromRow, toRow); r++) {
        if (this.board[r][fromCol]) return false
      }
    }
    return true
  },

  validateMa(fromRow, fromCol, toRow, toCol) {
    const rd = Math.abs(toRow - fromRow)
    const cd = Math.abs(toCol - fromCol)
    if (!((rd === 2 && cd === 1) || (rd === 1 && cd === 2))) return false
    if (rd === 2) {
      const br = fromRow + (toRow > fromRow ? 1 : -1)
      if (this.board[br][fromCol]) return false
    } else {
      const bc = fromCol + (toCol > fromCol ? 1 : -1)
      if (this.board[fromRow][bc]) return false
    }
    return true
  },

  validateXiang(fromRow, fromCol, toRow, toCol, color) {
    if (Math.abs(toRow - fromRow) !== 2 || Math.abs(toCol - fromCol) !== 2) return false
    if (color === 'red' && toRow < 5) return false
    if (color === 'black' && toRow > 4) return false
    const br = (fromRow + toRow) / 2
    const bc = (fromCol + toCol) / 2
    if (this.board[br][bc]) return false
    return true
  },

  validateShi(fromRow, fromCol, toRow, toCol, color) {
    if (Math.abs(toRow - fromRow) !== 1 || Math.abs(toCol - fromCol) !== 1) return false
    if (toCol < 3 || toCol > 5) return false
    if (color === 'red' && (toRow < 7 || toRow > 9)) return false
    if (color === 'black' && (toRow < 0 || toRow > 2)) return false
    return true
  },

  validateJiang(fromRow, fromCol, toRow, toCol, color) {
    const rd = Math.abs(toRow - fromRow)
    const cd = Math.abs(toCol - fromCol)
    if (rd + cd === 1) {
      if (toCol < 3 || toCol > 5) return false
      if (color === 'red' && (toRow < 7 || toRow > 9)) return false
      if (color === 'black' && (toRow < 0 || toRow > 2)) return false
      return true
    }
    if (fromCol === toCol) {
      const ek = color === 'red' ? 'b_jiang' : 'r_shuai'
      const ekPos = this.findPiece(ek)
      if (ekPos && ekPos.row === toRow && ekPos.col === toCol) {
        for (let r = Math.min(fromRow, toRow) + 1; r < Math.max(fromRow, toRow); r++) {
          if (this.board[r][fromCol]) return false
        }
        return true
      }
    }
    return false
  },

  validatePao(fromRow, fromCol, toRow, toCol) {
    if (fromRow !== toRow && fromCol !== toCol) return false
    let jumps = 0
    if (fromRow === toRow) {
      for (let c = Math.min(fromCol, toCol) + 1; c < Math.max(fromCol, toCol); c++) {
        if (this.board[fromRow][c]) jumps++
      }
    } else {
      for (let r = Math.min(fromRow, toRow) + 1; r < Math.max(fromRow, toRow); r++) {
        if (this.board[r][fromCol]) jumps++
      }
    }
    const target = this.board[toRow][toCol]
    return target ? jumps === 1 : jumps === 0
  },

  validateZu(fromRow, fromCol, toRow, toCol, color) {
    const rd = toRow - fromRow
    const cd = Math.abs(toCol - fromCol)
    if (color === 'red') {
      if (fromRow >= 5) {
        if (cd !== 0 || rd !== -1) return false
      } else {
        if (Math.abs(rd) + cd !== 1 || rd > 0) return false
      }
    } else {
      if (fromRow <= 4) {
        if (cd !== 0 || rd !== 1) return false
      } else {
        if (Math.abs(rd) + cd !== 1 || rd < 0) return false
      }
    }
    return true
  },

  findPiece(key) {
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        if (this.board[r][c] === key) return { row: r, col: c }
      }
    }
    return null
  },

  movePiece(fromRow, fromCol, toRow, toCol) {
    const pieceKey = this.board[fromRow][fromCol]
    const targetKey = this.board[toRow][toCol]

    this.data.moveHistory.push({
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
      piece: pieceKey,
      captured: targetKey
    })

    this.board[toRow][toCol] = pieceKey
    this.board[fromRow][fromCol] = null

    if (targetKey === 'r_shuai') {
      this.setData({ gameStatus: '黑方获胜！', gameEnded: true })
      this.playSound('win')
      return
    }
    if (targetKey === 'b_jiang') {
      this.setData({ gameStatus: '红方获胜！', gameEnded: true })
      this.playSound('win')
      return
    }

    const nextTurn = this.data.currentTurn === 'red' ? 'black' : 'red'
    this.setData({ currentTurn: nextTurn })

    if (this.isCheck(nextTurn)) {
      this.setData({ gameStatus: '将军！' })
      this.playSound('check')
    } else {
      this.setData({ gameStatus: '游戏进行中' })
    }
  },

  isCheck(color) {
    const key = color === 'red' ? 'r_shuai' : 'b_jiang'
    const pos = this.findPiece(key)
    if (!pos) return false

    const enemy = color === 'red' ? 'black' : 'red'
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const pk = this.board[r][c]
        if (pk && this.pieceTypes[pk].color === enemy) {
          if (this.isValidMove(r, c, pos.row, pos.col)) return true
        }
      }
    }
    return false
  },

  restartGame() {
    wx.showModal({
      title: '提示',
      content: '确定重新开始？',
      success: (res) => {
        if (res.confirm) {
          this.initGame()
          this.startTimer()
          this.drawBoard()
        }
      }
    })
  },

  undoMove() {
    if (this.data.moveHistory.length === 0) {
      wx.showToast({ title: '没有可悔的棋', icon: 'none' })
      return
    }
    wx.showModal({
      title: '悔棋',
      content: '确定悔棋？',
      success: (res) => {
        if (res.confirm) {
          const last = this.data.moveHistory.pop()
          this.board[last.from.row][last.from.col] = last.piece
          this.board[last.to.row][last.to.col] = last.captured
          const prev = this.data.currentTurn === 'red' ? 'black' : 'red'
          this.setData({
            currentTurn: prev,
            selectedPiece: null,
            gameEnded: false,
            gameStatus: '游戏进行中'
          })
          this.drawBoard()
        }
      }
    })
  },

  showRules() {
    wx.showModal({
      title: '象棋规则',
      content: '红方先行，双方轮流走棋。将/帅被吃则游戏结束。',
      showCancel: false
    })
  }
})
