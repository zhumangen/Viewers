# Customization Docs Index / 定制化文档入口

| Language / 语言 | Document / 文档 | Description / 说明 |
|-----------------|-----------------|-------------------|
| **简体中文** | [README.md](./README.md) | OHIF Viewers **3.x**（React monorepo）完整定制化开发指南：概览、技术栈、本地开发、架构、Extension/Mode、构建部署、测试、上游同步 |
| English (entry) | [README.md](./README.md) | Full guide is in Simplified Chinese; identifiers, paths, and commands remain in English. Based on upstream [OHIF/Viewers](https://github.com/OHIF/Viewers) `master` (not the legacy Meteor tree). |

## Quick links / 速链

| Topic | Upstream path / 上游路径 |
|-------|-------------------------|
| App config | `platform/app/public/config/` |
| Plugin registry | `platform/app/pluginConfig.json` |
| Core services / managers | `platform/core/src/services/`, `platform/core/src/classes/` |
| Extensions | `extensions/` |
| Modes | `modes/` |
| CLI | `platform/cli/` (`pnpm run cli`) |
| Official docs source | `platform/docs/docs/` |
| Docker / Netlify | `Dockerfile`, `.docker/`, `netlify.toml` |

## Branch notes / 分支说明

| Branch | Role |
|--------|------|
| `OHIF/Viewers` `master` | Current **3.x** React + pnpm monorepo (beta line) |
| `zhumangen/Viewers` `master` | Should track upstream 3.x for customization work |
| `zhumangen/Viewers` `legacy-meteor` | Preserves the old **Meteor** fork history |

## Start the viewer / 启动

```bash
pnpm install --frozen-lockfile   # Node >= 24, pnpm >= 11
pnpm run dev                     # default APP_CONFIG → config/dev.js
```

See [README.md](./README.md) for Orthanc, build, test, and sync details.
