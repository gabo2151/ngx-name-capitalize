#!/usr/bin/env node
//
// Verifies the *published artifact* against every Angular major this package
// claims to support.
//
// The unit tests run against src/ inside an Angular 16 workspace, which proves
// nothing about consumers on 17+. What a consumer's build actually does with this
// package is run the Angular linker over the shipped fesm bundle, turning the
// partial `ɵɵngDeclare*` declarations into real definitions. That is exactly what
// this script does, once per Angular major, so the compatibility table in the
// README is an assertion rather than a hope.
//
// The range is derived, not hardcoded: it is read straight out of the library's
// `peerDependencies`. On `main` there is no ceiling, so the range runs up to
// whatever `@angular/core` currently publishes — a new Angular major is picked up
// the day it ships, with nothing to edit here. On the `v1`/`v2` branches the peer
// range does carry a ceiling, and this stops there.
//
// The script is identical on all three branches. Keep it that way when backporting.
//
// Usage:
//   node scripts/verify-angular-compat.mjs         # floor .. latest
//   node scripts/verify-angular-compat.mjs 21 22   # only these majors

import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const LIB_MANIFEST = path.join(ROOT, 'projects/ngx-name-capitalize/package.json');
const DIST = path.join(ROOT, 'dist/ngx-name-capitalize');

const npm = (args, cwd) =>
  execFileSync('npm', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

/**
 * The flattened bundle a consumer's build actually loads. Read from the generated
 * manifest rather than hardcoded, because the file name tracks the emitted target
 * and differs per branch (`fesm2022` on main, `fesm2015` on the legacy lines).
 */
function findBundle() {
  const manifest = path.join(DIST, 'package.json');
  if (!existsSync(manifest)) {
    return null;
  }
  const pkg = JSON.parse(readFileSync(manifest, 'utf8'));
  const entry = pkg.module ?? pkg.exports?.['.']?.default;
  return entry ? path.join(DIST, entry) : null;
}

/**
 * The Angular majors the library's `peerDependencies` promise. The floor always
 * exists; a ceiling exists only on the legacy branches, where a newer line has
 * taken over above them. Without one, support runs to whatever Angular publishes
 * today — which is the point: a new Angular major needs no edit here.
 */
function declaredRange() {
  const { peerDependencies } = JSON.parse(readFileSync(LIB_MANIFEST, 'utf8'));
  const range = peerDependencies['@angular/core'];

  const floor = /(?:>=|\^|~)?\s*(\d+)/.exec(range);
  if (!floor) {
    throw new Error(`Could not read an Angular floor out of peer range "${range}"`);
  }

  const ceiling = /<\s*(\d+)/.exec(range);
  const latest = Number(npm(['view', '@angular/core', 'version']).split('.')[0]);

  return {
    from: Number(floor[1]),
    // `<16.0.0` means 15 is the last supported major.
    to: ceiling ? Math.min(Number(ceiling[1]) - 1, latest) : latest,
  };
}

/**
 * Links the bundle with one Angular version's compiler, in a throwaway install so
 * it never collides with the workspace's own Angular.
 */
async function verify(major, bundle, source) {
  const dir = mkdtempSync(path.join(tmpdir(), `ngx-namecase-ng${major}-`));
  try {
    writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify({ name: `compat-ng${major}`, private: true, version: '0.0.0' }),
    );
    npm(
      [
        'install',
        '--no-audit',
        '--no-fund',
        '--silent',
        '--no-package-lock',
        `@angular/compiler-cli@${major}`,
        `@angular/compiler@${major}`,
        '@babel/core',
      ],
      dir,
    );

    const require = createRequire(path.join(dir, 'noop.js'));
    const { transformSync } = await import(pathToFileURL(require.resolve('@babel/core')).href);
    const { createEs2015LinkerPlugin } = await import(
      pathToFileURL(require.resolve('@angular/compiler-cli/linker/babel')).href
    );
    const version = JSON.parse(
      readFileSync(require.resolve('@angular/compiler-cli/package.json'), 'utf8'),
    ).version;

    // The same minimal host @angular-devkit/build-angular hands the linker.
    const fileSystem = {
      resolve: (...p) => path.resolve(...p),
      exists: (p) => existsSync(p),
      dirname: (p) => path.dirname(p),
      relative: (from, to) => path.relative(from, to),
      readFile: (p) => readFileSync(p, 'utf8'),
    };
    const warnings = [];
    const logger = {
      debug: () => {},
      info: () => {},
      warn: (...a) => warnings.push(a.join(' ')),
      error: (...a) => warnings.push(a.join(' ')),
    };

    const { code } = transformSync(source, {
      filename: bundle,
      plugins: [createEs2015LinkerPlugin({ fileSystem, logger, linkerJitMode: false })],
      configFile: false,
      babelrc: false,
      compact: false,
    });

    const problems = [];
    if (!/definePipe\(/.test(code)) problems.push('no pipe definition emitted');
    if (!/defineNgModule\(/.test(code)) problems.push('no NgModule definition emitted');
    if (/ngDeclare/.test(code)) problems.push('partial declarations left unlinked');
    if (!/name:\s*"namecase"/.test(code)) problems.push('pipe is not named "namecase"');
    problems.push(...warnings);

    if (problems.length > 0) {
      console.log(`  ✗ Angular ${version}: ${problems.join('; ')}`);
      return false;
    }
    console.log(`  ✓ Angular ${version}`);
    return true;
  } catch (error) {
    console.log(`  ✗ Angular ${major}: ${String(error.message).split('\n')[0]}`);
    return false;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const bundle = findBundle();
if (!bundle || !existsSync(bundle)) {
  console.error(`No built bundle under ${DIST}\nRun \`npm run build\` first.`);
  process.exit(1);
}

const requested = process.argv.slice(2).map(Number).filter(Number.isFinite);
const majors =
  requested.length > 0
    ? requested
    : (() => {
        const { from, to } = declaredRange();
        return Array.from({ length: to - from + 1 }, (_, i) => from + i);
      })();

console.log(`Linking ${path.relative(ROOT, bundle)} with Angular ${majors.join(', ')}`);

const source = readFileSync(bundle, 'utf8');
const results = [];
for (const major of majors) {
  results.push(await verify(major, bundle, source));
}

if (results.includes(false)) {
  console.error('\nCompatibility check FAILED. Either fix the library or narrow');
  console.error('`peerDependencies` in projects/ngx-name-capitalize/package.json.');
  process.exit(1);
}
console.log(`\nAll ${results.length} Angular majors link cleanly.`);
