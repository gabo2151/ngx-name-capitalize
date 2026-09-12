# Changelog — 1.x (Angular 12 – 13)

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

A **major** version of this package means one thing only: the minimum supported Angular
version went up. It is not an API break. Three lines are maintained in parallel — `3.x`
(Angular 16+, `main`), `2.x` (Angular 14 – 15, `v2`) and `1.x` (Angular 12 – 13, `v1`,
this branch) — and carry the same library source.

## [1.3.0] - 2026-09-12

Mirrors 3.3.0 on `main` and 2.3.0 on `v2`. A packaging and correctness release: the
library code already worked on both Angular 12 and 13, but the manifest only admitted to
12, and the pipe quietly disabled one of the engine's options.

### Fixed

- **`peerDependencies` no longer pins a single Angular major.** The range was
  `^12.2.0`, which npm reads as `>=12.2.0 <13.0.0`, so `npm install` failed with
  `ERESOLVE` on **Angular 13** even though this line has always supported it and the
  README said so. It is now `>=12.2.0 <14.0.0`. The ceiling is deliberate: Angular 14
  and above are served by the `2.x` and `3.x` lines.
- **The pipe no longer swallows nullish input before the engine sees it.** An
  `if (!value) return ''` guard made `strict` unreachable through the pipe: the option
  exists precisely to throw on missing input, and did nothing for exactly that case.
- **`transform` accepts `string | null | undefined`.** The signature said `string`, so
  under `strictTemplates` the ordinary template expressions (`user?.name`,
  `form.value.name`, `name$ | async`) failed to compile despite working at runtime.

### Changed

- **`name-capitalize` moved from `dependencies` to `peerDependencies`**, ranged
  `>=1.4.0 <2.0.0`. Applications can now upgrade the engine within the 1.x line without
  waiting for a release here, and an app that also uses `name-capitalize` directly
  resolves a single shared copy. The `<2.0.0` ceiling is deliberate: `name-capitalize`
  2.x requires Node 18, while this branch exists for toolchains on Node 16.
- Minimum `name-capitalize` raised to `1.4.0`, the legacy-line release that fixed
  typographic apostrophes, non-breaking spaces, Unicode dashes and titlecasing, and
  added `strict` and `particlesAfterHyphen`. The re-exported `NameCapitalizeOptions`
  type previously promised options a resolved `1.3.0` did not implement.
- **`strict` is pinned to `false` unless the caller passes it**, so an engine upgrade
  cannot start throwing inside consumers' templates.

### Added

- Test suite (25 cases, 100% coverage enforced) covering formatting, nullish input,
  `strict`, every forwarded option, and use through `NgxNameCapitalizeModule`.
  Previously `npm test` did not run at all.
- `scripts/verify-angular-compat.mjs`, which runs the Angular linker over the built
  bundle once per Angular major in the declared peer range — here 12 and 13.
- CI that actually runs: lint, typecheck, tests, build, the compatibility matrix, and a
  weekly canary against `name-capitalize@legacy`. The previous workflow triggered on
  every push into a job gated on `github.event_name == 'release'`, so it reported green
  without checking anything.
- Staged npm releases (`npm stage publish --tag legacy-v1`), requiring manual 2FA
  approval, plus a guard that refuses to publish a non-1.x version from this branch.
- Biome for linting and formatting; `npm run verify` runs lint, README sync check,
  typecheck and tests.
- `CHANGELOG.md` and `RELEASING.md`.

### Internal

- Build and publish split across jobs, so Angular 12's CLI and npm trusted publishing
  each run on the Node version they require.
- The repo and npm READMEs are kept in sync by `scripts/sync-readme.mjs`, checked in CI.
- The root `package.json` is now `private` and carries no duplicated package metadata.

---

## [1.2.0] - 2026-07-18

### Added

- Optional `NameCapitalizeOptions` argument forwarded to the engine (`particles`,
  `extraParticles`, `ignoreParticles`, `mcPrefix`).
- `NameCapitalizeOptions` re-exported from the public API.

---

## [1.1.1] - 2026-04-29

### Fixed

- Packaging corrections for the legacy line.

---

## [1.1.0] - 2026-04-29

### Changed

- Standardized README.

---

## [1.0.0] - 2026-04-29

Start of the Angular 12 – 13 line.

### Added

- `NameCapitalizePipe`, registered as `namecase` and declared by
  `NgxNameCapitalizeModule`. Angular 12 and 13 have no standalone pipes.
