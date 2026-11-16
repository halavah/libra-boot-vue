<a id="top"></a>
<div align="center">

# 🚀 Libra Boot Vue

**Vue examples for exploring component libraries, charts, file controls and directory-discovered navigation.**

[![Vue](https://img.shields.io/badge/Vue-component%20examples-42b883)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-development-646CFF)](https://vite.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**English** | [简体中文](README.md)

</div>

> This README follows the open-source documentation standard: consistent structure and badges, public badge resources only, and release-channel pages for current versions.

---

## 📖 Contents

- [Quick start](#quick-start)
- [Running examples](#screenshots)
- [Installation](#installation)
- [Examples and boundaries](#examples)
- [Structure](#structure)
- [Static preview](#static-preview)
- [Verification and troubleshooting](#verification)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Star History](#star-history)
- [Back to top](#back-to-top)

---

<a id="quick-start"></a>
## 🚀 Quick start

Use Node.js 22 or newer and pnpm 9 or newer. Run these commands from the project root after cloning the source:

```sh
pnpm install --frozen-lockfile
pnpm dev --host 127.0.0.1 --port 5173 --strictPort
```

Open `http://127.0.0.1:5173/`. The overview currently discovers three systems and 22 Vue pages. Expand system 3 and open `upload-file2` to inspect file-handling controls. Counts describe the current source, not a fixed public API.

If pnpm blocks dependency build scripts, review the named packages under your local pnpm policy; do not disable verification globally.

Vite serves the development application on port 5173. `--strictPort` stops startup if the port is occupied instead of silently changing the URL. Choose another explicit port if needed. Vue renders the components; Element Plus and Ant Design Vue provide controls, and ECharts renders charts.

<a id="screenshots"></a>
## 🖼️ Running examples

These are browser screenshots of the running project, using synthetic e-commerce data.

![Return-reason chart](assets/screenshots/returns-chart.png)
*`/layout/element/demo01`: local demonstration data rendered as a table and ECharts chart.*

![File-upload controls](assets/screenshots/file-upload.png)
*`/layout/upload-file2`: controls and layout are visible; this screenshot does not claim a successful backend upload.*

<a id="installation"></a>
## 📦 Installation

| Channel | Availability | Purpose |
|---|---|---|
| Authorized GitHub source | Private | Clone and run the project |
| Authorized Gitee source | Private | SSH mirror for collaborators |
| npm package / hosted backend | Not provided | This is a source example project |

Source code: [GitHub](https://github.com/halavah/libra-boot-vue) · [Gitee](https://gitee.com/halavah/libra-boot-vue). Both require repository access. The collaboration branch is `master`.

Documentation: this README contains the prerequisites, commands, entry points and limitations needed for the examples below. `pnpm dev` starts Vite, `pnpm build` compiles to `dist/`, and `pnpm preview` serves an existing build. Dependency installation uses the committed pnpm lockfile. Repository releases, when provided to collaborators, are the project-version channel.

<a id="examples"></a>
## 🧩 Examples and boundaries

| Entry | What it does | Backend needed? |
|---|---|---|
| `/` | Discover systems, search, navigate, export overview as Markdown/JSON | No |
| `/layout/element/demo01` | Render a local-data return-reason table and chart | No for this example |
| `/layout/ant-design-vue/demo01` | Alternative component-library example | Depends on the example |
| `/layout/upload-file2` | File, folder and Base64 upload controls | Yes for actual upload |
| `test/index.html` | Manual static catalogue and SFC loader | Depends on the target example |

There is no root Mock server. API placeholders such as `api.example.invalid` intentionally cannot reach a real service; localhost endpoints require your own backend. Field keys and call structures remain for integration. Synthetic values, image placeholders and locally available font fallbacks must not be mistaken for original business records.

<a id="structure"></a>
## 🗂️ Structure

```text
src/
├─ App.vue / Home.vue / main.js
├─ views/       # Element Plus, Ant Design Vue, file handling
├─ views2/      # HTML, communication, charts and trees
├─ views3/      # export / upload-file / upload-file2 / upload-form
├─ layouts/     # Systems, menus and tabs
├─ router/      # Directory-discovered routes
├─ mixins/ / plugins/
└─ assets/      # Styles and sanitized assets
public/         # Browser resources, region dictionary and licenses
test/           # Static catalogue and SFC loader
assets/screenshots/ # Screenshots in this README
```

<a id="static-preview"></a>
## 🌐 Static preview

For independent HTML and runtime SFC loading, serve the project root separately:

```sh
pnpm exec http-server . -a 127.0.0.1 -p 5174
```

Open `http://127.0.0.1:5174/test/index.html`. Keep port 5173 for Vite and port 5174 for the raw static loader. Loading SFC source through Vite is not equivalent to the raw loader. This catalogue is manual, not an automated test suite. Some inherited entries or stylesheet paths are missing; inspect the source path before using an entry. Do not expose the source root publicly.

The static catalogue still contains `ant-design-vue/demo06-less不可用` and `element/demo06-less不可用`, which have no matching SFC entry. Some HTML examples also reference absent stylesheet paths. The main Vite examples above are the supported minimal preview path; a static catalogue link is not a promise that every listed example runs.

<a id="verification"></a>
## ✅ Verification and troubleshooting

```sh
pnpm build
pnpm preview --host 127.0.0.1 --port 4173 --strictPort
```

Production output is `dist/`. Local verification covered the production build, three-system/four-file-page discovery, overview navigation, representative charts and file-control rendering. Upload completion, external authentication, all static entries and mobile/cross-browser compatibility were not validated. Existing dependency-comment, sourcemap and chunk-size warnings may appear; they do not justify unrelated refactoring.

<a id="contributing"></a>
## 🤝 Contributing

Authorized collaborators create a feature branch from `master`, validate their changes and submit a PR. Public repositories may be forked first. Keep changes focused and state the commands run and any checks omitted.

Preserve example boundaries, filenames, Vue sections and indentation. Check automatic routing, menu counts, static-preview links and both README languages. Use synthetic e-commerce data; do not commit real accounts, private endpoints, business screenshots, environment files or unlicensed fonts.

<a id="license"></a>
## 📄 License

[MIT License](LICENSE).

- ✅ Allows commercial use, modification, redistribution and private use.
- ⚠️ Keep the copyright and permission notice in copies or substantial portions. Third-party resources retain their own licenses.
- No warranty or liability is provided.

MIT keeps reuse straightforward while preserving attribution.

<a id="contact"></a>
## 📮 Contact

Maintainer: [halavah](https://github.com/halavah). Authorized collaborators can report problems through this repository’s Issues or PRs. Include paths, reproduction steps and sanitized evidence. Repository visibility is controlled by the maintainer.

<a id="star-history"></a>
## ⭐ Star History

The repository is private. No public repository-statistics badge or Star History image is embedded; these can be added and checked after publication.

<a id="back-to-top"></a>
## ⬆ Back to top

Made with ❤️. If this project helps you, consider giving it a Star.

[⬆ Back to top](#top)
