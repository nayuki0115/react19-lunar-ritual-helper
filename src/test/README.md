# 單元測試規範

本目錄集中放置所有測試、共用設定與輔助工具。Production 目錄只保留應用程式程式碼。

## 目錄用途

```text
src/test/
├─ helpers/       # 跨測試共用的輔助工具
├─ unit/          # 純函式與模組單元測試
├─ setup.ts       # Vitest 全域測試清理
└─ README.md      # 測試目錄與命名規範
```

## 檔案位置與命名

- 所有單元測試集中在 `src/test/unit/`。
- 測試檔使用 `*.test.ts` 命名。
- 跨測試共用的工具放在 `src/test/helpers/`。
- Vitest 全域設定與測試後清理集中於 `src/test/setup.ts`。

範例：

```text
src/test/unit/
├─ lunar-domain.test.ts
├─ lunar-compatibility.test.ts
└─ zh.test.ts
```

## 撰寫原則

- 明確 import `describe`、`it`、`expect`、`vi` 等 Vitest API，不依賴全域測試函式。
- 每個測試只驗證一個清楚的行為或規則。
- 測試名稱應描述輸入情境及預期結果。
- 測試之間不得共享可變狀態。
- 測試不得依賴執行順序。
- 單元測試應保持可重現，不依賴執行機器的目前日期、時間、locale 或時區。

## 日期與時區

所有時間相關測試必須使用 `setTaipeiSystemTime()`，並提供包含 `+08:00` 的完整時間：

```ts
setTaipeiSystemTime("2025-01-28T22:59:00+08:00");
```

每個時間相關案例必須清楚記錄：

- 測試時間
- 使用的換日規則
- 輸入資料
- 預期輸出

不得在預期結果中使用測試執行當下的 `new Date()`，也不得依賴開發電腦的本機時區。

## 基準測試

`test/vitest-foundation` 分支中的測試用來記錄既有程式行為，避免後續重構時發生未預期的改變。

- 基準測試通過，不代表既有行為完全符合新版產品規格。
- 若現有行為與產品需求不同，應在後續對應的 domain 分支修改 production 邏輯及測試。
- 不應在測試基礎分支中順便重寫農曆、時辰、格式或虛歲算法。

## 執行方式

執行一次完整單元測試：

```bash
pnpm test
```

開發期間持續監看：

```bash
pnpm test:watch
```

每個里程碑完成後，應執行：

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```
