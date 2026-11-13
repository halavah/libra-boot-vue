<div align="center">

# Libra Boot Vue

**为前端开发者提供免构建的 Vue 静态示例目录、单文件组件预览与独立 HTML 示例。**

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933)](https://nodejs.org/en/download)
[![JavaScript](https://img.shields.io/badge/JavaScript-browser-F7DF1E)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

[English](README_EN.md) | **简体中文**

</div>

> **本文遵循开源说明规范**：结构与徽章按统一体例，徽章仅指向公开可访问资源，版本信息指向发布渠道动态页。

## 📖 目录

- [快速开始](#-快速开始)
- [安装](#-安装)
- [示例内容](#-示例内容)
- [目录结构](#-目录结构)
- [运行机制](#-运行机制)
- [数据与隐私](#-数据与隐私)
- [验证与检查](#-验证与检查)
- [部署与排错](#-部署与排错)
- [贡献指南](#-贡献指南)
- [License](#-license)
- [联系我们](#-联系我们)
- [Star History](#-star-history)
- [回到顶部](#-回到顶部)


SFC 的外部 JavaScript 模块使用 `.mjs`，避免加载器将其解释为 CommonJS；普通 HTML 示例使用原生模块脚本。可选浏览器验收需另外安装 Playwright 与 Chromium，然后运行 `node tests/browser.mjs`；这些测试依赖不属于静态站运行依赖。

## 🚀 快速开始

取得有权限访问的源码，在项目根目录执行：

```sh
node scripts/serve.mjs --port 8080
```

打开 `http://127.0.0.1:8080/`，页面应显示 25 个示例。选择“Vue 单文件组件”或“独立 HTML”，点击“打开示例”；例如“Element Plus · 表格筛选与本地数据”提供筛选、分页和页面内增删改。

没有安装步骤、前端打包步骤或业务登录。请使用 Node.js 20 或更新版本；若端口被占用，改用另一个 1024～65535 之间的端口。不支持双击 HTML 的 file 协议打开，因为目录、组件和演示 JSON 需要通过 HTTP 获取。

## 📦 安装

当前提供授权源码目录使用方式。GitHub 与 Gitee 源码仓均为私有仓，仅向已授权协作者开放；不发布 npm 包。`package.json` 的 private 标记用于防止误发布到包仓库。

本地与远端协作主线使用 `master`。Gitee 的 Git 操作使用 SSH，需先在账号中配置自己的公钥：

```sh
git clone --branch master git@gitee.com:halavah/libra-boot-vue.git
cd libra-boot-vue
```

维护者的 `origin` 配置同时推送 GitHub 与 Gitee 的 `master`；另保留名为 `gitee` 的 SSH 远端。远程默认分支由仓库所有者在平台设置中选择，不由示例脚本修改。

不需要执行 npm install。也可使用以下开发辅助命令：

```sh
npm start
npm run check
npm test
npm run scan
```

项目版本查看获授权的仓库标签或发布渠道；本说明不复制项目发行版本号。第三方依赖的准确版本与哈希记录在 docs/dependency-manifest.json。

## 🧩 示例内容

| 形式 | 分类 | 数量 | 演示内容 |
|---|---|---:|---|
| Vue 单文件组件 | Element Plus | 5 | 表格与 JSON、父子组件、外部 JS/CSS、图表、内联脚本 |
| Vue 单文件组件 | Ant Design Vue | 5 | 同主题的另一种 UI 实现，依赖按示例加载 |
| Vue 单文件组件 | Office | 3 | 本地 CSV 导出、文件选择与预览、带表单的文件校验 |
| 独立 HTML | Element Plus | 5 | 表格筛选、分页、模拟增删改、布局与导出 |
| 独立 HTML | Ant Design Vue | 1 | 表格与本地编辑状态 |
| 独立 HTML | ECharts | 3 | 多图仪表盘、分组柱形图、环形图及明细表 |
| 独立 HTML | Layui | 3 | 本地分页、筛选与日期、原生表单反馈 |

示例按原有技术主题以中性数据重新编写，不保留真实业务接口和认证流程。TypeScript 形式已改为普通 JavaScript，不提供 TypeScript、Less、SCSS 的运行时编译。未登记的历史示例和缺少入口的条目不展示。

## 🗂️ 目录结构

```text
libra-boot-vue/
├─ site/                         可直接托管的静态站点
│  ├─ index.html                 示例目录首页
│  ├─ catalog/                   SFC 与 HTML 入口清单
│  ├─ runtime/                   预览器和浏览器共享逻辑
│  ├─ examples/
│  │  ├─ sfc/                    Vue 组件示例
│  │  └─ html/                   独立 HTML 示例
│  └─ assets/
│     ├─ styles/                 公共样式
│     └─ vendor/                 已核验的第三方分发文件
├─ scripts/                      本地服务和检查命令
├─ tests/                        单元测试与浏览器验收
├─ docs/                         验收说明、依赖与迁移清单
├─ package.json                  统一开发命令
├─ LICENSE                       MIT
├─ THIRD_PARTY_NOTICES.md         第三方声明
├─ README.md                     中文说明
└─ README_EN.md                  英文说明
```

开发命令在工程根目录运行，服务自动定位 `site/`。修改示例进入 `site/examples/`，登记入口进入 `site/catalog/`，核对依赖进入 `docs/dependency-manifest.json`。示例按格式、组件库分组；例内 JS、CSS 和子组件的拆分用于演示模块组织，保留其教学作用。

## ⚙️ 运行机制

SFC 预览页只接受清单内的示例标识。Vue 和 vue3-sfc-loader 在浏览器获取并编译本地组件，Element Plus、Ant Design Vue、ECharts 等按依赖组加载。HTML 示例直接进入自己的页面，不依赖 Vue Router、Vite 或后端应用。

公共 JS/CSS 和脚本路径以 `site/` 为静态根提供。预览器拒绝外站依赖和未登记入口；静态服务只开放 `site/` 内的站点文件，拒绝点文件、目录穿越、符号链接及写请求。

Vue 模板与 SFC 加载器需要浏览器运行时编译。随附服务的内容安全策略因此允许 self 脚本与 unsafe-eval，样式允许库注入；这不是严格无 eval CSP 方案，也不是执行不可信组件的安全沙箱。仅运行维护者审核过的示例，不要与敏感业务应用共用来源。

## 🔐 数据与隐私

条目、名称、分组和统计值均为人工构造。筛选、编辑和删除只改变当前页面内存；重置或刷新还原，不设置业务 Cookie，不保存认证信息，也不把演示数据写入浏览器持久存储。

文件例子只读取本地 txt、csv、json，限制 1 MiB，最多显示 2000 个字符；页面没有上传服务。请使用自行构造的演示文件。清空后释放预览状态；CSV 导出会转义引号、逗号和公式起始字符。

第三方包版权和合法署名保留在其声明中。字体、截图、备份、环境配置和业务数据库不随工程分发。模式扫描不能证明绝对无敏感内容，公开或对外共享前仍需检查文件、依赖变更和示例输出。

## ✅ 验证与检查

```sh
node scripts/check.mjs
node --test tests/*.test.mjs
node scripts/scan-sensitive.mjs
```

check 校验目录、入口、局部引用、库文件摘要及许可记录；单元测试覆盖筛选、分页、CSV、文件限制、清单拒绝规则与 HTTP 静态服务边界。scan 对自有文本做模式检查，报告位置和类别，不打印疑似秘密值；第三方文件由摘要清单独立校验。

本地浏览器验收还应逐例检查控制台、请求、增删改、文件选择和导出，使用窄视口检查内容与焦点。命令通过不等于全部浏览器或真人无障碍验收通过；当前验收记录见 [验证说明](docs/verification.md)。

## 🧭 部署与排错

部署时只发布 `site/` 的内容，使用独立来源；`scripts/`、`tests/`、`docs/`、`.git`、归档和环境文件留在站点根之外。首页说明链接指向授权源码仓，阅读需仓库权限；保留正确 JavaScript、JSON、Vue 文本及字体 MIME 类型。此工程不自动创建云站点或部署到已有业务域名。

- **目录加载失败**：检查是否通过 HTTP 打开、服务根是否为 `site/`，以及 catalog 文件是否存在。
- **组件缺失**：运行 check，确认示例已登记及相对路径未被改坏。
- **图表或控件空白**：检查对应 vendor 文件与目录清单中的依赖组，不用真实 CDN 临时替代。
- **严格 CSP 拒绝 eval**：当前运行时编译方式不支持该策略；需要预编译方案，不能直接放宽敏感站点策略。
- **字体与地图文件提示**：仅分发控件所需图标字体；调试 source map 不分发，不是运行依赖。

## 🤝 贡献指南

私有仓协作者从独立分支提交改动并发起 PR；未来公开时可采用 Fork 流程。新示例必须有唯一清单标识、最小依赖组、完整资源和模拟数据，不允许写入实际口令、接口和个人记录。

修改共享逻辑后执行 check、tests、scan，再验收受影响的示例；依赖更新同时维护摘要与第三方声明。说明中分别记录已运行和未运行的检查，不用空页面凑齐示例数。

## 📄 License

自有代码采用 [MIT License](LICENSE)，第三方资源保留 [各自许可和声明](THIRD_PARTY_NOTICES.md)。

MIT 允许使用、修改、复制和分发自有代码，包括商业使用；分发时须保留版权与许可声明。软件按原样提供，不提供担保。选择 MIT 是为了便于复用示例；它不会替代第三方依赖的要求，也不把私有仓的读取权限自动开放给任何人。

## 📮 联系我们

维护者：[halavah](https://github.com/halavah)。协作者通过获授权仓库的 Issues 或 PR 反馈，附示例标识、复现步骤和不含私密信息的检查结果；不要在公开反馈中贴真实文件或业务数据。

## ⭐ Star History

当前为私有仓，不嵌入不可访问的 Stars、Release 或 Star History 图。若将来决定公开，再核对真实地址并添加对应公开渠道。

## ⬆ 回到顶部

---

用 ❤️ 构建 | Made with ❤️

若示例对你有帮助，欢迎在项目公开后关注与支持。

[回到顶部](#libra-boot-vue)
