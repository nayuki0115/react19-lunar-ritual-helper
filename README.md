# React 19 - Lunar Ritual Helper｜疏文填寫助手
![image](https://img.shields.io/badge/node-v22.13.1-green.svg)
![image](https://img.shields.io/badge/react-v19-blue.svg)
![image](https://img.shields.io/badge/typescript-blue.svg)
![image](https://img.shields.io/badge/vite-purple.svg)
![image](https://img.shields.io/badge/tailwindcss-38B2AC.svg)
![image](https://img.shields.io/badge/pnpm-985F2A.svg)

使用 **React 19 + TypeScript + Vite + TailwindCSS** 工具型 Web App，協助使用者快速整理疏文/祭拜常見需要填寫的資訊，例如：
- 今日歲次（天運）
- 今日農曆日期（23:00 日界線）
- 農曆年（干支 + 民國年）
- 農曆生日
- 生肖
- 生辰（時辰）
- 虛歲
- 手印提醒（男左女右）

## 功能說明

此工具目標是讓使用者輸入基本資料後，即可自動換算並產生疏文常見欄位，避免手動查表與錯誤填寫

1. **輸入表單**
   - 性別：男 / 女（radio）
   - 國曆生日：date input
   - 出生時間（選填）：
     - 知道時辰（下拉選單：子、丑、寅...）
     - 知道幾點幾分（time input）
     - 不知道（顯示吉時）

2. **歲次、天運（今天農曆）**
   - 自動取得今天的農曆日期與干支年（歲次）
   - **23:00 視為農曆換日界線（Asia/Taipei）**

3. **生辰、命宮、本命（農曆生日資訊）**
   - 自動換算出：
     - 農曆年（干支年 + 民國年）
     - 農曆生日（月/日）
     - 生辰（時辰）
     - 生肖

4. **歲數（虛歲）**
   - 自動換算虛歲（含「過年前出生虛歲 +2」規則）

5. **手印提醒**
   - 根據性別顯示「男左女右」

6. **URL 可還原結果**
   - Submit 後會將表單內容寫入 query string
   - Back/Forward 可回復狀態與結果

7. **Loading Overlay**
   - Submit 後顯示全頁 loading
   - 手機版會自動 scroll 到結果區


## 使用的換算規則

- **農曆換日界線：23:00**
  - 23:00 後視為隔天（符合傳統農曆換日習慣）
- **子時細分**
  - 夜子時：23:00–00:00
  - 早子時：00:00–01:00
- **虛歲**
  - 基本算法：今年 - 出生年 + 1
  - 若出生日期在農曆新年前，虛歲需再 +1（總共 +2）


## UI / Pages 說明

### Home (Page)
- 表單輸入（性別、生日、出生時間）
- Submit 後更新 URL query string 並產生結果
- Reset 可清除 URL 與表單


## 技術需求

### 必需技術
- React 19（Function Component + Hooks）
- TypeScript
- Vite
- TailwindCSS
- React Router（URL query params）
- lunar-javascript（農曆換算）

## 安裝和運行說明
![image](https://img.shields.io/badge/node-v22.13.1-green.svg) ![image](https://img.shields.io/badge/pnpm-985F2A.svg)

```bash
git clone <repository-url>
cd <project-name>
pnpm install
pnpm run dev
```


## 專案結構

```tree
sreact19-lunar-ritual-helper/
├─ src/
│  ├─ pages/
│  │   └─ Home.tsx
│  ├─ utils/
│  │   ├─ lunar.ts    
│  │   └─ zh.ts    
│  ├─ assets/
│  │   └─ styles/
│  │      └─ tokens.css
│  ├─ App.tsx
│  ├─ main.tsx
│  └─ index.css
├─ public/
├─ package.json
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts
```