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
