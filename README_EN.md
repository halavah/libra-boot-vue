<div align="center">

# Libra Boot Vue

**A Vue example project retaining its original components, layouts, routing and static-page organization for developers to read, run and reuse.**

[![Vue](https://img.shields.io/badge/Vue-3-42b883)](https://vuejs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-browser-F7DF1E)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**English** | [简体中文](README.md)

</div>

> **This README follows the open-source documentation convention**: structure and badges use a consistent format, badges point only to publicly accessible resources, and release information belongs to the release channel.

## 📖 Contents

- [Quick start](#-quick-start)
- [Installation](#-installation)
- [Directories and entry points](#-directories-and-entry-points)
- [Examples and APIs](#-examples-and-apis)
- [Data and resources](#-data-and-resources)
- [Validation and troubleshooting](#-validation-and-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)
- [Star History](#-star-history)
- [Back to top](#-back-to-top)

## 🚀 Quick start

Prepare Node.js and pnpm. Run at the project root:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://127.0.0.1:5173/`. The homepage discovers systems, modules and pages. Choose a page to enter its layout; API-dependent examples also require your own service configuration.

```sh
pnpm build
pnpm preview
```

These are the original Vite commands. Output goes to `dist/`; a successful build does not establish that every business API works.

## 📦 Installation

Source repositories remain private. Obtain collaborator access and register your SSH public key:

```sh
git clone --branch master git@gitee.com:halavah/libra-boot-vue.git
cd libra-boot-vue
```

Local and remote collaboration use `master`. The maintainer synchronizes GitHub and Gitee and manually selects repository visibility and the remote default branch. No npm package or business backend is distributed. Refer to the authorized release channel for project versions.

## 🗂️ Directories and entry points

```text
libra-boot-vue/
├─ src/
│  ├─ App.vue                 Root component
│  ├─ Home.vue                Discovered-page overview
│  ├─ Home_bak.vue            Retained implementation
│  ├─ main.js                 Application entry
│  ├─ views/                  Base components and file examples
│  ├─ views2/                 HTML and component examples
│  ├─ views3/                 Charts and simulated-data examples
│  ├─ layouts/                Layouts and menus
│  ├─ router/                 Routes and retained implementation
│  ├─ mixins/                 Shared mixins
│  ├─ plugins/                Plugins
│  └─ assets/                 Source styles
├─ public/                    Browser resources and licenses
├─ test/                      Static catalogue and SFC preview
├─ index.html
├─ package.json
├─ pnpm-lock.yaml
├─ vite.config.js
├─ README.md
├─ README_EN.md
└─ LICENSE
```

Original directories, filenames, example boundaries, Vue sections and indentation are retained. Examples are not merged into a new architecture, and TypeScript examples remain TypeScript. Retained Home/router implementations and supporting files remain present.

`test/` is a manual static example catalogue, not an automated test suite. To inspect original static paths, run another HTTP server from the project root:

```sh
pnpm exec http-server . -p 5174
```

Open `http://127.0.0.1:5174/test/index.html`. It loads `public/` and source components directly. File-protocol access is unsupported; do not expose the full source directory as a public service.

## 🧩 Examples and APIs

Routes and menus are discovered from the remaining example directories. Layouts, plugins, mixins and static loaders remain. Former-company onboard examples and the root mock and docs directories are removed; simulated data within other examples remains.

Other examples retain their API integrations, including upload/export calls. The root Mock plugin and injection are removed; no local Mock service is provided. Real origins are replaced by unavailable examples such as `api.example.invalid`, and literal credentials are cleared. Local Vite proxies are configuration examples; their servers are not included. Request paths, methods, field keys and authentication call structure remain for users to configure their own services and test credentials. An unavailable example address is not a working replacement backend.

## 🔐 Data and resources

Personal records, contact details, organizations and industrial content use demonstration values. Replaced business labels use e-commerce shops, products, orders and after-sales terminology while retaining field keys, types, trees and interactions. Public region dictionaries are not treated as personal addresses.

Phone/identity placeholders deliberately cannot identify or contact a real person. Original strict validation may reject them; use synthetic data in your isolated environment rather than real personal data.

Retained business screenshots use neutral placeholders at the same paths with no original pixels or metadata. Two fonts with unverified redistribution permission are excluded; their stylesheet location remains with local-font fallback. Upstream browser files retain their notices and required licenses in their resource directories.

## ✅ Validation and troubleshooting

Run `pnpm build` to validate the production build. The test directory is a manual preview catalogue, not an automated test suite. A successful build does not validate backend, upload or authentication flows.

- API-dependent pages require your backend and proxy configuration.
- Missing static registrations are reported as source/catalogue discrepancies, not removed silently.
- Use your own test credentials for authorized file endpoints; none are embedded.
- Changed screenshots and fonts are deliberate content redaction, with source paths and component structure retained.
- Existing chunk-size and dependency-comment warnings do not authorize unrelated refactoring.

## 🤝 Contributing

Authorized collaborators branch from `master` and submit a PR. Preserve directories, naming, Vue sections, indentation and interactions; redaction is not a reason to rewrite, abstract or merge examples.

Check dependencies and references, build, exercise affected pages and state checks not run. Do not commit real credentials, personal records, unredacted screenshots, environment files or unlicensed fonts. Agree on scope before architectural changes.

## 📄 License

Project-authored code uses [MIT](LICENSE), permitting use, modification, commercial use and distribution while requiring retention of copyright and license notices, without warranty. MIT facilitates example reuse; third-party resources retain their own licenses.

## 📮 Contact

Maintainer: [halavah](https://github.com/halavah). Authorized collaborators can use repository Issues or PRs with file paths, reproduction steps and sanitized evidence. Do not upload real business records.

## ⭐ Star History

Repositories remain private, so inaccessible statistics graphics are omitted. Public channels can be configured after the maintainer approves publication.

## ⬆ Back to top

---

Made with ❤️. If the examples help, consider following and supporting the project when it becomes public.

[Back to top](#libra-boot-vue)
