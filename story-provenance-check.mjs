#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const val = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const has = (name) => args.includes(name);

const storyPath = val('--story-bank', 'interview-prep/story-bank.md');
const cvPath = val('--cv', 'cv.md');

const STOP = new Set(['the','and','for','with','from','that','this','into','over','were','was','are','our','their','through','using','used','after','before','while','about']);
const CLAIMS = [
  { kind: 'percent', re: /\b\d+(?:\.\d+)?%/g },
  { kind: 'currency', re: /(?:\$|USD\s*)\d[\d,.]*(?:\s*[kKmMbB])?/g },
  { kind: 'plus-scale', re: /\b\d+\+\s+[A-Za-z][A-Za-z-]*/g },
  { kind: 'team-scale', re: /\b\d+[-\s](?:person|people|member|employee|user|customer|client|student|team|engineer)s?\b/gi },
  { kind: 'time-range', re: /\b\d+(?:\.\d+)?\s*(?:hours?|hrs?|days?|weeks?|months?)\s*(?:→|->|to)\s*\d+(?:\.\d+)?\s*(?:hours?|hrs?|days?|weeks?|months?)\b/gi },
];

function normalize(s) {
  return s.toLowerCase().replace(/[,]/g, '').replace(/\s+/g, ' ').trim();
}

function numbers(s) {
  return [...normalize(s).matchAll(/\d+(?:\.\d+)?/g)].map(m => Number(m[0]));
}

function words(s) {
  return normalize(s).match(/[a-z][a-z0-9-]{2,}/g)?.filter(w => !STOP.has(w)) ?? [];
}

function blocks(markdown) {
  const raw = markdown.split(/^###\s+/m).slice(1);
  return raw.map(chunk => {
    const lines = chunk.trim().split('\n');
    const title = lines.shift()?.trim() || 'Untitled';
    const body = lines.join('\n');
    const pm = body.match(/\*\*Provenance:\*\*\s*(.+)/i);
    return { title, body, provenance: pm?.[1]?.trim().toLowerCase() || null };
  });
}

function claims(text) {
  const out = [];
  for (const p of CLAIMS) {
    p.re.lastIndex = 0;
    let m;
    while ((m = p.re.exec(text))) out.push({ kind: p.kind, text: m[0], index: m.index });
  }
  const seen = new Set();
  return out.sort((a,b) => a.index-b.index).filter(c => {
    const k = `${c.index}:${normalize(c.text)}`;
    if (seen.has(k)) return false;
    seen.add(k); return true;
  });
}

function classify(claim, story, cv) {
  const prov = story.provenance || '';
  if (prov.includes('user-cannot-confirm')) return 'user-cannot-confirm';
  if (prov.startsWith('user-stated') || prov.includes('source: cv.md')) return 'existing';

  const ns = numbers(claim.text);
  const cvNs = numbers(cv);
  const allNumbersPresent = ns.length > 0 && ns.every(n => cvNs.includes(n));
  if (allNumbersPresent) {
    const cw = new Set(words(claim.text));
    if (cw.size === 0) return 'existing';
    const cvw = new Set(words(cv));
    const overlap = [...cw].filter(w => cvw.has(w)).length;
    if (overlap > 0) return 'existing';
  }

  const contextStart = Math.max(0, claim.index - 180);
  const contextEnd = Math.min(story.body.length, claim.index + claim.text.length + 180);
  const context = story.body.slice(contextStart, contextEnd);
  const ctxWords = [...new Set(words(context))];
  const cvWords = new Set(words(cv));
  const overlap = ctxWords.filter(w => cvWords.has(w)).length;
  if (overlap >= 4) return 'supportedByResume';
  return 'derived-unverified';
}

function run(storyText, cvText) {
  const findings = [];
  for (const story of blocks(storyText)) {
    for (const claim of claims(story.body)) {
      findings.push({ story: story.title, claim: claim.text, kind: claim.kind, status: classify(claim, story, cvText), provenance: story.provenance || 'absent' });
    }
  }
  return findings;
}

function selfTest() {
  const cv = '# CV\nManaged a 15-person team and improved conversion 20%.\n';
  const bank = `### [Leadership] Scale\n**Result:** Managed a 15-person team and improved conversion 20%.\n**Provenance:** source: cv.md\n\n### [Ops] Faster\n**Result:** Reduced processing from 8 hours to 2 hours for 500+ users.\n\n### [Unknown] Estimate\n**Result:** Saved 35%.\n**Provenance:** user-cannot-confirm\n`;
  const r = run(bank, cv);
  const ok = r.some(x => x.status === 'existing') && r.some(x => x.status === 'derived-unverified') && r.some(x => x.status === 'user-cannot-confirm');
  console.log(ok ? 'story-provenance-check self-test: PASS' : 'story-provenance-check self-test: FAIL');
  process.exitCode = ok ? 0 : 1;
}

if (has('--self-test')) {
  selfTest();
} else {
  if (!fs.existsSync(storyPath)) {
    console.error(`Story bank not found: ${storyPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(cvPath)) {
    console.error(`CV source not found: ${cvPath}`);
    process.exit(1);
  }
  const result = run(fs.readFileSync(storyPath, 'utf8'), fs.readFileSync(cvPath, 'utf8'));
  const counts = result.reduce((a, x) => (a[x.status] = (a[x.status] || 0) + 1, a), {});

  if (has('--json')) {
    console.log(JSON.stringify({ storyBank: path.resolve(storyPath), cv: path.resolve(cvPath), counts, findings: result }, null, 2));
  } else if (has('--summary')) {
    console.log('Story provenance summary');
    console.log(`Claims scanned: ${result.length}`);
    for (const k of ['existing','supportedByResume','derived-unverified','user-cannot-confirm']) console.log(`${k}: ${counts[k] || 0}`);
  } else {
    console.log('Story provenance audit\n');
    if (!result.length) console.log('No quantified story claims found.');
    for (const f of result) console.log(`[${f.status}] ${f.story} :: ${f.claim}`);
    console.log('\nRule: derived-unverified and user-cannot-confirm numbers must not be promoted into resumes, cover letters, or interview answers as verified facts.');
  }

  const unsafe = result.filter(x => x.status === 'derived-unverified' || x.status === 'user-cannot-confirm');
  if (has('--strict') && unsafe.length) process.exitCode = 2;
}
