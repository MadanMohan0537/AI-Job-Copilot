#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const SKIP = new Set(['.git','node_modules','.next','dist','build','coverage','output','reports']);
const EXT = new Set(['.js','.mjs','.cjs']);

function collect(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(p, out);
    else if (EXT.has(path.extname(entry.name))) out.push(p);
  }
  return out;
}

const files = collect(ROOT);
let failed = 0;
for (const file of files) {
  const rel = path.relative(ROOT, file);
  const r = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (r.status !== 0) {
    failed++;
    console.error(`FAIL ${rel}`);
    if (r.stderr) console.error(r.stderr.trim());
  }
}

if (failed) {
  console.error(`\nSyntax check failed: ${failed}/${files.length} files.`);
  process.exit(1);
}
console.log(`Syntax check passed: ${files.length} JavaScript files.`);
