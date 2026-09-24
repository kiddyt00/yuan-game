

## Codely Structured Memories

### User

### Feedback
- [2026-09-25 01:50:51] 快乐小学堂设计反馈（2026-09-25）：用户强调中班5岁儿童还不识字，所有问答交互必须"音频优先"（点按即朗读、靠听音作答，文字仅辅助）；出题要避免相邻重复；答不出时需有高亮+语音的渐进提示；迷宫需同时支持鼠标/手指画线、键盘方向键（安卓TV遥控器）与触屏输入。后续新增玩法时沿用这些原则。

### Project
- [2026-09-25 01:59:22] 快乐小学堂：位于 C:\Users\morefine\.codely\Default 的幼儿启蒙网页游戏合集（8 个游戏：迷宫/古诗/英语/找规律/数感/加减法/对对碰/找动物），浏览器先行预览，最终目标是打包到鸿蒙/安卓 WebView 运行；技术约束：零依赖 vanilla JS（禁用 ES Module、ES2020 语法与箭头函数以兼容旧 WebView）、语音用 speechSynthesis+WebAudio（WebView 可能不支持 speechSynthesis，需 JSBridge 接系统 TTS 的备选方案见 README.md）。回归测试：node test/smoke.js（最小 DOM 桩冒烟测试，改动后必跑）。

### Reference

