# OHIF 3.x Fork UI 重设计 — 一页摘要

**目标**：在不更换 UI 库（React + `@ohif/ui-next` + 少量 `@ohif/ui`）的前提下，为阅读室场景提供 **dark-first、偏冷、teal/cyan 强调** 的临床密度界面；交互主路径保持 **WorkList → Viewer → Panels**。

**视觉要点**
- Canvas `#0B0F14` / Elevated `#12181F` / Sidebar `#0E141B`；Accent `#2DD4BF`；正文 `#E8EEF4`
- 紧凑间距（行高 32–36px，顶栏/工具条 40px）；lucide 线宽图标；viewport 激活描边用 accent

**WorkList**（`platform/app/src/routes/WorkList/`）  
Filter  sticky + 密表 + 可选 SidePanelPreview；列优先 Patient/MRN/Date/Modality；多选底栏 Open/Compare；空/骨架/错误态不打断筛选。

**Viewer**  
Header 元数据 | Toolbar 工具 | 左系列 / 右测量与追踪 | Viewport Grid | Status；面板可收至 icon rail；可选减负模式放大影像区。

**测量 / 报告**  
按 Study→Series 分组；状态 + jump-to-image；Tracking 与 Report 清 IA；导出固定面板底 sticky，不改 measurement-tracking 状态机。

**落地顺序**  
Phase 0 Tokens → 1 Study List 皮肤 → 2 Viewer chrome → 3 测量面板。组件一律映射现有 ui-next（Button、DataTable、Dialog、Tabs、Header 等）。

详见 `DESIGN.md`。
