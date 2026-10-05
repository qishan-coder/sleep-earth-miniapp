# 助眠地球小程序

这是一个基于 uni-app 的微信小程序项目，包含：
- 全屏太空背景
- 中心旋转地球场景
- 右下角浮动助眠控制面板
- 白噪音播放与定时关闭
- 适配 HBuilder/HBuilderX 直接导入

## 目录结构

```bash
.
├── App.vue
├── main.js
├── manifest.json
├── pages.json
├── pages/
│   └── index/
│       └── index.vue
├── static/
│   ├── audio/
│   │   └── .gitkeep
│   └── js/
│       └── threejs-miniprogram.js
├── README.md
└── uni.scss
```

## 运行方式

1. 使用 HBuilderX 打开当前项目
2. 选择微信小程序项目
3. 配置微信小程序 AppID（可留空用于本地预览）
4. 执行运行 / 预览

## 必须补充的资源

建议在 `static/audio/` 中放置以下文件：

- `night-rain.mp3`
- `sea-wave.mp3`
- `forest.mp3`
- `white-noise.mp3`

本项目已经预先定义了这些路径，添加文件后即可播放。

## 说明

当前工程使用了轻量�� `threejs-miniprogram.js` 适配层，适用于微信小程序环境，便于在 HBuilder 中直接开发和调试。若后续需要更真实的 WebGL 3D 效果，可替换为正式的 `threejs-miniprogram.js` 库，并保持同样的接口和调用方式。
