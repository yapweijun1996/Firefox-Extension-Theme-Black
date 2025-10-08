# Firefox 黑色主题扩展

这是一个最简 Firefox 静态主题扩展，将浏览器框架、工具列与侧边栏调整为深色系，方便你作为起点继续客制化。

## 项目结构

- `manifest.json`：定义主题颜色与基本资讯。
- `background.js`：管理预设模板与主题套用逻辑。
- `options.html / options.css / options.js`：提供使用者选择模板与自订颜色的设定页面。
- `AGENTS.md`：开发环境说明（可忽略）。

## 快速体验（临时载入）

1. 打开 Firefox 输入 `about:debugging#/runtime/this-firefox`。
2. 点击 *临时载入附加组件*（Load Temporary Add-on）。
3. 选择仓库中的 `manifest.json`。
4. 点开扩展的 *管理* → *偏好*（Preferences）即可进入自订页面。
5. 立即检查主题是否符合预期；只要浏览器重启就会移除临时扩展。

## 模板与自订色票（推荐）

使用扩展选项页面（`options.html`）即可快速调整：

- 在「主题模板」区块选择 `午夜黑`、`石墨灰`、`极光蓝` 等预设。
- 在「自订颜色」区块利用色票选择器修改框架、工具列、分页强调色、侧边栏、弹出视窗等主要颜色。
- 所有更动会即时储存到扩展的 `storage`，并透过 `browser.theme.update` 套用到当前浏览器视窗。
- 若想回到预设配色，点击「恢复默认模板」即可。

> 选项页面会自动管理所有相关色码，即使只调整部分项目，也会保留其余对比度设定。

## 进阶：手动编辑色码

仍可直接修改 `manifest.json` 的 `theme.colors` 区块，常见键值如下：

```json
"colors": {
  "frame": "#0b0b0d",
  "toolbar": "#141419",
  "toolbar_text": "#f6f7fb",
  "toolbar_field": "#1b1b21",
  "toolbar_field_text": "#f6f7fb",
  "tab_selected": "#1c1c21",
  "tab_background_text": "#f6f7fb",
  "popup": "#141419",
  "popup_text": "#f6f7fb",
  "sidebar": "#101016",
  "sidebar_text": "#f6f7fb"
}
```

> 调整色码时，记得保持文字与背景对比度（建议对比值 ≥ 4.5:1），避免影响可读性。

## Lint、打包与签名

1. 安装 Mozilla 官方工具：`npm install --global web-ext`。
2. 在仓库根目录执行 `web-ext lint`，确认 `manifest.json` 与资源合法。
3. 要发行给他人时，可执行 `web-ext build` 产出 zip，或使用 `web-ext sign` 取得签名后上传到 AMO。

## 测试与无障碍检查

- 以默认、全萤幕、分割视窗等模式浏览，确认对比与焦点状态清楚。
- 调整 Firefox 缩放与系统高 DPI 设置观察是否有锯齿或灰阶跳变。
- 若另外加入自定义图示，请提供浅色 SVG 或 2x/3x 位图。

## 常见问题

- **主题没有生效？** 确认载入正确的 `manifest.json`，并检查 `web-ext lint` 是否通过。
- **发布到 AMO 需要什么？** 准备主题截图、说明文字，并确认没有使用未授权图片或商标。

Enjoy the dark side!
