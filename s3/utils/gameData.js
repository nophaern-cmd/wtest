// 游戏数据加载器
const sanzijingData = require('./studyData.js').sanzijingData
const poemsData = require('./poems.js').poemsData

let gameData = {
  sanzijing: [],
  poems: []
}

// 加载数据
function loadData() {
  gameData.sanzijing = sanzijingData
  gameData.poems = poemsData
}

// 获取数据
function getData() {
  return gameData
}

module.exports = {
  loadData,
  getData
}
