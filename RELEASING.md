# Releasing — `v1` branch (Angular 12 – 13)

Releases are staged automatically by GitHub Actions and then **approved by hand**.
Nothing reaches npm users until you approve it.

## Branch and version map

| Branch | npm tag | Angular | Version line |
| --- | --- | --- | --- |
| `main` | `latest` | 16 and above | 3.x |
| `v2` | `legacy-v2` | 14 – 15 | 2.x |
| **`v1`** | **`legacy-v1`** | **12 – 13** | **1.x — this branch** |

The major version tracks the **minimum supported Angular**, not API breakage. This
branch is the 1.x line, so its floor is Angular 12. Like `v2` and unlike `main`, it also
carries a **ceiling** (`<14.0.0`), because newer lines take over above it.

This branch must **never** move the `latest` dist-tag.

## Steps

1. **Bump the version** in `projects/ngx-name-capitalize/package.json`. It must stay on
   the `1.x` line — CI refuses to publish anything else from this branch. The root
   `package.json` is private and stays at `0.0.0`.
2. **Update `CHANGELOG.md`**: turn the `unreleased` heading into the version and today's
   date.
3. **Check it locally**:
   ```bash
   npm run verify   # lint + README sync + typecheck + tests
   npm run build
   npm run compat   # links the built bundle with Angular 12 and 13
   ```
4. **Commit and tag**:
   ```bash
   git commit -am "chore: release vX.Y.Z"
   git tag vX.Y.Z
   git push && git push --tags
   ```
5. **Create a GitHub release** for that tag (`gh release create vX.Y.Z --generate-notes`).
   Creating the release is what triggers the publish job — pushing the tag alone does
   nothing.
6. **Wait for CI**, then **approve the staged release**:
   ```bash
   npm stage list
   npm stage view <stage-id>     # inspect before approving
   npm stage approve <stage-id>  # asks for your 2FA
   ```
   To throw it away instead: `npm stage reject <stage-id>`.
7. **Confirm the dist-tags** afterwards. The publish passes `--tag legacy-v1`, but check
   that `latest` did not move:
   ```bash
   npm dist-tag ls ngx-name-capitalize
   npm dist-tag add ngx-name-capitalize@1.3.0 legacy-v1   # if it did not stick
   ```

### Why staged instead of publishing directly

The package uses npm **trusted publishing** (OIDC) — GitHub Actions authenticates without
any token stored in the repo. Staging adds a second lock: if the workflow or one of its
actions were ever compromised, the attacker could stage a malicious version but not make
it installable. Approval requires your 2FA, on your machine.

## Things that will bite you

- **Do not rename `.github/workflows/ci.yml`.** The npm trusted publisher is bound to
  the repository *plus that exact filename*. Renaming it breaks publishing with an
  authentication error that does not mention the filename at all.
- **This branch needs a ceiling; `main` does not.** `^12.2.0` means `>=12.2.0 <13.0.0`
  to npm, which is what made 1.2.0 uninstallable on Angular 13. The fix is
  `>=12.2.0 <14.0.0` — a floor *and* an explicit ceiling, because newer lines exist
  above this one. Never write `^`.
- **The engine is capped at `<2.0.0` on purpose.** `name-capitalize` 2.x requires
  Node 18; this branch exists for toolchains on Node 16. The weekly canary therefore
  tracks `name-capitalize@legacy` (the 1.x line), not `@latest`.
- **Publishing and building need different Node versions.** Angular 12's CLI supports
  Node 16 at the newest; trusted publishing needs npm >= 11.5.1, which only ships with
  very recent Node. This is why `build` and `publish-npm` are separate jobs and the
  publish job never runs the Angular toolchain — it publishes the artifact the build job
  produced, and its Node version says nothing about the library's own Node support.
- **Compatibility is proven by the `compat` job, not by the build.** The unit tests run
  against `src/` inside an Angular 12 workspace, which says nothing about Angular 13.
  `scripts/verify-angular-compat.mjs` reads the peer range and links the shipped bundle
  the way a consumer's build does, once per major in that range.
- **The pipe is not standalone here, and that is the only source difference.** Angular 12
  and 13 have no standalone pipes, so `NgxNameCapitalizeModule` uses `declarations` and
  the spec exercises the pipe through the module. Everything else — the pipe body, the
  compat script, the Jest setup — is meant to match `main`. Keep it that way when
  backporting; `jest-preset-angular` 12 is the exception, since it configures ts-jest
  through `globals` rather than per-transform options.
- **The pipe pins `strict: false`.** `name-capitalize` will flip that default in a future
  release. Do not "simplify" the pin away: it is what keeps that from making
  `{{ user?.name | namecase }}` throw in applications that never changed a line.
