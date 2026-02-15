Page({
  data: {
    currentTurn: 'red',
    gameStatus: '游戏进行中',
    selectedPiece: null,
    moveHistory: [],
    gameEnded: false
  },

  config: {
    cellSize: 40,
    padding: 20,
    scaleFactor: 1
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
  canvas: null,
  ctx: null,
  canvasRect: null,

  onLoad() {
    this.initGame()
  },

  onReady() {
    this.initCanvas()
  },

  onShow() {
    if (this.canvas && this.ctx) {
      this.drawBoard()
    }
  },

  initCanvas() {
    const query = wx.createSelectorQuery()
    query.select('#chessBoard')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) {
          console.log('Canvas element not found')
          return
        }

        const canvas = res[0].node
        const ctx = canvas.getContext('2d')

        const dpr = wx.getSystemInfoSync().pixelRatio
        const baseWidth = 360
        const baseHeight = 400

        canvas.width = baseWidth * dpr
        canvas.height = baseHeight * dpr
        ctx.scale(dpr, dpr)

        this.canvas = canvas
        this.ctx = ctx

        const query2 = wx.createSelectorQuery()
        query2.select('#chessBoard').boundingClientRect()
        query2.exec((rectRes) => {
          if (rectRes[0]) {
            this.canvasRect = rectRes[0]
            console.log('Canvas initialized:', rectRes[0])
            this.drawBoard()
          }
        })
      })
  },

  initGame() {
    this.board = this.initialBoard.map(row => [...row])
    this.setData({
      currentTurn: 'red',
      gameStatus: '游戏进行中',
      selectedPiece: null,
      moveHistory: [],
      gameEnded: false
    })
  },

  drawBoard() {
    if (!this.ctx) {
      console.log('Canvas context not ready')
      return
    }

    const { cellSize, padding } = this.config
    const ctx = this.ctx
    const width = padding * 2 + cellSize * 8
    const height = padding * 2 + cellSize * 9

    ctx.clearRect(0, 0, width, height)

    ctx.fillStyle = '#DEB887'
    ctx.fillRect(0, 0, width, height)

    ctx.strokeStyle = '#8B4513'
    ctx.lineWidth = 1.5

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

    ctx.font = '20px sans-serif'
    ctx.fillStyle = '#8B4513'
    ctx.fillText('楚 河', padding + 1 * cellSize, padding + 4.6 * cellSize)
    ctx.fillText('汉 界', padding + 5.5 * cellSize, padding + 4.6 * cellSize)

    this.drawPieces()
  },

  drawPieces() {
    const { cellSize, padding } = this.config
    const ctx = this.ctx

    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 9; col++) {
        const pieceKey = this.board[row][col]
        if (pieceKey) {
          const piece = this.pieceTypes[pieceKey]
          const x = padding + col * cellSize
          const y = padding + row * cellSize

          ctx.beginPath()
          ctx.arc(x, y, cellSize * 0.42, 0, 2 * Math.PI)
          ctx.fillStyle = '#FFF8DC'
          ctx.fill()

          ctx.strokeStyle = piece.color === 'red' ? '#C0392B' : '#2C3E50'
          ctx.lineWidth = 2
          ctx.stroke()

          if (this.data.selectedPiece &&
              this.data.selectedPiece.row === row &&
              this.data.selectedPiece.col === col) {
            ctx.beginPath()
            ctx.arc(x, y, cellSize * 0.48, 0, 2 * Math.PI)
            ctx.strokeStyle = '#00FF00'
            ctx.lineWidth = 3
            ctx.stroke()
          }

          ctx.font = '24px sans-serif'
          ctx.fillStyle = piece.color === 'red' ? '#C0392B' : '#2C3E50'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'

          ctx.save()
          ctx.translate(x, y)
          if (piece.color === 'red') {
            ctx.rotate(0)
          } else {
            ctx.rotate(Math.PI)
          }
          ctx.fillText(piece.name, 0, 0)
          ctx.restore()
        }
      }
    }
  },

  onCanvasTap(e) {
    if (this.data.gameEnded) return
    if (!this.canvasRect) {
      console.log('Canvas rect not available')
      return
    }

    const x = e.detail.x
    const y = e.detail.y

    const { cellSize, padding } = this.config
    const width = padding * 2 + cellSize * 8
    const height = padding * 2 + cellSize * 9

    const canvasX = x - this.canvasRect.left
    const canvasY = y - this.canvasRect.top

    const scaleX = width / this.canvasRect.width
    const scaleY = height / this.canvasRect.height

    const col = Math.round((canvasX * scaleX - padding) / cellSize)
    const row = Math.round((canvasY * scaleY - padding) / cellSize)

    if (row < 0 || row >= 10 || col < 0 || col >= 9) {
      return
    }

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
        this.movePiece(fromRow, fromCol, row, col)
        this.setData({ selectedPiece: null })
      } else if (piece && piece.color === this.data.currentTurn) {
        this.setData({ selectedPiece: { row, col } })
      } else {
        this.setData({ selectedPiece: null })
      }
    } else {
      if (piece && piece.color === this.data.currentTurn) {
        this.setData({ selectedPiece: { row, col } })
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

    if (targetPiece && targetPiece.color === piece.color) {
      return false
    }

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
      const minCol = Math.min(fromCol, toCol)
      const maxCol = Math.max(fromCol, toCol)
      for (let col = minCol + 1; col < maxCol; col++) {
        if (this.board[fromRow][col]) return false
      }
    } else {
      const minRow = Math.min(fromRow, toRow)
      const maxRow = Math.max(fromRow, toRow)
      for (let row = minRow + 1; row < maxRow; row++) {
        if (this.board[row][fromCol]) return false
      }
    }
    return true
  },

  validateMa(fromRow, fromCol, toRow, toCol) {
    const rowDiff = Math.abs(toRow - fromRow)
    const colDiff = Math.abs(toCol - fromCol)
    if (!((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2))) {
      return false
    }
    if (rowDiff === 2) {
      const blockRow = fromRow + (toRow > fromRow ? 1 : -1)
      if (this.board[blockRow][fromCol]) return false
    } else {
      const blockCol = fromCol + (toCol > fromCol ? 1 : -1)
      if (this.board[fromRow][blockCol]) return false
    }
    return true
  },

  validateXiang(fromRow, fromCol, toRow, toCol, color) {
    const rowDiff = Math.abs(toRow - fromRow)
    const colDiff = Math.abs(toCol - fromCol)
    if (rowDiff !== 2 || colDiff !== 2) return false
    if (color === 'red') {
      if (toRow < 5) return false
    } else {
      if (toRow > 4) return false
    }
    const blockRow = (fromRow + toRow) / 2
    const blockCol = (fromCol + toCol) / 2
    if (this.board[blockRow][blockCol]) return false
    return true
  },

  validateShi(fromRow, fromCol, toRow, toCol, color) {
    const rowDiff = Math.abs(toRow - fromRow)
    const colDiff = Math.abs(toCol - fromCol)
    if (rowDiff !== 1 || colDiff !== 1) return false
    if (toCol < 3 || toCol > 5) return false
    if (color === 'red') {
      if (toRow < 7 || toRow > 9) return false
    } else {
      if (toRow < 0 || toRow > 2) return false
    }
    return true
  },

  validateJiang(fromRow, fromCol, toRow, toCol, color) {
    const rowDiff = Math.abs(toRow - fromRow)
    const colDiff = Math.abs(toCol - fromCol)
    if (rowDiff + colDiff === 1) {
      if (toCol < 3 || toCol > 5) return false
      if (color === 'red') {
        if (toRow < 7 || toRow > 9) return false
      } else {
        if (toRow < 0 || toRow > 2) return false
      }
      return true
    }
    if (fromCol === toCol) {
      const enemyKing = color === 'red' ? 'b_jiang' : 'r_shuai'
      const enemyKingRow = this.findPiece(enemyKing)
      if (enemyKingRow && enemyKingRow.col === toCol) {
        const minRow = Math.min(fromRow, enemyKingRow.row)
        const maxRow = Math.max(fromRow, enemyKingRow.row)
        let hasBlocker = false
        for (let row = minRow + 1; row < maxRow; row++) {
          if (this.board[row][fromCol]) {
            hasBlocker = true
            break
          }
        }
        if (!hasBlocker) {
          return true
        }
      }
    }
    return false
  },

  validatePao(fromRow, fromCol, toRow, toCol) {
    if (fromRow !== toRow && fromCol !== toCol) return false
    let jumpCount = 0
    if (fromRow === toRow) {
      const minCol = Math.min(fromCol, toCol)
      const maxCol = Math.max(fromCol, toCol)
      for (let col = minCol + 1; col < maxCol; col++) {
        if (this.board[fromRow][col]) jumpCount++
      }
    } else {
      const minRow = Math.min(fromRow, toRow)
      const maxRow = Math.max(fromRow, toRow)
      for (let row = minRow + 1; row < maxRow; row++) {
        if (this.board[row][fromCol]) jumpCount++
      }
    }
    const targetKey = this.board[toRow][toCol]
    if (targetKey) {
      return jumpCount === 1
    } else {
      return jumpCount === 0
    }
  },

  validateZu(fromRow, fromCol, toRow, toCol, color) {
    const rowDiff = toRow - fromRow
    const colDiff = Math.abs(toCol - fromCol)
    if (color === 'red') {
      if (fromRow >= 5) {
        if (colDiff !== 0 || rowDiff !== -1) return false
      } else {
        if (Math.abs(rowDiff) + colDiff !== 1) return false
        if (rowDiff > 0) return false
      }
    } else {
      if (fromRow <= 4) {
        if (colDiff !== 0 || rowDiff !== 1) return false
      } else {
        if (Math.abs(rowDiff) + colDiff !== 1) return false
        if (rowDiff < 0) return false
      }
    }
    return true
  },

  findPiece(pieceKey) {
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.board[row][col] === pieceKey) {
          return { row, col }
        }
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
      this.setData({
        gameStatus: '黑方获胜！',
        gameEnded: true
      })
      return
    } else if (targetKey === 'b_jiang') {
      this.setData({
        gameStatus: '红方获胜！',
        gameEnded: true
      })
      return
    }

    const nextTurn = this.data.currentTurn === 'red' ? 'black' : 'red'
    this.setData({ currentTurn: nextTurn })

    if (this.isCheck(nextTurn)) {
      this.setData({ gameStatus: '将军！' })
    } else {
      this.setData({ gameStatus: '游戏进行中' })
    }
  },

  isCheck(color) {
    const kingKey = color === 'red' ? 'r_shuai' : 'b_jiang'
    const kingPos = this.findPiece(kingKey)
    if (!kingPos) return false

    const enemyColor = color === 'red' ? 'black' : 'red'

    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 9; col++) {
        const pieceKey = this.board[row][col]
        if (pieceKey) {
          const piece = this.pieceTypes[pieceKey]
          if (piece.color === enemyColor) {
            if (this.isValidMove(row, col, kingPos.row, kingPos.col)) {
              return true
            }
          }
        }
      }
    }
    return false
  },

  restartGame() {
    wx.showModal({
      title: '提示',
      content: '确定要重新开始游戏吗？',
      success: (res) => {
        if (res.confirm) {
          this.initGame()
          this.drawBoard()
        }
      }
    })
  },

  undoMove() {
    if (this.data.moveHistory.length === 0) {
      wx.showToast({
        title: '没有可以悔的棋',
        icon: 'none'
      })
      return
    }

    wx.showModal({
      title: '悔棋',
      content: '确定要悔棋吗？',
      success: (res) => {
        if (res.confirm) {
          const lastMove = this.data.moveHistory.pop()

          this.board[lastMove.from.row][lastMove.from.col] = lastMove.piece
          this.board[lastMove.to.row][lastMove.to.col] = lastMove.captured

          const prevTurn = this.data.currentTurn === 'red' ? 'black' : 'red'
          this.setData({
            currentTurn: prevTurn,
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
      content: '红方先行，双方轮流走棋。将/帅被吃掉则游戏结束。车马炮相象士兵卒各走法不同，点击棋子可移动。',
      showCancel: false
    })
  }
})
