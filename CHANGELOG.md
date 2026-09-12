# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

A **major** version of this package means one thing only: the minimum supported Angular
version went up. It is not an API break. Three lines are maintained in parallel — `3.x`
(Angular 16+, `main`), `2.x` (Angular 14 – 15, `v2`) and `1.x` (Angular 12 – 13, `v1`) —
and carry the same library source.

## [3.3.0] - 2026-09-12

A packaging and correctness release. The library code was already compatible with
Angular 16 through 22; the manifest said otherwise and the pipe quietly disabled one of
the engine's options.

### Fixed

- **`peerDependencies` no longer pins a single Angular major.** The range was
  `^16.0.0`, which npm reads as `>=16.0.0 <17.0.0`, so `npm install` failed with
  `ERESOLVE` on Angular 17, 18, 19, 20, 21 and 22 even though the shipped bundle links
  cleanly on all of them. It is now `>=16.0.0`.
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
- **`strict` is pinned to `false` unless the caller passes it.** `name-capitalize` has
  announced that its own default will flip to `true` in a future major; with an open
  peer range that release would otherwise reach applications on its own and start
  throwing inside templates. Callers that pass `strict` explicitly still win.
- Minimum `name-capitalize` raised to `2.3.0`, which is the version that fixed
  typographic apostrophes, non-breaking spaces, Unicode dashes and titlecasing, and
  added `strict` and `particlesAfterHyphen`. The re-exported `NameCapitalizeOptions`
  type previously promised options a resolved `2.2.0` did not implement.

### Added

- Test suite (26 cases, 100% coverage enforced) covering formatting, nullish input,
  `strict`, every forwarded option, use inside a standalone component, and use through
  `NgxNameCapitalizeModule`. Previously `npm test` did not run: the workspace had no
  test target and the command exited with "Project target does not exist."
- `scripts/verify-angular-compat.mjs`, which runs the Angular linker over the built
  bundle once per Angular major, from the peer-range floor up to whatever
  `@angular/core` publishes as `latest`. The compatibility table is now an assertion
  rather than a claim, and a newly released Angular is picked up with no code change.
- CI that actually runs: lint, typecheck, tests, build, the compatibility matrix, and a
  weekly canary against `name-capitalize@latest`. The previous workflow triggered on
  every push into a job gated on `github.event_name == 'release'`, so it reported green
  without checking anything.
- Staged npm releases (`npm stage publish`): CI uploads the version and it becomes
  installable only after a manual `npm stage approve` with 2FA.
- Biome for linting and formatting; `npm run verify` runs lint, README sync check,
  typecheck and tests.
- `CHANGELOG.md` and `RELEASING.md`.

### Internal

- The build and publish steps were split across jobs: Angular 16's CLI needs an
  Angular-16-era Node, while npm trusted publishing needs npm >= 11.5.1. Each now runs
  on the Node it requires, instead of trying to satisfy both at once.
- The repo and npm READMEs are kept in sync by `scripts/sync-readme.mjs`, checked in CI.
  They had drifted into documenting different Angular support for the NgModule.
- The root `package.json` is now `private` and carries no duplicated package metadata.
  The published manifest lives solely in `projects/ngx-name-capitalize/package.json`.

---

## [3.2.0] - 2026-07-18

### Added

- Optional `NameCapitalizeOptions` argument forwarded to the engine (`particles`,
  `extraParticles`, `ignoreParticles`, `mcPrefix`).
- `NameCapitalizeOptions` re-exported from the public API.

---

## [3.1.0] - 2026-04-29

### Changed

- Standardized README.

---

## [3.0.0] - 2026-04-29

Start of the Angular 16+ line, with the standalone pipe as the primary pattern.

### Added

- `NameCapitalizePipe`, a standalone pipe registered as `namecase`.
- `NgxNameCapitalizeModule` for NgModule-based applications.
