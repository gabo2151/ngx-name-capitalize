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
// The range is derived, not hardcoded: the floor comes from the library's
// `peerDependencies`, the ceiling from whatever `@angular/core` currently
// publishes as `latest`. A new Angular major is therefore picked up automatically
// the day it ships — nothing here needs editing to widen support.
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
const BUNDLE = path.join(ROOT, 'dist/ngx-name-capitalize/fesm2022/ngx-name-capitalize.mjs');

const npm = (args, cwd) =>
  execFileSync('npm', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

/** Lowest Angular major the library's peerDependencies allow. */
function peerFloor() {
  const { peerDependencies } = JSON.parse(readFileSync(LIB_MANIFEST, 'utf8'));
  const range = peerDependencies['@angular/core'];
  const match = /(\d+)/.exec(range);
  if (!match) {
    throw new Error(`Could not read an Angular floor out of peer range "${range}"`);
  }
  return Number(match[1]);
}

/** Highest Angular major currently published. */
function latestMajor() {
  return Number(npm(['view', '@angular/core', 'version']).split('.')[0]);
}

/**
 * Links the bundle with one Angular version's compiler, in a throwaway install so
 * it never collides with the workspace's own Angular.
 */
async function verify(major, source) {
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
      filename: BUNDLE,
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

if (!existsSync(BUNDLE)) {
  console.error(`Bundle not found at ${BUNDLE}\nRun \`npm run build\` first.`);
  process.exit(1);
}

const requested = process.argv.slice(2).map(Number).filter(Number.isFinite);
const floor = peerFloor();
const majors =
  requested.length > 0
    ? requested
    : Array.from({ length: latestMajor() - floor + 1 }, (_, i) => floor + i);

console.log(`Linking the built bundle with Angular ${majors[0]}–${majors[majors.length - 1]}`);

const source = readFileSync(BUNDLE, 'utf8');
const results = [];
for (const major of majors) {
  results.push(await verify(major, source));
}

if (results.includes(false)) {
  console.error('\nCompatibility check FAILED. Either fix the library or narrow');
  console.error('`peerDependencies` in projects/ngx-name-capitalize/package.json.');
  process.exit(1);
}
console.log(`\nAll ${results.length} Angular majors link cleanly.`);
