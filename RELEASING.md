# Releasing

Releases are staged automatically by GitHub Actions and then **approved by hand**.
Nothing reaches npm users until you approve it.

## Branch and version map

| Branch | npm tag | Angular | Version line |
| --- | --- | --- | --- |
| `main` | `latest` | 16 and above | 3.x |
| `v2` | `legacy-v2` | 14 – 15 | 2.x |
| `v1` | `legacy-v1` | 12 – 13 | 1.x |

The major version tracks the **minimum supported Angular**, not API breakage. A new
major is cut only when that floor rises — so a 4.x/`v3` split would mean "main now
requires Angular 17+, and Angular 16 users stay on the `v3` branch".

**A new Angular release is never a reason to cut a major.** `main` declares
`@angular/core: ">=16.0.0"` with no upper bound, and CI links the built bundle against
every Angular major up to whatever is current. When Angular 23 ships, the weekly run
picks it up on its own; if it stays green, existing installs already work — nobody has
to wait for a release here.

## The usual release: a widened verified range

Most releases on this package will have no code change at all, and that is the intended
steady state. The trigger looks like this:

1. Angular ships a new major.
2. The weekly `compat` job links the **published** artifact against it.
3. If it passes, `record-verified-range` pushes a branch updating the README's verified
   range — generated from that run, not written by hand — and opens an issue with a
   one-click link to turn it into a pull request.
4. You open and merge it, then cut a **minor**.

It pushes a branch instead of calling `gh pr create` on purpose. Creating pull requests
from a workflow requires the repository's *"Allow GitHub Actions to create and approve
pull requests"* setting, which also lets Actions **approve** them. Pushing a branch needs
only `contents: write` and gets you to the same place, without widening what a
compromised workflow could do. Leave that setting off.

That release is not busywork and not version churn: the package now documents support it
did not document before, and the README is shipped content — it is what renders on the
npm page. Follow the steps below exactly as for any other release.

This matters beyond tidiness. A package that has not been published in two years reads as
abandoned, and people avoid it. This one will genuinely have nothing to fix for long
stretches, so the honest way to show it is alive is to publish *verification* on Angular's
cadence — roughly twice a year — rather than to invent changes.

The rule that keeps this honest: **every signal of activity must correspond to something
that was actually checked.** Never publish a version whose only purpose is refreshing the
date on npm, and never hand-edit the verified range to claim a version CI has not linked.

## Steps

1. **Bump the version** in `projects/ngx-name-capitalize/package.json`. The root
   `package.json` is private and stays at `0.0.0`.
2. **Update `CHANGELOG.md`**: turn the `unreleased` heading into the version and today's
   date.
3. **Check it locally**:
   ```bash
   npm run verify   # lint + README sync + typecheck + tests
   npm run build
   npm run compat   # links the built bundle with every supported Angular major
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
6. **Wait for CI.** It lints, typechecks, tests, builds, links the bundle against every
   supported Angular major, and then *stages* the release on npm.
7. **Approve it** (see below). Until you do, the version is not installable.
8. **Point the legacy tag at it** when releasing on `v1` or `v2`, since those do not move
   `latest`:
   ```bash
   npm dist-tag add ngx-name-capitalize@2.3.0 legacy-v2
   ```

## Approving a staged release

```bash
npm stage list                # find the stage-id
npm stage view <stage-id>     # inspect what is about to go live
npm stage approve <stage-id>  # asks for your 2FA
```

To throw it away instead: `npm stage reject <stage-id>`.

### Why staged instead of publishing directly

The package uses npm **trusted publishing** (OIDC) — GitHub Actions authenticates without
any token stored in the repo. Staging adds a second lock: if the workflow or one of its
actions were ever compromised, the attacker could stage a malicious version but not make
it installable. Approval requires your 2FA, on your machine.

## Things that will bite you

- **Do not rename `.github/workflows/ci.yml`.** The npm trusted publisher is bound to
  the repository *plus that exact filename*. Renaming it breaks publishing with an
  authentication error that does not mention the filename at all. The same applies on
  `v1` and `v2`, whose workflows must keep their own filenames.
- **`peerDependencies` has a floor, never a ceiling — on `main`.** `^16.0.0` means
  `>=16.0.0 <17.0.0` to npm, which is what made 3.2.0 uninstallable on Angular 17+
  despite working fine. The `v1` and `v2` branches *do* carry a ceiling, because a newer
  line exists above them; `main` never should.
- **Publishing and building need different Node versions.** Angular 16's CLI wants an
  Angular-16-era Node; trusted publishing needs npm >= 11.5.1, which only ships with
  very recent Node. This is why `build` and `publish-npm` are separate jobs and the
  publish job never runs the Angular toolchain — it publishes the artifact the build job
  produced.
- **Compatibility is proven by the `compat` job, not by the build.** The unit tests run
  against `src/` inside an Angular 16 workspace, which says nothing about Angular 22.
  `scripts/verify-angular-compat.mjs` runs the Angular linker over the shipped bundle the
  way a consumer's build does. If you change `peerDependencies`, that range is what the
  script reads — it needs no separate edit.
- **`name-capitalize` is an open-ended peer dependency.** Consumers can resolve an engine
  newer than this repo locks, so the weekly `engine-canary` job runs the suite against
  `name-capitalize@latest`. If it goes red, the engine changed under you; decide whether
  to adapt the pipe or add a ceiling to the peer range.
- **The pipe pins `strict: false`.** `name-capitalize` will flip that default in a future
  major. Do not "simplify" the pin away: it is what keeps that release from making
  `{{ user?.name | namecase }}` throw in applications that never changed a line.
- **Backport to `v2` and `v1`.** The three branches carry the same library source. A fix
  on `main` should normally be ported to both and released there too, each with its own
  Angular-appropriate toolchain and its own peer range.
