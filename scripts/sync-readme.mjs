#!/usr/bin/env node
//
// There are two READMEs: the one GitHub shows (repo root) and the one npm ships
// (the library project, copied into the package by ng-packagr). They drifted
// apart once already and started documenting different Angular support.
//
// The root file is canonical; this copies it into the library before a build, and
// `--check` fails CI if the two are out of sync.

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SOURCE = path.join(ROOT, 'README.md');
const TARGET = path.join(ROOT, 'projects/ngx-name-capitalize/README.md');

const source = readFileSync(SOURCE, 'utf8');
const target = (() => {
  try {
    return readFileSync(TARGET, 'utf8');
  } catch {
    return null;
  }
})();

if (process.argv.includes('--check')) {
  if (source !== target) {
    console.error('README.md and projects/ngx-name-capitalize/README.md are out of sync.');
    console.error('Edit the root one, then run `npm run readme:sync`.');
    process.exit(1);
  }
  console.log('READMEs are in sync.');
} else if (source === target) {
  console.log('READMEs already in sync.');
} else {
  writeFileSync(TARGET, source);
  console.log('Copied README.md into projects/ngx-name-capitalize/.');
}
