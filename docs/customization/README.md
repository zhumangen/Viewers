# OHIF Viewers 3.x 定制化开发指南（简体中文）

> **上游仓库**：https://github.com/OHIF/Viewers（默认分支 `master`）  
> **本 fork**：https://github.com/zhumangen/Viewers  
> **文档基线**：上游 `master`（实测约 `3.14.0-beta.26`，提交如 `2f2d015a…`；以你拉取时的 `package.json` / `version.txt` 为准）  
> **官方文档站点**：https://docs.ohif.org/（源码在 monorepo 内 `platform/docs`）  
> **重要**：当前 OHIF 3.x 是 **React + pnpm monorepo**（`platform/` / `extensions/` / `modes/`），**不是** Meteor 时代的 `Packages/ohif:*` 架构。旧 Meteor 代码保留在本 fork 的 **`legacy-meteor`** 分支；定制 3.x 请以 `OHIF/Viewers` 的 `master`（或 `release/*`）为准。

本文路径、脚本、包名均来自上游仓库实查；不确定处标注「仓库中未体现」。标识符、路径与命令保持英文。

---

## 目录

1. [项目概览](#1-项目概览)
2. [技术栈与版本](#2-技术栈与版本)
3. [本地开发](#3-本地开发)
4. [架构](#4-架构)
5. [定制化重点](#5-定制化重点)
6. [构建与部署](#6-构建与部署)
7. [测试](#7-测试)
8. [上游同步](#8-上游同步)
9. [目录速查表](#9-目录速查表)
10. [定制者注意事项](#10-定制者注意事项)

---

## 1. 项目概览

OHIF Viewer 是 **zero-footprint**（浏览器端、无需本地安装原生客户端）的 DICOM 医学影像查看器，支持 2D/3D、MPR、MIP、分割、SR、PDF、显微、ECG 等能力，并通过 **Extension + Mode** 体系实现可扩展工作流。

仓库是 **pnpm workspace monorepo**（见根目录 `pnpm-workspace.yaml`）：

```text
packages:
  - platform/*
  - extensions/*
  - modes/*
```

### 1.1 顶层结构（上游 `master`）

| 路径 | 作用 |
|------|------|
| `platform/app` | `@ohif/app`：Viewer 壳、路由、webpack/rspack 构建、`public/config` |
| `platform/core` | `@ohif/core`：业务逻辑、Managers、Services、DataSources 类型与工具 |
| `platform/ui` | `@ohif/ui`：既有 React 组件库 |
| `platform/ui-next` | `@ohif/ui-next`：下一代 UI（shadcn/ui + Radix，更易主题化） |
| `platform/i18n` | `@ohif/i18n`：国际化 |
| `platform/cli` | `@ohif/cli`：脚手架（create/add/link extension & mode） |
| `platform/docs` | Docusaurus 文档（`ohif-docs`） |
| `extensions/*` | 可组合功能块（viewport、toolbar、panel、data source…） |
| `modes/*` | 路由级工作流：声明依赖哪些 extension 模块并组装 UI |
| `tests/`、`playwright.config.ts` | Playwright e2e |
| `Dockerfile`、`.docker/`、`netlify.toml` | 容器与静态托管相关 |

根 `package.json` 的 `"name"` 为 `ohif-monorepo-root`；CLI 要求必须在 monorepo 根目录运行。

### 1.2 仓库自带 Extensions（`extensions/`）

| 目录 | npm 包名 |
|------|----------|
| `default` | `@ohif/extension-default` |
| `cornerstone` | `@ohif/extension-cornerstone` |
| `cornerstone-dicom-sr` | `@ohif/extension-cornerstone-dicom-sr` |
| `cornerstone-dicom-seg` | `@ohif/extension-cornerstone-dicom-seg` |
| `cornerstone-dicom-pmap` | `@ohif/extension-cornerstone-dicom-pmap` |
| `cornerstone-dicom-rt` | `@ohif/extension-cornerstone-dicom-rt` |
| `cornerstone-dynamic-volume` | `@ohif/extension-cornerstone-dynamic-volume` |
| `measurement-tracking` | `@ohif/extension-measurement-tracking` |
| `dicom-microscopy` | `@ohif/extension-dicom-microscopy` |
| `dicom-pdf` | `@ohif/extension-dicom-pdf` |
| `dicom-video` | `@ohif/extension-dicom-video` |
| `tmtv` | `@ohif/extension-tmtv` |
| `usAnnotation` | `@ohif/extension-ultrasound-pleura-bline` |
| `test-extension` | `@ohif/extension-test` |

注册清单见 `platform/app/pluginConfig.json`（构建时由插件导入机制消费）。

### 1.3 仓库自带 Modes（`modes/`）

| 目录 | npm 包名 |
|------|----------|
| `basic` | `@ohif/mode-basic` |
| `longitudinal` | `@ohif/mode-longitudinal` |
| `segmentation` | `@ohif/mode-segmentation` |
| `tmtv` | `@ohif/mode-tmtv` |
| `microscopy` | `@ohif/mode-microscopy` |
| `preclinical-4d` | `@ohif/mode-preclinical-4d` |
| `basic-dev-mode` | `@ohif/mode-basic-dev-mode` |
| `basic-test-mode` | `@ohif/mode-test` |
| `usAnnotation` | `@ohif/mode-ultrasound-pleura-bline` |

---

## 2. 技术栈与版本

以根目录 `package.json` / `.node-version` / `Dockerfile` 为准（部分 `platform/docs` 与根 `README` 仍残留 Yarn 表述，**以 package.json 为权威**）：

| 项 | 上游 `master` 体现 |
|----|-------------------|
| 包管理 | **pnpm**（`"packageManager": "pnpm@11.5.2"`，`engines.pnpm`: `>=11`） |
| Node | **`engines.node`: `>=24`**；`.node-version` / Docker / Netlify：`24.15.0` |
| 应用版本 | monorepo 根 `"version": "3.14.0-beta.26"`（beta 随 `master` 滚动） |
| UI | **React 18.3.x**（`@ohif/app` dependencies） |
| 路由 | `react-router` / `react-router-dom` 6.x |
| 影像引擎 | **Cornerstone3D**（如 `@cornerstonejs/core` / `dicom-image-loader` 等 peer/依赖，实测约 **5.8.2**） |
| DICOM | `dcmjs`、`dicom-parser`、`dicomweb-client` |
| 构建 | 开发/生产常用 **rspack**（`platform/app`）；另有实验性 **`pnpm dev:fast`** → **rsbuild**（根 `rsbuild.config.ts`） |
| 样式 | Tailwind（app / ui-next）；ui-next 还使用 Radix / shadcn 风格组件 |
| 状态 | `zustand`（app 依赖中可见） |
| 单元测试 | Jest |
| E2E | **Playwright**（根脚本 `test:e2e*`）；仓库仍含 Cypress 相关依赖/脚本，以根 `package.json` 的 Playwright 脚本为主路径 |
| 文档 | Docusaurus（`platform/docs`） |

分支模型（官方 README / `platform/docs/docs/development/getting-started.md`）：

- **`master`**：最新开发（beta）发布线  
- **`release/*`**：相对稳定的生产向发布线（例如 `release/3.x`）

---

## 3. 本地开发

### 3.1 环境准备

```bash
# 建议使用 Node 24.x（与 .node-version / Docker 一致）
node -v   # >= 24
corepack enable
corepack prepare pnpm@11.5.2 --activate
pnpm -v   # >= 11
```

Fork 工作流（官方推荐）：

```bash
git clone https://github.com/zhumangen/Viewers.git
cd Viewers
git remote add upstream https://github.com/OHIF/Viewers.git
# 若本地 master 仍是 Meteor 旧树，先按第 8 节对齐上游 master
```

### 3.2 安装与启动

在 monorepo **根目录**：

```bash
pnpm install --frozen-lockfile   # 或根脚本: pnpm run install:frozen
pnpm run dev                     # 等价于 start → @ohif/app 的 dev:viewer
```

常见结果：开发服务器在 **http://localhost:3000/**（以终端输出为准）。

其他常用开发脚本（根 `package.json`）：

| 脚本 | 含义 |
|------|------|
| `pnpm run dev` / `start` | 默认 Viewer 开发（rspack serve） |
| `pnpm run dev:fast` | 实验性 rsbuild 快速开发 |
| `pnpm run dev:no:cache` | 无缓存开发服务 |
| `pnpm run dev:orthanc` | 使用 `config/docker-nginx-orthanc.js` 并配置 Orthanc 代理 |
| `pnpm run orthanc:up` | `docker compose -f platform/app/.recipes/Nginx-Orthanc/docker-compose.yml up` |
| `pnpm run dev:dcm4chee` | `APP_CONFIG=config/local_dcm4chee.js` |
| `pnpm run dev:static` | `APP_CONFIG=config/local_static.js` |
| `pnpm run show:config` | 打印当前 `$APP_CONFIG` 与 `$PUBLIC_URL` |
| `pnpm run cli …` | 调用 `platform/cli`（见 §5.3） |
| `pnpm run docs:dev` | 本地跑官方文档站 |

### 3.3 `APP_CONFIG` 与 `PUBLIC_URL`

配置文件目录：

**`platform/app/public/config/`**

构建/开发通过环境变量选择配置（`platform/app/.webpack/webpack.pwa.js`）：

- 显式：`APP_CONFIG=config/xxx.js`
- 未设置时：
  - **开发**（`dev` / `dev:fast` / `start`）→ **`config/dev.js`**（全量 data source，开启 `?customization=`）
  - **生产 `build`** → **`config/default.js`**（收紧的默认：单一只读 demo data source，关闭 URL customization）

`PUBLIC_URL`：静态资源与路由的公共路径前缀，默认 `/`。子路径部署时需同时考虑 `routerBasename`（app 内会用 `publicUrl` 等逻辑默认化）。

示例：

```bash
APP_CONFIG=config/local_orthanc.js PUBLIC_URL=/ohif/ pnpm run dev
APP_CONFIG=config/netlify.js pnpm run build
```

同目录还可参考：`docker-nginx-orthanc.js`、`google.js`、`idc.js`、`e2e.js`、`customization.js`、`netlify.js` 等。

### 3.4 `window.config` 要点（`default.js` / `dev.js`）

配置以 `window.config = { … }` 形式提供（类型注释 `@type {AppTypes.Config}`），常见字段：

- `extensions` / `modes`：额外加载的包名列表（多数内置包已由 `pluginConfig.json` 引入；数组常可留空 `[]`）
- `defaultDataSourceName` + `dataSources[]`（`namespace` 形如 `@ohif/extension-default.dataSourcesModule.dicomweb`）
- `customizationService`：启动期定制（字符串模块 id、数组或带 `bootstrap` / `global` / `mode` 相位的对象）
- `customizationUrlPrefixes`：允许 `?customization=` 拉取 JSONC 数据文件（**非执行脚本**）
- `routerBasename`、`showStudyList`、`maxNumberOfWebWorkers`、`hotkeys` 相关等
- `genericViewports`：原生 Generic Viewport（“next”）开关（`default.js` 中默认 `enabled: false`）

安全提示（`default.js` 注释写明）：生产默认**不**启用 `dicomlocal` / `dicomjson` / `dicomwebproxy`，也**不**默认开放 `?customization=`；完整能力见 `dev.js` / `netlify.js`。

---

## 4. 架构

官方长文：`platform/docs/docs/development/architecture.md` 与 `platform/docs/docs/platform/**`。

### 4.1 分层关系

```text
@ohif/app          组装：注册 Extension / Mode，路由，布局
     │
     ├── @ohif/core     CommandsManager / ExtensionManager / ServicesManager /
     │                  HotkeysManager / DataSources / 类型与工具
     ├── @ohif/ui       既有组件
     ├── @ohif/ui-next  新组件体系（主题、shadcn）
     ├── @ohif/i18n
     ├── extensions/*   提供 modules（toolbar、panel、viewport、commands…）
     └── modes/*        按路由组合 extensions，定义工具栏/侧栏/HP/SOP handlers
```

初始化入口（实查）：`platform/app/src/appInit.js`  
在此创建 `CommandsManager`、`ServicesManager`、`HotkeysManager`、`ExtensionManager`，并 `registerServices([...])`，再 `loadModules` 加载 extensions / modes。

### 4.2 Extensions

Extension 是可注册的功能包，通过一组可选的 `get*Module` 钩子向平台贡献能力。CLI 模板见：

`platform/cli/templates/extension/src/index.tsx`

典型模块（模板与文档 `platform/docs/docs/platform/extensions/modules/`）：

| Module | 用途 |
|--------|------|
| `preRegistration` | 注册前初始化（库配置、自有 service） |
| `getPanelModule` | 侧栏面板 |
| `getViewportModule` | 视口组件 |
| `getToolbarModule` | 工具栏按钮/控件 |
| `getLayoutTemplateModule` | 页面布局模板 |
| `getSopClassHandlerModule` | Series → DisplaySet |
| `getHangingProtocolModule` | 挂片协议 |
| `getCommandsModule` | 命令（供 toolbar / hotkeys 调用） |
| `getContextModule` | React context |
| `getDataSourcesModule` | 自定义数据源 |
| （另有 docs 中的 utility、context 等） | |

真实参考实现：`extensions/default/src/`（含 `getToolbarModule.tsx`、`getPanelModule.tsx`、`getDataSourcesModule.js`、`DicomWebDataSource/`、`hangingprotocols/` 等）。

模块引用 id 约定（Mode 中大量使用）：

```text
@ohif/extension-<name>.<moduleType>.<exportName>
# 例：
@ohif/extension-default.panelModule.seriesList
@ohif/extension-cornerstone.viewportModule.cornerstone
```

### 4.3 Modes

Mode 描述「某一路由上的 Viewer 应用」：依赖哪些 extension、用哪些 panel/viewport/toolbar、挂片协议、SOP handlers、`isValidMode` 等。

参考：`modes/basic/src/index.tsx`（导出 `extensionDependencies`、`sopClassHandlers`、布局/面板 id 常量、`isValidMode` 等）。

Mode 通常还包含：

- `routeName` / `displayName` / `routes`
- `onModeEnter` / `onModeExit`（生命周期，见 docs `modes/lifecycle.md`）
- 工具组初始化（如 `initToolGroups.ts`）与 `modeCustomization.ts`

### 4.4 ServicesManager 与内置 Services

`ServicesManager`（`platform/core/src/services/ServicesManager.ts`）集中注册服务；消费方通过 `servicesManager.services.<name>` 访问。

`appInit.js` 中注册的服务包括（名称以代码为准）：

- `UINotificationService`、`UIModalService`、`UIDialogService`、`UIViewportDialogService`
- `MeasurementService`、`DisplaySetService`
- `CustomizationService`（可传入 `appConfig.customizationService`）
- `ToolbarService`（历史文档有时写作 ToolBarService；核心目录为 `ToolBarService/`）
- `ViewportGridService`、`HangingProtocolService`、`CineService`
- `UserAuthenticationService`、`PanelService`、`WorkflowStepsService`
- `StudyPrefetcherService`、`MultiMonitorService`

另有 `DicomMetadataStore` 等数据层能力（见 `platform/core/src/services/`）。

扩展还可在 cornerstone 等包中注册更多服务（如 Segmentation / ToolGroup / SyncGroup 等，文档在 `platform/docs/docs/platform/services/data/`）。

### 4.5 CommandsManager

`platform/core/src/classes/CommandsManager.ts`  
命令按 **context** 注册；执行时按 context 优先级查找。Mode 依赖中**后注册**的模块优先级更高（官方 commands 文档说明）。Toolbar、Hotkeys、面板操作最终多落到 `commandsManager.runCommand(...)`。

### 4.6 HotkeysManager

`platform/core/src/classes/HotkeysManager.ts`  
在 `appInit` 与 `ExtensionManager` 一同构造。默认绑定见 `platform/core/src/defaults/hotkeyBindings.js`。可通过配置 / 偏好 UI 覆盖；定义含 `commandName`、`keys`、`label`、`isEditable` 等。

### 4.7 Hanging Protocols

`HangingProtocolService`（`platform/core/src/services/HangingProtocolService/`）根据协议决定视口栅格与 series 填充。Extension 通过 `getHangingProtocolModule` 贡献协议；Mode 通过 id 选择默认协议（如 `@ohif/extension-default.hangingProtocolModule.default`）。

### 4.8 Data Sources

抽象与实现：

- 类型：`platform/core/src/types/DataSource.ts`
- 默认实现：`extensions/default/src/DicomWebDataSource`、`DicomJSONDataSource`、`DicomLocalDataSource`、`DicomWebProxyDataSource`、`MergeDataSource` 等
- 配置：在 `window.config.dataSources` 声明 `namespace` + `sourceName` + `configuration`（QIDO/WADO root、`staticWado`、`singlepart` 等）

文档：`platform/docs/docs/configuration/dataSources/`。

### 4.9 Viewport Grid

`ViewportGridService`（`platform/core/src/services/ViewportGridService/`）管理视口栅格状态；与 Hanging Protocol、布局模板、各 `viewportModule` 协同。Mode/HP 决定格子数量与每个格子绑定的 displaySet。

---

## 5. 定制化重点

### 5.1 总览：推荐扩展方式

1. **新建 Extension**：封装按钮、面板、命令、数据源、HP 等可复用能力  
2. **新建 Mode**：组合现有 + 自研 extension，形成产品工作流路由  
3. **改 App Config**：数据源、定制项、白标、实验开关  
4. **CustomizationService**：在不 fork 深层 UI 的情况下替换/补丁 UI 片段与行为  
5. **主题 / ui-next**：视觉与组件层定制  

尽量避免直接改 `@ohif/extension-default` 核心文件；优先「旁路扩展 + 配置」，便于上游同步。

### 5.2 注册：`pluginConfig.json` 与 app config

内置扩展/模式清单：

**`platform/app/pluginConfig.json`**

```json
{
  "extensions": [ { "packageName": "@ohif/extension-default" }, ... ],
  "modes": [ { "packageName": "@ohif/mode-longitudinal" }, ... ],
  "public": [ ... ]
}
```

新增**工作区内** extension/mode 后通常需要：

1. 包落在 `extensions/<dir>` 或 `modes/<dir>`（已包含在 `pnpm-workspace.yaml`）  
2. 写入 `pluginConfig.json`（或使用 CLI 的 add/link 流程维护配置）  
3. 如需在运行时额外指定，可在 `platform/app/public/config/*.js` 的 `extensions` / `modes` 数组中列出包名  
4. `pnpm install` 以链接 workspace 包  

文档：`platform/docs/docs/platform/extensions/pluginConfig.md`。

### 5.3 使用 `platform/cli` 脚手架

根脚本：`pnpm run cli` → `node ./platform/cli/src/index.js`  
（`@ohif/cli`，`bin`: `ohif-cli`；**必须在 monorepo 根**运行。）

常用子命令（`platform/cli/src/index.js`）：

| 命令 | 作用 |
|------|------|
| `create-extension` | 从 `platform/cli/templates/extension` 生成扩展 |
| `create-mode` | 从 `platform/cli/templates/mode` 生成模式 |
| `add-extension` / `remove-extension` | 从 npm 添加/移除扩展并改 Viewer 配置 |
| `add-mode` / `remove-mode` | 从 npm 添加/移除模式 |
| `link-extension` / `unlink-extension` | 本地链接扩展 |
| `link-mode` / `unlink-mode` | 本地链接模式 |
| `list` / `search` 等 | 列出/搜索插件（见 CLI 帮助） |

示例：

```bash
pnpm run cli create-extension
pnpm run cli create-mode
pnpm run cli link-extension /path/to/my-extension
pnpm run cli add-mode @some-scope/mode-name
```

说明：官方 `ohif-cli.md` 部分示例仍写 `yarn run cli`；当前仓库应使用 **`pnpm run cli`**。模板生成后仍需按文档完成 link / `pluginConfig` 注册才能在 Viewer 中出现。

### 5.4 添加 Toolbar 按钮

模式：

1. 在 extension 的 `getToolbarModule` 中声明按钮（组件、图标、关联 `commandName`）  
2. 在同扩展 `getCommandsModule` 中实现命令  
3. 在 Mode 里把该 toolbar 段加入布局/工具栏配置（参考 `modes/basic/src/modeCustomization.ts` 的 `registerModeToolbar`）  

参考代码：

- `extensions/default/src/getToolbarModule.tsx`  
- `extensions/default/src/Toolbar/`  
- 文档：`platform/docs/docs/platform/extensions/modules/toolbar.md`  
- 服务：`ToolbarService`

### 5.5 添加侧栏 Panel

1. `getPanelModule` 返回 `{ name, iconName, iconLabel, label, component }`  
2. Mode 在左右侧栏配置中引用  
   `@ohif/extension-….panelModule.…`  
3. 可用 `PanelService` 与事件触发激活（见 `modes/basic` 中 `activatePanelTriggers` 注释与工具函数）

参考：`extensions/default/src/getPanelModule.tsx`、`extensions/default/src/Panels/`、`extensions/cornerstone` 下测量/分割面板。

### 5.6 自定义 Data Source

1. 在 extension 实现 `getDataSourcesModule`（`createDataSource`）  
2. 在 config 的 `dataSources` 中增加条目，`namespace` 指向  
   `@your/extension.dataSourcesModule.<name>`  
3. 设置 `defaultDataSourceName`  

也可先复用 `@ohif/extension-default.dataSourcesModule.dicomweb`，只改 `configuration` 指向自有 DICOMweb（最常见）。

本地 Orthanc 联调：

```bash
pnpm run orthanc:up          # 另开终端
pnpm run dev:orthanc
```

配方与代理相关文件在 `platform/app/.recipes/` 与 `config/docker-nginx-orthanc.js`。

### 5.7 CustomizationService 与 URL 定制

- 服务：`platform/core` → `CustomizationService`  
- 文档目录：`platform/docs/docs/platform/services/customization-service/`  
- 示例配置：`platform/app/public/config/customization.js`、`dev.js` 中的 `customizationService` / `customizationUrlPrefixes`  
- 公共定制数据：`platform/app/public/customizations/**/*.jsonc`（由 URL 或 `requires` 拉取，**只作数据解析**）

相位概念（见 `customization.js` 注释）：`requires` → `bootstrap`（扩展注册前）→ `global`（注册后）→ `mode`（进模式时，支持 `*` 与按 mode id）。

主题相关文档：`appearance-theming.md`；`dev.js` 示例加载  
`@ohif/extension-default.customizationModule.theme`。

### 5.8 Theming 与 `ui-next`

- `@ohif/ui`：既有组件，历史 UI  
- `@ohif/ui-next`：`package.json` 描述为 *“Next version of OHIF Viewers UI, more customizable using shadcn/ui”*；导出 `./tailwind.config`、`./components/*` 等；依赖 Radix 系列  

定制建议：新 UI 优先落在 `ui-next` 组件 + Tailwind token / `components.json` 体系；并通过 CustomizationService 替换入口，而不是大量复制旧 `ui` 树。白标还可关注 config 中的 `whiteLabeling`（`default.js` 中有注释占位）。

### 5.9 最小定制检查清单

1. `pnpm run dev` 能打开 Study List / Viewer  
2. `APP_CONFIG` 已指向自有 DICOMweb  
3. 新 extension 出现在 `pluginConfig.json` 且 Mode 引用了模块 id  
4. 命令可在控制台/`commandsManager` 路径触发，再绑到 toolbar/hotkey  
5. `pnpm run build` 使用生产 config 验证 `PUBLIC_URL`  
6. 需要时补单元测试或 Playwright 冒烟  

---

## 6. 构建与部署

### 6.1 生产构建

```bash
pnpm install --frozen-lockfile
pnpm run build          # → pnpm --filter @ohif/app run build:viewer
```

产出目录：`platform/app/dist/`（含 `index.html`、打包资源、`app-config.js` 等；具体文件名随构建变化）。

相关脚本：

| 脚本 | 说明 |
|------|------|
| `build` | 默认生产 Viewer |
| `build:ci` | CI / Netlify 常用（`APP_CONFIG=config/netlify.js` 等，见 app `package.json`） |
| `build:qa` / `build:demo` / `build:dev` | 不同配置的构建变体 |

环境变量（文档 `platform/docs/docs/platform/environment-variables.md`）：`NODE_ENV`、`APP_CONFIG`、`PUBLIC_URL`、`ROUTER_BASENAME`、i18n 相关 `USE_LOCIZE` 等。

### 6.2 Docker

根目录 **`Dockerfile`**（多阶段）：

1. `node:24.15.0-slim` + 全局 `pnpm@11` → `pnpm install` → `pnpm run build`  
2. `nginxinc/nginx-unprivileged` 托管 `platform/app/dist`  
3. 入口与模板在 `.docker/Viewer-v3.x/`；压缩脚本 `.docker/compressDist.sh`

```bash
docker build . -t ohif-viewer-image
docker build . -t ohif-viewer-image \
  --build-arg APP_CONFIG=config/default.js \
  --build-arg PUBLIC_URL=/ \
  --build-arg PORT=80
```

更完整说明：`platform/docs/docs/deployment/docker/docker.md`。  
PACS 旁路配方：`platform/app/.recipes/Nginx-Orthanc*`、`Nginx-Dcm4chee*`。

### 6.3 Netlify

根目录 **`netlify.toml`**：

- `command = "pnpm run build:ci"`  
- `publish = "platform/app/dist"`  
- `NODE_VERSION = "24.15.0"`  

用于 deploy preview / 文档等；公开 demo（viewer.ohif.org）另有 CircleCI + 托管流程（README 说明）。

### 6.4 静态资源托管

任意 Nginx / S3 / CDN 托管 `platform/app/dist` 即可。注意：

- `PUBLIC_URL` 与服务器 path 一致  
- DICOMweb 跨域（CORS）与认证（OpenID 等，见 `deployment/authorization.md`）  
- 默认 `default.js` 的安全收紧是否符合你的部署场景  

---

## 7. 测试

### 7.1 单元测试（Jest）

```bash
pnpm run test            # → test:unit
pnpm run test:unit
pnpm run test:unit:ci    # 各包 ci 单元测试
```

配置：根 `jest.config.js` / `jest.config.base.js`。

### 7.2 Playwright E2E

根脚本（`package.json`）：

```bash
pnpm run test:data       # git submodule update --init testdata
pnpm exec playwright install   # 首次可能需要

pnpm run test:e2e
pnpm run test:e2e:ui
pnpm run test:e2e:headed
pnpm run test:e2e:debug
pnpm run test:e2e:ci
```

配置：`playwright.config.ts`；用例与约定：`tests/`（贡献说明见 `tests/CONTRIBUTING.md`）。  
文档：`platform/docs/docs/development/playwright-testing.md`（文中偶尔出现 `bun test:e2e:ui` 字样；根脚本以 **pnpm** 为准）。

E2E 常用配置：`platform/app/public/config/e2e.js`；也可 `pnpm --filter @ohif/app run test:e2e:serve`。

### 7.3 Cypress

`@ohif/app` 的 `package.json` 仍含 `test:e2e` → `cypress open` 等脚本；根依赖也包含 `cypress`。新贡献优先遵循 Playwright 文档与根 `test:e2e*` 脚本。若团队仍跑 Cypress，以 app 包内脚本为准。

---

## 8. 上游同步

### 8.1 目标拓扑

```text
OHIF/Viewers (upstream, master = 3.x)
        ↑
zhumangen/Viewers
        ├── master          → 应对齐上游 3.x（定制基于此）
        └── legacy-meteor   → 保留旧 Meteor fork 历史
```

说明（以 GitHub API 实查为准，可能随时间变化）：

- 上游 `OHIF/Viewers` 的 `master` 为当前 React 3.x monorepo。  
- 本 fork 另有 **`legacy-meteor`** 分支，用于存放 Meteor 时代代码。  
- 若 fork 的 `master` 仍停在旧 Meteor 提交，而描述仍写 “shared meteor packages”，则 **不能** 直接在该树上做 3.x 定制；需先把 `master` 更新为上游 3.x，或在新分支上跟踪 `upstream/master`。

### 8.2 推荐同步步骤

```bash
git remote add upstream https://github.com/OHIF/Viewers.git   # 若尚未添加
git fetch upstream

# 保留旧树（若尚未推送 legacy-meteor）
git branch legacy-meteor <old-meteor-sha>   # 或 git push origin <old>:legacy-meteor
git push -u origin legacy-meteor

# 将工作分支对齐上游 3.x（历史分歧极大时常用）
git checkout -B master upstream/master
# 重新应用你的 3.x 定制提交 / cherry-pick
git push origin master
# 若历史重写，需要 force push：务必确认团队协议后再执行
```

日常跟进：

```bash
git fetch upstream
git merge upstream/master
# 或 rebase：git rebase upstream/master
```

稳定产品线可跟踪 `upstream/release/*` 而非漂动的 `master` beta。

### 8.3 定制与冲突策略

- 自有代码尽量放在 **独立 extension/mode** 与 **config**，减少对 `platform/core`、`extensions/default`、`extensions/cornerstone` 的直接修改。  
- `pluginConfig.json`、`pnpm-lock.yaml` 合并冲突常见：保留上游结构后重新 `pnpm install`。  
- 上游安全 override（根 `pnpm-workspace.yaml` / `package.json` overrides）不要随意删掉。  
- Meteor 相关文档/包仅存在于 `legacy-meteor`；不要混进 3.x `master`。

---

## 9. 目录速查表

| 路径 | 说明 |
|------|------|
| `package.json` | 根脚本、engines、packageManager |
| `pnpm-workspace.yaml` | workspace 包范围与 pnpm 行为 |
| `platform/app` | Viewer 应用 |
| `platform/app/public/config/` | `window.config` 各环境配置 |
| `platform/app/public/customizations/` | JSONC 定制数据 |
| `platform/app/pluginConfig.json` | 扩展/模式/注册 public assets |
| `platform/app/src/appInit.js` | Managers/Services 启动装配 |
| `platform/app/.webpack/webpack.pwa.js` | APP_CONFIG / PUBLIC_URL 逻辑 |
| `platform/app/.recipes/` | Orthanc / dcm4chee docker 配方 |
| `platform/core/src/classes/` | CommandsManager、HotkeysManager |
| `platform/core/src/services/` | ServicesManager 与各 Service |
| `platform/core/src/extensions/` | ExtensionManager |
| `platform/ui` / `platform/ui-next` | UI 组件库 |
| `platform/cli/` | 脚手架与模板 |
| `platform/docs/docs/` | 官方文档源码 |
| `extensions/*` | 功能扩展 |
| `modes/*` | 工作流模式 |
| `tests/`、`playwright.config.ts` | Playwright e2e |
| `Dockerfile`、`.docker/` | 镜像与 Nginx 模板 |
| `netlify.toml` | Netlify 构建 |
| `testdata/` | e2e 子模块数据（`pnpm run test:data`） |

---

## 10. 定制者注意事项

1. **以 `package.json` 为准使用 pnpm + Node ≥ 24**；忽略过时的 Yarn 文档片段，避免混用包管理器。  
2. **dev 与 build 默认 config 不同**（`dev.js` vs `default.js`）：本地能用的 data source / customization，生产默认可能被关掉。  
3. **`default.js` 有意收紧安全面**；接生产 PACS 前请显式设计 data source、CORS、OIDC 与 customization 白名单。  
4. Mode 中的模块 id 必须与 extension 导出一致，否则工具栏/面板会静默缺失。  
5. Cornerstone3D 版本与 OHIF 锁定在一起（peerDependencies）；升级 CS3D 需按上游 `cs3d:*` 脚本与集成文档操作。  
6. 本 fork 若 `master` 仍为 Meteor，先完成 §8 同步再开发；旧指南（Meteor `Packages/ohif:*`）不适用于 3.x。  
7. 官方文档站与 `platform/docs` 是更细的 API 来源；本文是面向定制的中文导览，细节以源码与 docs 为准。  
8. 若某能力在仓库中找不到对应路径或脚本，本文会写「仓库中未体现」——请再查当前 `master` 或向 [OHIF 社区](https://community.ohif.org) 确认。

---

## 参考链接

- 上游源码：https://github.com/OHIF/Viewers  
- 在线文档：https://docs.ohif.org/  
- 文档源码：`platform/docs/docs/`（development / platform / configuration / deployment）  
- Demo：https://viewer.ohif.org/  

*文档生成依据：上游 `master` 实查（`gh api` / `git show upstream/master:…` / raw 文件），非 Meteor 旧树。*
