# Lunar Ritual Helper｜疏文填寫助手

![Node.js](https://img.shields.io/badge/Node.js-24_LTS-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=0B1F2A)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-10.33.0-F69220?logo=pnpm&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)

使用 React 19、TypeScript、Vite 與 Tailwind CSS 開發的純前端工具型 Web App，協助使用者快速整理民間疏文、拜拜與祭祀場合常見的資料，例如天運、歲次、出生農曆、生辰、生肖、虛歲與手印提醒。

> 本專案正依新版產品規格分階段重構。完整領域規則、隱私、分享與驗收標準請參閱 [產品需求規格](docs/product-requirements.md)。README 保留專案介紹、使用方式與規格摘要。

## 使用技術

- **React 19**：Function Components 與 Hooks
- **TypeScript**：型別安全與領域資料建模
- **Vite**：開發伺服器與 production build
- **Tailwind CSS 4**：樣式系統與響應式版面
- **React Router**：頁面路由與分享連結參數
- **lunar-javascript**：國曆、農曆、干支與生肖換算
- **Vitest**：單元測試與既有行為基準測試
- **pnpm**：套件管理
- **Vercel**：Preview 與 Production Deployment

開發環境與持續整合統一使用 Node.js 24 與 pnpm 10.33.0。`package.json`、`.node-version` 與 `.nvmrc` 會限制或提示正確版本。

## 功能說明

此工具的目標是讓使用者輸入基本資料後，自動換算並整理疏文常見欄位，減少手動查表與填寫錯誤。

### 輸入資料

- 性別：男／女，必填
- 出生資料模式：
  - 國曆自動換算
  - 已知農曆直接填寫（新版目標功能）
- 出生時間：
  - 知道時辰
  - 知道幾點幾分
  - 不知道，生辰顯示「吉時」
- 今日換日模式：
  - 民俗 `23:00` 換日，預設
  - 民用 `00:00` 換日

### 疏文資料

| 疏文欄位 | 系統顯示 | 說明 |
| --- | --- | --- |
| 天運 | 今日干支年及農曆月日 | 實際疏文常要求填寫完整今日農曆日期 |
| 歲次 | 今日干支年及農曆月日 | 本義為當年干支年；實際疏文常連同今日農曆月日填寫 |
| 命宮 | 出生干支年、農曆月日與時辰 | 與「生辰」、「本命」填寫相同內容 |
| 生辰 | 出生干支年、農曆月日與時辰 | 未知時辰顯示「吉時」 |
| 本命 | 出生干支年、農曆月日與時辰 | 與「生辰」、「命宮」填寫相同內容 |
| 歲數 | 虛歲 | 依目前農曆年度計算 |
| 手印 | 左手印／右手印 | 男左女右，一般參考 |

### 日期與換算規則摘要

- 時區固定使用 `Asia/Taipei`。
- 「天運」與「歲次」是不同欄位；「歲次」本義為當年干支年，但實際疏文中的兩種欄位常都要求填今年干支年及今天農曆月日。
- 「生辰」、「命宮」與「本命」都填寫出生干支年、農曆月日與時辰；結果合併顯示一次，生肖另列為參考資訊。
- 出生國曆、出生農曆、出生生肖與出生生辰固定使用民用日期，於 `00:00` 換日。
- 天運／歲次填寫內容、流年生肖與目前虛歲依使用者選擇的換日模式判定。
- 虛歲公式：

  ```text
  目前虛歲 = 目前農曆年 - 出生農曆年 + 1
  ```

- 國曆年初但農曆新年前出生者，出生農曆年與生肖仍屬上一年度，因此虛歲相較周歲可能呈現「實歲 +2」。
- 子時細分：
  - 夜子時：`23:00–23:59`
  - 早子時：`00:00–00:59`
  - 丑時：`01:00–02:59`
- 主要結果採傳統疏文格式，例如「正月初一」、「十二月廿一」、「壬申年」、「屬猴」。
- 國曆自動換算遇到閏月時保留「閏」字。

### 保存與分享

本工具採隱私優先設計：

- 一般產生結果不將生日、性別或出生時間寫入 URL。
- 個人資料與 UI 設定皆預設不保存。
- 使用者主動啟用「記住我的資料」或「記住設定」後，才分別寫入不同的 LocalStorage key。
- 只有使用者主動分享並確認隱私提醒後，才建立包含完整資料的分享連結。
- 分享連結支援新版短參數 Schema，並保留舊版連結解析能力。
- 所有換算都在瀏覽器本機完成，不將資料送至後端。

## 畫面相關說明

### 首頁

首頁採單頁工具流程：

1. 選擇出生資料模式。
2. 輸入性別與出生日期。
3. 選擇出生時間模式，畫面只展開必要欄位。
4. 選擇今日換日模式。
5. 選擇「產生疏文資料」。
6. 查看主要疏文欄位；需要核對時可展開詳細資訊。

### 今日資訊

- 天運／歲次填寫內容與流年生肖不需要個人資料，進入頁面後即可顯示。
- `folk` 模式於台北時間 23:00 更新。
- `civil` 模式於台北時間 00:00 更新。
- 頁面跨越換日時間或從背景恢復時，應自動重新計算。

### 結果區

- 個人結果只在輸入通過驗證並產生後顯示。
- 主要結果涵蓋疏文常見欄位；填寫內容相同的別名合併顯示，避免重複資訊。
- 詳細資訊預設收合，可顯示原始時間、換日模式、判定依據與虛歲計算式。
- 農曆直接填寫的結果會標示「此出生農曆資料由使用者自行提供」。
- 手機版產生結果後可自動捲動到結果區，並尊重 `prefers-reduced-motion`。

### 分享與設定

- 分享、設定及詳細資訊使用一致的 Modal／Drawer 互動。
- 分享連結包含個人資料時，預設顯示隱私提醒。
- Clipboard API 不可用時提供手動複製方式，以支援 LINE 內建瀏覽器。
- 「清除資料」與「重設設定」分開處理，避免誤刪不同類型資料。

### 響應式與無障礙

- 手機版優先，使用單欄垂直流程。
- 平板與桌機可使用雙欄配置。
- 以 WCAG 2.1 AA 為最低目標。
- 支援鍵盤操作、正確表單標籤、錯誤訊息宣告、焦點管理與足夠色彩對比。

## 技術需求

### 執行環境

- Node.js 24 LTS，目標範圍為 `>=24 <25`
- pnpm 10.33.0
- 支援 ES Modules 的現代瀏覽器

### 支援瀏覽器

- Chrome 最新版
- Edge 最新版
- Firefox 最新版
- Safari 最新版
- iOS Safari
- Android Chrome
- iOS／Android LINE 內建瀏覽器

不支援 Internet Explorer 與已停止更新的舊瀏覽器。

### 品質要求

每個里程碑完成後必須執行：

- TypeScript typecheck
- ESLint
- Vitest
- Production build

所有檢查通過並完成驗收後，才開始下一個里程碑。GitHub Actions 將負責 push 與 pull request 的品質檢查；Vercel 負責部署。

## 安裝和運行說明

### 安裝

請先確認 Node.js 與 pnpm 版本：

```bash
node --version
pnpm --version
```

預期使用 Node.js `24.x` 與 pnpm `10.33.0`。若尚未啟用 pnpm，可使用 Node.js 內附的 Corepack：

```bash
corepack enable
corepack prepare pnpm@10.33.0 --activate
```

接著安裝專案：

```bash
git clone <repository-url>
cd react19-lunar-ritual-helper
pnpm install --frozen-lockfile
```

### 啟動開發環境

```bash
pnpm dev
```

### ESLint

```bash
pnpm lint
```

### TypeScript typecheck

```bash
pnpm typecheck
```

### Unit tests

```bash
pnpm test
```

開發時持續監看：

```bash
pnpm test:watch
```

### Production build

```bash
pnpm build
```

### 統一品質檢查

以下指令會依序執行 ESLint、TypeScript 型別檢查、單元測試與正式建置：

```bash
pnpm check
```

## 持續整合與部署

### GitHub Actions

推送至 `main` 或建立 Pull Request 時，GitHub Actions 會使用 Node.js 24 與 pnpm 10.33.0 執行：

1. 以 frozen lockfile 安裝依賴。
2. 執行 ESLint。
3. 執行 TypeScript 型別檢查。
4. 執行全部單元測試。
5. 產生正式版本建置。

### Vercel

Vercel 專案建議使用以下設定：

- Framework Preset：Vite
- Node.js Version：24.x
- Install Command：`pnpm install --frozen-lockfile`
- Build Command：`pnpm build`
- Output Directory：`dist`

Vercel 會依 `package.json` 的 `packageManager` 欄位使用 pnpm 10.33.0。環境變數目前沒有必要設定；應用程式的資料換算、LocalStorage 與分享網址皆在瀏覽器端處理。

Production：

[https://react19-lunar-ritual-helper.vercel.app/](https://react19-lunar-ritual-helper.vercel.app/)

## 專案結構

目前主要結構：

```text
react19-lunar-ritual-helper/
├─ .github/
│  └─ workflows/
│     └─ quality.yml
├─ docs/
│  └─ product-requirements.md
├─ public/
├─ src/
│  ├─ assets/
│  │  └─ styles/
│  ├─ components/
│  │  ├─ ui/
│  │  ├─ AppShell.tsx
│  │  ├─ RitualResults.tsx
│  │  └─ ShareDialog.tsx
│  ├─ hooks/
│  │  └─ useDayBoundaryClock.ts
│  ├─ pages/
│  │  └─ Home.tsx
│  ├─ router/
│  ├─ test/
│  ├─ types/
│  ├─ utils/
│  │  ├─ lunar/
│  │  ├─ formSpec.ts
│  │  ├─ storageSpec.ts
│  │  └─ urlSpec.ts
│  ├─ App.tsx
│  ├─ index.css
│  └─ main.tsx
├─ .node-version
├─ .nvmrc
├─ eslint.config.js
├─ package.json
├─ pnpm-lock.yaml
├─ tsconfig.json
└─ vite.config.ts
```

日期、出生資料、時辰、虛歲、分享網址與本機儲存規則皆位於可獨立測試的工具模組；介面元件與頁面組合則分開管理。

## 架構設計

### 設計原則

- **領域規則與 UI 分離**：農曆、換日、時辰、虛歲與格式化使用純函式。
- **出生與今日時間軸分離**：出生資料固定 `00:00`；今日資料依 `folk／civil`。
- **草稿與結果分離**：編輯中的表單不直接覆蓋已產生結果。
- **資料來源分離**：手動輸入、分享 URL 與 LocalStorage 有明確優先順序。
- **隱私預設**：個人資料不自動保存，也不因一般操作寫入 URL。
- **時間可注入**：領域函式不直接依賴測試當下時間，便於固定時區測試。
- **漸進重構**：功能重構、UI 整理與舊程式清理分開進行。

### 資料流程

```text
表單草稿
  → Validation
  → 有效出生資料
  → 農曆與疏文領域計算
  → 已產生結果
  → 主要結果／詳細資訊
```

資料初始化優先順序：

```text
有效分享 URL
  > 使用者已同意保存的 LocalStorage
  > 系統預設
```

分享流程：

```text
目前有效結果
  → 建立 Schema v1 URL
  → 隱私提醒
  → 使用者確認
  → Clipboard 或手動複製
```

### 目標模組邊界

- `domain`：日期、農曆、時辰、生肖、格式化與虛歲
- `features`：表單、今日資訊、疏文結果與分享互動
- `infrastructure`：URL codec、LocalStorage 與 migration
- `components`：可重用且符合無障礙要求的 UI 元件
- `pages`：組合功能與安排頁面流程

## Validation

### 表單資料

- 性別未選：不可產生結果，提示「請選擇性別」。
- 國曆生日未填：不可產生結果。
- 國曆生日格式錯誤或日期不存在：不可產生結果並提示原因。
- 國曆生日晚於 `Asia/Taipei` 民用日期的今天：不可產生結果。
- 日期超出 `lunar-javascript` 支援範圍：提示「此日期不在支援範圍內」。
- 選擇已知時辰但未選時辰：不可產生結果。
- 選擇精確時間但時間缺少或無效：不可產生結果。
- 選擇不知道出生時間：可以產生結果，生辰顯示「吉時」。

### 已知農曆直接填寫

- 農曆出生年必須為有效整數，且能產生干支與生肖。
- 農曆月限制為 1–12。
- 農曆日限制為 1–30。
- 出生農曆年不得晚於依 `dm` 判定的目前農曆年。
- 第一階段不驗證該月份實際是 29 或 30 天。
- 第一階段不支援閏月直接輸入。

介面提示：

> 目前僅驗證基本格式，不驗證農曆日期是否實際存在；請確認輸入的農曆生日正確。閏月生日暫不支援。

### 分享連結

分享連結採嚴格驗證與容錯處理：

- 性別、出生資料模式、對應出生日期資料與出生時間模式為必要參數。
- 已知時辰時，時辰參數必填。
- 已知精確時間時，時間參數必填。
- 必要資料缺少或錯誤時不載入個人結果。
- 可選資料缺少時使用預設值，例如缺少 `dm` 時使用 `folk`。
- 新舊參數同時存在時，以新版短參數為準。
- 無效連結保留原始 URL，待使用者主動選擇「清除此分享連結」。

## 免責聲明

本工具依使用者選擇的換日模式及輸入資料，提供疏文所需欄位之換算與整理，結果僅供一般參考。各宮廟、法師或疏文格式可能有不同規範，請以實際使用單位之規定為準。

已知農曆直接填寫模式：

> 本模式之出生農曆資料由使用者自行提供，系統僅進行基本格式檢查，不驗證其與實際農曆日期是否一致。
