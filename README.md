# 🐔 喂鸡百科 (Chickenpedia)

自由的鸡百科全书 — 由 Anjiu Ovieo 创立，以独特的鸡式语言记录万物。

**[jbbfilm.xyz](https://jbbfilm.xyz)** · Cloudflare + GitHub Pages

## 页面

| 页面 | 内容 |
|------|------|
| `index.html` | 首页 — 团队/作品/赞助商/多语言（7语） |
| `anjiu-ovieo.html` | Anjiu Ovieo 人物传记 |
| `Makesade.html` | Makesade 人物传记 |

## 技术栈

- **纯静态** HTML + CSS + JS，无需构建工具
- **字体**: MiSans (本地化, 288 woff2)
- **主题**: 深色/浅色切换，CSS 变量 + localStorage 持久化
- **音乐**: `<audio>` + fadeIn/fadeOut，Opus 编码
- **视频**: 点击弹窗播放，`preload="none"` 按需加载
- **表单**: EmailJS
- **CDN**: Cloudflare (Free) 全站代理
- **公共资源**: `css/common.css` / `js/common.js` 三页共享

## 项目结构

```
rawetrip.github.io/
├── index.html
├── anjiu-ovieo.html
├── Makesade.html
├── css/common.css
├── js/
│   ├── common.js          # 主题/音乐/视频/搜索/悬浮预览
│   └── email.min.js
├── fonts/                 # MiSans woff2
├── images/
│   └── sponsors/          # WebP
├── videos/                # 事件视频 (7个)
├── audio/music_opus.ogg   # 背景音乐
└── sponsors.js
```

## 许可

CC BY-SA
