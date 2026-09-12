# Releasing — `v2` branch (Angular 14 – 15)

Releases are staged automatically by GitHub Actions and then **approved by hand**.
Nothing reaches npm users until you approve it.

## Branch and version map

| Branch | npm tag | Angular | Version line |
| --- | --- | --- | --- |
| `main` | `latest` | 16 and above | 3.x |
| **`v2`** | **`legacy-v2`** | **14 – 15** | **2.x — this branch** |
| `v1` | `legacy-v1` | 12 – 13 | 1.x |

The major version tracks the **minimum supported Angular**, not API breakage. This
branch is the 2.x line, so its floor is Angular 14. Unlike `main`, it also carries a
**ceiling** (`<16.0.0`), because the 3.x line takes over above it.

This branch must **never** move the `latest` dist-tag. Angular 16+ users have to keep
resolving 3.x.

## Releases on this line are rare, and that is fine

Unlike `main`, this line's verified range cannot grow: it is 14 and 15, permanently. So
there is no "a new Angular shipped" release here. Expect to publish only when a fix is
backported from `main`.

The README still carries the verified range and the workflow badge, and the `compat` job
runs `--write` and **fails if the README claims a range CI did not link**. That is the
guard against the range drifting from reality once nobody is looking at this branch
regularly.

If long gaps between releases here start reading as abandonment, the honest fix is the
README's "Project status" section — which states plainly that this line is frozen by
design and points Angular 16+ users at `3.x` — not a version bump with nothing in it.

## Steps

1. **Bump the version** in `projects/ngx-name-capitalize/package.json`. It must stay on
   the `2.x` line — CI refuses to publish anything else from this branch. The root
   `package.json` is private and stays at `0.0.0`.
2. **Update `CHANGELOG.md`**: turn the `unreleased` heading into the version and today's
   date.
3. **Check it locally**:
   ```bash
   npm run verify   # lint + README sync + typecheck + tests
   npm run build
   npm run compat   # links the built bundle with Angular 14 and 15
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
7. **Confirm the dist-tags** afterwards. The publish passes `--tag legacy-v2`, but check
   that `latest` did not move:
   ```bash
   npm dist-tag ls ngx-name-capitalize
   npm dist-tag add ngx-name-capitalize@2.3.0 legacy-v2   # if it did not stick
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
- **This branch needs a ceiling; `main` does not.** `^14.0.0` means `>=14.0.0 <15.0.0`
  to npm, which is what made 2.2.0 uninstallable on Angular 15. The fix is
  `>=14.0.0 <16.0.0` — a floor *and* an explicit ceiling, because a newer line exists
  above this one. Never write `^`.
- **Publishing and building need different Node versions.** Angular 14's CLI wants an
  Angular-14-era Node; trusted publishing needs npm >= 11.5.1, which only ships with very
  recent Node. This is why `build` and `publish-npm` are separate jobs and the publish job
  never runs the Angular toolchain — it publishes the artifact the build job produced.
- **Compatibility is proven by the `compat` job, not by the build.** The unit tests run
  against `src/` inside an Angular 14 workspace, which says nothing about Angular 15.
  `scripts/verify-angular-compat.mjs` reads the peer range and links the shipped bundle
  the way a consumer's build does, once per major in that range.
- **`name-capitalize` is an open-ended peer dependency.** The weekly `engine-canary` job
  runs the suite against `name-capitalize@latest`. If it goes red, the engine changed
  under you; decide whether to adapt the pipe or add a ceiling to the peer range.
- **The pipe pins `strict: false`.** `name-capitalize` will flip that default in a future
  major. Do not "simplify" the pin away: it is what keeps that release from making
  `{{ user?.name | namecase }}` throw in applications that never changed a line.
- **This branch is downstream of `main`.** Fixes normally land on `main` first and are
  ported here. `scripts/verify-angular-compat.mjs`, the pipe and its spec are meant to be
  identical across all three branches; only the toolchain, the peer range and the npm tag
  differ.
