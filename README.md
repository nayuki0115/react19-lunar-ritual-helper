# Lunar Ritual Helper 農曆小幫手

一個工具型 Web App，協助使用者快速整理疏文/祭拜常見需要填寫的資訊，例如：

- 今日歲次（天運）
- 今日農曆日期（23:00 日界線）
- 農曆年（干支 + 民國年）
- 農曆生日
- 生肖
- 生辰（時辰）
- 虛歲
- 手印提醒（男左女右）


## Features（v0）

### 輸入
- 性別（男 / 女）
- 生日（YYYY-MM-DD）
- 出生時間（選填）
  - 知道時辰（子～亥）
  - 知道幾點幾分（HH:mm）
  - 不知道（unknown）

### 結果顯示
- 今日歲次（干支年）
- 今日農曆（月日）
- 農曆年：干支年（民國年）
- 農曆生日（數字月份 + 數字日）
- 生辰（時辰）
  - clockTime 模式：
    - 23:00–23:59 → 夜子時
    - 00:00–00:59 → 早子時
    - 其他 → X時
  - shichen 模式：
    - 直接顯示使用者選擇（子時、丑時…）
  - unknown 模式：
    - 顯示「吉時」
- 生肖（單字：猴、龍…）
- 虛歲（以今年年份計算）
- 手印提醒：男左女右


## Tech Stack

- React 19
- TypeScript
- Vite
- pnpm
- Tailwind CSS v4（@tailwindcss/vite）
- React Router
- lunar-javascript（農曆/干支/生肖換算）
- URL Search Params（支援 Back/Forward 還原結果）


## Folder Structure

```txt
src/
  pages/
    Home.tsx
  utils/
    lunar.ts
  types/
    lunar-javascript.d.ts
  assets/
    styles/
      tokens.css
