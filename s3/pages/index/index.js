Page({
  data: {
    features: [
      {
        id: 'sanzijing',
        title: '三字经',
        desc: '经典启蒙读物，朗朗上口',
        icon: '📖'
      },
      {
        id: 'poems',
        title: '古诗词',
        desc: '唐诗宋词，传承经典',
        icon: '🎋'
      }
    ]
  },

  onLoad: function() {
    
  },

  goToLearn: function(e) {
    const category = e.currentTarget.dataset.category;
    wx.navigateTo({
      url: `/pages/learn/learn?category=${category}`
    });
  },

  goToAllLearn: function() {
    wx.navigateTo({
      url: '/pages/learn/learn'
    });
  }
});
