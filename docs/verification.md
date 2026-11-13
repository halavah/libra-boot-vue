# Verification

Validation date: 2026-11-13. The catalogue contains 13 SFC and 12 HTML examples. All 25 passed local Chromium acceptance using a new temporary browser context and synthetic data. No existing browser profile, account or business service was used.

| Check | Result |
|---|---|
| `npm run check` | 25 entries, local references, dependency hashes and license records verified |
| `npm test` | 7 tests passed: filtering, pagination, CSV escaping, file constraints, catalogue identity, loader policy and local HTTP boundaries |
| `npm run scan` | Authored text checked for private paths, real service addresses, credential assignments and unwanted artifacts; vendored bytes checked separately by hash |
| `node tests/browser.mjs` | 25 examples passed; see the machine-readable [receipt](browser-receipt.json) |
| Browser requests | Zero external requests during acceptance |
| Narrow layout | All examples checked at 390 × 844 CSS pixels; no whole-page horizontal overflow |
| Negative cases | Invalid example identity rejected; missing/oversized/unsupported files rejected |

The browser checks exercised the declared interactions, including filtering, pagination, create/edit/delete, child events, CSV download, file preview/clear, charts and Layui rendering. Initial viewport was 1280 × 900. Sample screenshots were inspected locally; they are not distributed as source assets.

To repeat: use Node.js 20 or newer, run the three npm checks above, install Playwright separately with Chromium, and run `node tests/browser.mjs`. Optional environment variables select a Playwright module, Chromium executable and output directory; no machine-specific path is committed. Browser artifacts default to the ignored `artifacts` directory. SFC external ESM files use `.mjs`; Ant Design Vue loads its required Day.js plugins; the in-DOM Ant table uses a dynamic slot name to preserve case.

Not run: Firefox, WebKit, physical mobile devices, a full keyboard/screen-reader audit, production hosting, performance benchmarks and an exhaustive security audit. The final browser run used an isolated temporary profile with external requests blocked by the test harness; an OS sandbox was not used for that final run because it canceled file downloads. Passing tests and pattern scans do not establish absence of every vulnerability or sensitive value.

The project has no business backend, login, real upload endpoint or persistence. Runtime compilation requires a CSP that permits evaluation and inline styles. Only reviewed bundled examples are supported; this is not a sandbox for untrusted Vue code.

## Directory and serving boundaries

The repository has four working areas: `site/` contains the deployable website, `scripts/` contains local development commands, `tests/` contains automated acceptance, and `docs/` contains verification and provenance records. Start commands run from the repository root, while the HTTP document root is always `site/`. The server does not expose repository documentation, tooling or tests. Catalogue documentation links lead to the authorized source repository.

Inside `site/`, `catalog/` registers examples, `runtime/` implements the preview and shared browser modules, `examples/sfc/` and `examples/html/` hold the two formats, and `assets/styles/` and `assets/vendor/` contain styling and upstream distributions. Dependency file paths in `docs/dependency-manifest.json` are relative to the repository root; catalogue entry paths are relative to the site root. Vendored file contents and their hashes are unchanged by directory organization.

## Distribution privacy and Git

Static review covered all 151 tracked files at the implementation baseline: 147 UTF-8 text files and four upstream font binaries. Credential, production identifier and credential-bearing URL checks also covered all 108 unique historical blobs. No original business credential, production address, private filesystem path or personal record was identified. The private-address pattern in the upstream SFC loader matched V8 version strings, not network endpoints; the unmodified upstream bytes remain covered by the dependency hashes. All 35 vendored files matched their recorded SHA-256 digests. Necessary upstream copyright notices and the maintainer's public GitHub identity are retained.

Git uses `master` locally and for both push destinations. The Gitee SSH URL is `git@gitee.com:halavah/libra-boot-vue.git`; no access token or password is embedded in a remote URL. GitHub visibility is private, and Gitee anonymous repository access is denied. Remote default-branch selection remains with the owner. Pattern matching and manual review reduce disclosure risk but cannot prove the absence of every sensitive value. This static review did not rerun the browser tests or constitute an exhaustive security audit.
