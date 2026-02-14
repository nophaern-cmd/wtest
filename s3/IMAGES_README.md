# 图标资源说明

本项目需要以下图标资源，请自行添加到 `images` 文件夹中。

## 所需图标列表

### TabBar 图标
| 图标名称 | 尺寸 | 说明 |
|---------|------|------|
| home.png | 81×81px | 首页默认图标 |
| home-active.png | 81×81px | 首页选中图标 |
| english.png | 81×81px | 英语默认图标 |
| english-active.png | 81×81px | 英语选中图标 |
| guoxue.png | 81×81px | 国学默认图标 |
| guoxue-active.png | 81×81px | 国学选中图标 |

## 图标设计建议

1. **颜色**：
   - 默认图标：灰色 (#999999)
   - 选中图标：主题蓝色 (#4A90E2) 或 棕色 (#8B5A2B)

2. **风格**：
   - 简洁、扁平化设计
   - 图标清晰易识别
   - 与小程序整体风格一致

3. **格式**：
   - PNG 格式（支持透明背景）
   - 建议使用 2x 或 3x 分辨率

## 图标资源推荐

可以从以下网站获取免费图标：
- [阿里巴巴矢量图标库](https://www.iconfont.cn/)
- [Flaticon](https://www.flaticon.com/)
- [Icons8](https://icons8.com/)

## 示例图标描述

- **首页图标**：房屋或房子形状
- **英语图标**：字母 "A" 或书本
- **国学图标**：书卷或毛笔

## 临时解决方案

如果暂时没有图标资源，可以：
1. 先删除 app.json 中 tabBar 的 iconPath 和 selectedIconPath 配置
2. 使用文字 tabBar（仅显示文字，不显示图标）

```json
"tabBar": {
  "list": [
    {
      "pagePath": "pages/index/index",
      "text": "首页"
    },
    {
      "pagePath": "pages/english/english",
      "text": "英语"
    },
    {
      "pagePath": "pages/guoxue/guoxue",
      "text": "国学"
    }
  ]
}
```

这样可以先让小程序运行起来，之后再添加图标。
