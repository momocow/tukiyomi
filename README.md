# 月夜海瀏覽器 Tukiyomi Browser
Yet another scalable KanColle Browser.

> 🚧 WIP 🚧 前方施工 🚧

![WIP](./docs/Ketsushoban.gif))

## 特色
- 前端框架採用 [Vue](https://vuejs.org/) + [Typescript](https://www.typescriptlang.org)
- ~~GIF戰鬥紀錄~~ WebM紀錄 (可考慮支援串流)
- 作者是條牛 🐄


## 文件
🚪 [任意門](./docs/README.md)

## 開發者看板
- 在新分支上進行任何修改
- 主線 `master` 為最新、可執行的版本
- 請不要在分支 `deploy` 上直接 commit, 推送到這個分支會觸發建置&部屬
- 勤寫文件 📝

### 專案初始化
- 下載原始碼
```
git clone https://github.com/momocow/tukiyomi.git
```
- 切換到你的分支
> 新分支
```
git checkout -b <branch_name>
```
> 舊分支
```
git checkout <your_branch>
```
- 安裝依賴
```
npm install
```
- 編譯原始碼
```
npm run compile
```
- 執行測試
```
npm test
```
- 執行未封裝之原始碼
```
npm start
```
- 建置並封裝可執行檔及安裝檔
```
npm run build
```

### 任務指令
- `npm run compile`
> 編譯結果`/dist`
- `npm run compile:renderer`
> (暫*1) 編譯 renderer process 檔案
- `npm run compile:main`
> (暫*1) 編譯 main process 檔案
- `npm run dev`
> `watch`模式, 使用`electron-webpack dev`, 將執行具有live reload功能(主程序或渲染程序皆支援)之electron應用｡
- `npm run build`
> 建置結果`/dist`, 建置安裝檔及自動更新用之文件｡
- `npm run release`
> `compile` + `build`
- `npm start`
> 請先確認`/compiled`是否存在, 不存在則須先跑`compile`任務｡

*1: 編譯結果尚須優化 [#1](https://github.com/momocow/tukiyomi/issues/1)

## 歡迎 PR 🙏

## Slack交流頻道
[Tukiyomi@Slack](https://tuki-yomi.slack.com/messages/CCBG49A07)

## 歡迎餵食 ☕
請勿拍打 🤜 無限期掙飯中 🍙

<a href="https://www.buymeacoffee.com/momocow" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/yellow_img.png" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;" ></a>