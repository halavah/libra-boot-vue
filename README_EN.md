<div align="center">

# Libra Boot Vue

**Build-free Vue examples, single-file component previews, and directly addressable HTML demos for frontend developers.**

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933)](https://nodejs.org/en/download)
[![JavaScript](https://img.shields.io/badge/JavaScript-browser-F7DF1E)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**English** | [简体中文](README.md)

</div>

> **This README follows the open-source documentation convention**: structure and badges use a consistent format, badges point only to publicly accessible resources, and release information belongs to the release channel.

## 📖 Contents

- [Quick start](#-quick-start)
- [Installation](#-installation)
- [Examples](#-examples)
- [Directory structure](#-directory-structure)
- [Runtime model](#-runtime-model)
- [Data and privacy](#-data-and-privacy)
- [Validation](#-validation)
- [Deployment and troubleshooting](#-deployment-and-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)
- [Star History](#-star-history)
- [Back to top](#-back-to-top)


External SFC JavaScript modules use `.mjs` so the loader treats them as ESM. HTML examples use native module scripts. Optional browser acceptance requires a separate Playwright and Chromium installation; run `node tests/browser.mjs`. These tools are not runtime dependencies of the static site.

## 🚀 Quick start

Obtain an authorized source checkout and run this command at the project root:

```sh
node scripts/serve.mjs --port 8080
```

Open `http://127.0.0.1:8080/`. The catalogue should contain 25 examples. Select an SFC or HTML example and open it; the Element Plus table example includes local filtering, paging, and editing.

There is no dependency installation, frontend build, or business login. Use Node.js 20 or newer. If the port is occupied, select another port between 1024 and 65535. Opening HTML via the file protocol is unsupported because catalogues, components, and demo JSON are fetched over HTTP.

## 📦 Installation

Use an authorized source directory. Both source repositories are private and require collaborator access. This project is not published as an npm package; the package private flag prevents accidental publication.

Use `master` as the local and remote collaboration branch. Gitee Git operations use SSH; register your own public key with your account first:

```sh
git clone --branch master git@gitee.com:halavah/libra-boot-vue.git
cd libra-boot-vue
```

The maintainer's `origin` pushes `master` to both GitHub and Gitee; a separate SSH remote named `gitee` is also retained. The repository owner selects the remote default branch in the hosting platform settings; example scripts do not change it.

No npm install is required. Optional convenience commands are:

```sh
npm start
npm run check
npm test
npm run scan
```

Consult the authorized repository tags or releases for the project version. Exact dependency versions and hashes are recorded separately in dependency-manifest.json.

## 🧩 Examples

| Format | Category | Count | Topics |
|---|---|---:|---|
| Vue SFC | Element Plus | 5 | Tables and JSON, child components, external JS/CSS, charts, inline scripts |
| Vue SFC | Ant Design Vue | 5 | Corresponding UI patterns with per-example dependencies |
| Vue SFC | Office | 3 | Local CSV export, file preview, and file form validation |
| HTML | Element Plus | 5 | Filtering, pagination, local CRUD, layout, and export |
| HTML | Ant Design Vue | 1 | Local table and editing state |
| HTML | ECharts | 3 | Dashboard, grouped bars, donut chart, and readable data tables |
| HTML | Layui | 3 | Local pagination, filtering and date controls, form feedback |

Examples were rewritten around the original technical topics using neutral data. Business authentication and services are absent. TypeScript patterns use ordinary JavaScript; no TypeScript, Less, or SCSS runtime compiler is provided. Missing and unregistered historical entries are not advertised as available examples.

## 🗂️ Directory structure

```text
libra-boot-vue/
├─ index.html                    Example catalogue
├─ catalog/                      SFC and HTML registrations
├─ runtime/                      Preview, dependency groups, shared demo logic
├─ examples/sfc/                 Vue, JS, CSS, children, and JSON
├─ examples/html/                Direct HTML pages and scripts
├─ public/vendor/                Verified upstream browser distributions
├─ public/styles/                Shared CSS
├─ scripts/                      Static server, reference and privacy checks
├─ tests/                        Data, catalogue, and server tests
├─ dependency-manifest.json      Versions, provenance, hashes, and licenses
├─ migration-manifest.json       Example topic mapping and exclusions
└─ THIRD_PARTY_NOTICES.md         Third-party notices
```

## ⚙️ Runtime model

The SFC preview accepts registered example identities only. Vue and vue3-sfc-loader fetch and compile trusted local components in the browser. UI and chart packages load by dependency group. HTML examples open their own pages without Vue Router, Vite, or an application backend.

The preview rejects external and unregistered resources. The included server exposes runtime directories and documentation only, denying dotfiles, traversal, symlinks, and writes.

Vue and the SFC loader require runtime compilation. The included CSP therefore permits self scripts plus unsafe-eval and library-injected styles. This is not a strict no-eval CSP implementation or a sandbox for untrusted components. Run reviewed examples on an origin separate from sensitive applications.

## 🔐 Data and privacy

Records, labels, groups, and statistics are synthetic. Filtering, editing, and deletion affect page memory only; reset or reload restores the initial data. No business cookies, authentication records, or persistent browser data are used.

File examples read local txt, csv, or json files up to 1 MiB and preview at most 2000 characters. They do not upload anything. Use synthetic files; clearing removes preview state. CSV export escapes delimiters, quotes, and spreadsheet formula prefixes.

Upstream attribution remains intact. Proprietary fonts, screenshots, backups, environment files, and business databases are excluded. Pattern scans cannot prove the absence of every sensitive value; review changes and generated output before sharing.

## ✅ Validation

```sh
node scripts/check.mjs
node --test tests/*.test.mjs
node scripts/scan-sensitive.mjs
```

check validates registrations, entries, local references, dependency hashes, and notices. Tests cover filtering, paging, CSV, file constraints, catalogue rejection, and HTTP serving boundaries. scan reports locations and categories without printing suspected secrets; vendor files are independently hash-verified.

Also test each example in a browser, inspecting errors, requests, CRUD, file input, and exports. Review narrow layouts and keyboard focus. Passing commands is not equivalent to cross-browser or human accessibility acceptance. See the [validation record](docs/verification.md) for the checks actually performed.

## 🧭 Deployment and troubleshooting

Keep the directory hierarchy and use a separate origin. Production hosting should expose runtime assets and public documentation only, not scripts, tests, .git, archives, or environment files. Preserve MIME types for JavaScript, JSON, Vue source text, and fonts. This project does not automatically create a cloud site or alter existing business domains.

- **Catalogue fails:** use HTTP and verify the project root and catalogue files.
- **Missing component:** run check and review the registered entry and relative paths.
- **Blank chart or widget:** check local vendor files and declared dependencies; do not substitute a live CDN ad hoc.
- **Strict CSP blocks eval:** this runtime compiler requires a different policy or a precompiled implementation. Do not relax a sensitive site's policy.
- **Font/source-map notices:** only upstream widget icon fonts are distributed. Debug source maps are omitted and are not runtime dependencies.

## 🤝 Contributing

Authorized collaborators work on a branch and submit a PR; a Fork workflow becomes relevant if the repository is made public. Add a unique registration, minimal dependencies, complete assets, and synthetic data for every new example.

After shared changes, run check, tests, and scan, then exercise affected examples. Dependency updates include provenance hashes and notices. State which checks ran and which did not; never fill the catalogue with empty placeholder pages.

## 📄 License

Project-authored code uses the [MIT License](LICENSE). Third-party assets keep their [own licenses and notices](THIRD_PARTY_NOTICES.md).

MIT permits use, modification, copying, and distribution, including commercial reuse, with copyright and permission notices retained. Software is provided as-is without warranty. MIT was selected to make examples easy to reuse; it neither overrides third-party obligations nor grants repository access to unauthorized readers.

## 📮 Contact

Maintainer: [halavah](https://github.com/halavah). Authorized collaborators can use repository Issues or PRs with the example identity, reproduction steps, and sanitized results. Do not post real files or business data in public feedback.

## ⭐ Star History

The repositories are private. Inaccessible stars, releases, and Star History graphics are not embedded. Revisit public channel links if visibility changes in the future.

## ⬆ Back to top

---

用 ❤️ 构建 | Made with ❤️

If these examples help, consider following and supporting the project when it becomes public.

[Back to top](#libra-boot-vue)
