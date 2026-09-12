# Changelog — 2.x (Angular 14 – 15)

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

A **major** version of this package means one thing only: the minimum supported Angular
version went up. It is not an API break. Three lines are maintained in parallel — `3.x`
(Angular 16+, `main`), `2.x` (Angular 14 – 15, `v2`, this branch) and `1.x`
(Angular 12 – 13, `v1`) — and carry the same library source.

## [2.3.0] - unreleased

Mirrors 3.3.0 on `main`. A packaging and correctness release: the library code already
worked on both Angular 14 and 15, but the manifest only admitted to 14, and the pipe
quietly disabled one of the engine's options.

### Fixed

- **`peerDependencies` no longer pins a single Angular major.** The range was
  `^14.0.0`, which npm reads as `>=14.0.0 <15.0.0`, so `npm install` failed with
  `ERESOLVE` on **Angular 15** even though this line has always supported it and the
  README said so. It is now `>=14.0.0 <16.0.0`. The ceiling is deliberate: Angular 16
  and above are served by the `3.x` line.
- **The pipe no longer swallows nullish input before the engine sees it.** An
  `if (!value) return ''` guard made `strict` unreachable through the pipe: the option
  exists precisely to throw on missing input, and did nothing for exactly that case.
- **`transform` accepts `string | null | undefined`.** The signature said `string`, so
  under `strictTemplates` the ordinary template expressions (`user?.name`,
  `form.value.name`, `name$ | async`) failed to compile despite working at runtime.

### Changed

- **`name-capitalize` moved from `dependencies` to `peerDependencies`**, with an open
  `>=2.3.0` range. Applications can now upgrade the formatting engine without waiting
  for a release here, and an app that also uses `name-capitalize` directly resolves a
  single shared copy instead of two.
- **`strict` is pinned to `false` unless the caller passes it**, so the engine's
  announced default flip cannot start throwing inside consumers' templates.
- Minimum `name-capitalize` raised to `2.3.0`, the version that fixed typographic
  apostrophes, non-breaking spaces, Unicode dashes and titlecasing, and added `strict`
  and `particlesAfterHyphen`.

### Added

- Test suite (26 cases, 100% coverage enforced) covering formatting, nullish input,
  `strict`, every forwarded option, use inside a standalone component, and use through
  `NgxNameCapitalizeModule`. Previously `npm test` did not run at all.
- `scripts/verify-angular-compat.mjs`, which runs the Angular linker over the built
  bundle once per Angular major in the declared peer range — here 14 and 15.
- CI that actually runs: lint, typecheck, tests, build, the compatibility matrix, and a
  weekly canary against `name-capitalize@latest`. The previous workflow triggered on
  every push into a job gated on `github.event_name == 'release'`, so it reported green
  without checking anything.
- Staged npm releases (`npm stage publish --tag legacy-v2`), requiring manual 2FA
  approval, plus a guard that refuses to publish a non-2.x version from this branch.
- Biome for linting and formatting; `npm run verify` runs lint, README sync check,
  typecheck and tests.
- `CHANGELOG.md` and `RELEASING.md`.

### Internal

- Build and publish split across jobs, so Angular 14's CLI and npm trusted publishing
  each run on the Node version they require.
- The repo and npm READMEs are kept in sync by `scripts/sync-readme.mjs`, checked in CI.
- The root `package.json` is now `private` and carries no duplicated package metadata.

---

## [2.2.0] - 2026-07-18

### Added

- Optional `NameCapitalizeOptions` argument forwarded to the engine (`particles`,
  `extraParticles`, `ignoreParticles`, `mcPrefix`).
- `NameCapitalizeOptions` re-exported from the public API.

---

## [2.1.0] - 2026-04-29

### Changed

- Standardized README.

---

## [2.0.0] - 2026-04-29

Start of the Angular 14 – 15 line, with standalone pipe support.

### Added

- `NameCapitalizePipe`, a standalone pipe registered as `namecase`.
- `NgxNameCapitalizeModule` for NgModule-based applications.
