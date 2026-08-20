#!/usr/bin/env node

import fs from 'node:fs';
import { parseStories } from './match-star.mjs';

const args = process.argv.slice(2);
const has = f => args.includes(f);
const value = f => {
  const i = args.indexOf(f);
  if (i === -1) return undefined;
  if (i === args.length - 1 || args[i + 1].startsWith('--')) throw new Error(`${f} requires a value`);
  return args[i + 1];
};

const FREQ = { daily: 260, weekly: 52, biweekly: 26, 'bi-weekly': 26, monthly: 12, quarterly: 4, annually: 1, yearly: 1 };
const TIME_RE = /(\d+(?:\.\d+)?)\s*(hours?|hrs?|h)\b[^.\n\d]{0,40}?(?:down to|to|→|->|➞)\s*(\d+(?:\.\d+)?)\s*(hours?|hrs?|h)?\b/gi;
const PCT_RE = /(?:cut|reduced?|decreased?|dropped|shaved)[^.\n]{0,60}?by\s+(\d+(?:\.\d+)?)\s*%/gi;
const WAGE_RE = /\$\s?(\d+(?:\.\d+)?)\s*(?:\/|per\s+)\s*(?:hr|hour)\b/i;

function positive(raw, label) {
  if (raw == null) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`${label} must be a positive finite number`);
  return n;
}

function extract(text, story) {
  const out = [];
  let m;
  TIME_RE.lastIndex = 0;
  while ((m = TIME_RE.exec(text))) out.push({ story, type: 'time-reduction', raw: m[0], before: Number(m[1]), after: Number(m[3]), sentence: sentence(text, m.index, m.index + m[0].length) });
  PCT_RE.lastIndex = 0;
  while ((m = PCT_RE.exec(text))) out.push({ story, type: 'percent-reduction', raw: m[0], percent: Number(m[1]), sentence: sentence(text, m.index, m.index + m[0].length) });
  return out;
}

function sentence(text, start, end) {
  const left = text.lastIndexOf('. ', start);
  const right = text.indexOf('. ', end);
  return text.slice(left < 0 ? 0 : left + 2, right < 0 ? text.length : right + 1).trim();
}

function boundary(text, token) {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![\\d.])${escaped}(?![\\d.])`, 'i').test(text);
}

function verified(claim, cv) {
  if (claim.type === 'percent-reduction') return boundary(cv, `${claim.percent}%`) || boundary(cv, `${claim.percent} %`);
  const units = ['hour','hours','hr','hrs','h'];
  const one = units.some(u => boundary(cv, `${claim.before} ${u}`) || boundary(cv, `${claim.before}${u}`));
  const two = units.some(u => boundary(cv, `${claim.after} ${u}`) || boundary(cv, `${claim.after}${u}`));
  return one && two;
}

function frequency(text, cliFrequency, cliOccurrences) {
  const checks = [
    [/\bbi-?weekly\b|every\s+(?:other|two)\s+weeks?/i, 26],
    [/\bdaily\b|every\s+day|each\s+day/i, 260],
    [/\bweekly\b|every\s+week|each\s+week|once\s+a\s+week/i, 52],
    [/\bmonthly\b|every\s+month|each\s+month|once\s+a\s+month/i, 12],
    [/\bquarterly\b|every\s+quarter/i, 4],
    [/\bannually\b|\byearly\b|every\s+year|once\s+a\s+year/i, 1],
  ];
  for (const [re, n] of checks) if (re.test(text)) return { n, source: 'story text' };
  if (cliOccurrences != null) return { n: cliOccurrences, source: '--occurrences' };
  if (cliFrequency) return { n: FREQ[cliFrequency], source: `--frequency ${cliFrequency}` };
  return null;
}

function wage(text, cliWage) {
  const m = text.match(WAGE_RE);
  if (m) return { n: Number(m[1]), source: 'story text' };
  if (cliWage != null) return { n: cliWage, source: '--wage' };
  return null;
}

export function analyze(storyBank, cv, opts = {}) {
  const stories = parseStories(storyBank);
  const result = { storiesScanned: stories.length, claimsFound: 0, verified: 0, excludedUnverified: 0, calculable: [], uncalculable: [], warnings: [] };
  for (const s of stories) {
    const text = [s.situation, s.task, s.action, s.result, s.reflection].filter(Boolean).join(' ');
    const label = s.theme ? `[${s.theme}] ${s.title}` : s.title;
    for (const c of extract(text, label)) {
      result.claimsFound++;
      if (!verified(c, cv)) { result.excludedUnverified++; continue; }
      result.verified++;
      if (c.type !== 'time-reduction') {
        result.uncalculable.push({ story: c.story, achievement: c.sentence, reason: 'percent-only claim has no time baseline' });
        continue;
      }
      const hours = c.before - c.after;
      const w = wage(text, opts.wage);
      const f = frequency(text, opts.frequency, opts.occurrencesPerYear);
      if (!(hours > 0)) { result.uncalculable.push({ story: c.story, achievement: c.sentence, reason: 'not a time reduction' }); continue; }
      if (!w) { result.uncalculable.push({ story: c.story, achievement: c.sentence, reason: 'missing hourly-wage basis' }); continue; }
      if (!f) { result.uncalculable.push({ story: c.story, achievement: c.sentence, reason: 'missing task frequency' }); continue; }
      const annualValue = hours * w.n * f.n;
      result.calculable.push({ story: c.story, achievement: c.sentence, calculation: { hoursSavedPerOccurrence: hours, hourlyWage: w.n, occurrencesPerYear: f.n, annualValue, formula: `${hours}h × $${w.n}/hr × ${f.n}/year = $${annualValue.toLocaleString()}/year` }, draftParagraph: `Achievement: ${c.sentence}\nEstimated value: ${hours}h × $${w.n}/hr × ${f.n}/year = $${annualValue.toLocaleString()}/year\nNote: this is arithmetic only; confirm that the achievement context transfers to the target role before using it in negotiation.` });
    }
  }
  if (result.excludedUnverified) result.warnings.push(`${result.excludedUnverified} quantified claim(s) were excluded because matching figures were not found in cv.md.`);
  return result;
}

function selfTest() {
  const bank = `### [Ops] Automation\n**S (Situation):** Weekly reporting was manual.\n**T (Task):** Reduce time.\n**A (Action):** I cut the process from 8 hours to 2 hours, done weekly.\n**R (Result):** Capacity increased.\n**Reflection:** N/A\n`;
  const cv = '- Cut reporting from 8 hours to 2 hours.\n';
  const r = analyze(bank, cv, { wage: 50 });
  const ok = r.calculable.length === 1 && r.calculable[0].calculation.annualValue === 15600;
  console.log(ok ? 'negotiation-roi self-test: PASS' : 'negotiation-roi self-test: FAIL');
  process.exitCode = ok ? 0 : 1;
}

function main() {
  if (has('--self-test')) return selfTest();
  const wageArg = positive(value('--wage'), '--wage');
  const occArg = positive(value('--occurrences'), '--occurrences');
  const freqArg = value('--frequency') ?? null;
  if (freqArg && !Object.hasOwn(FREQ, freqArg)) throw new Error(`--frequency must be one of: ${Object.keys(FREQ).join(', ')}`);
  const storyPath = 'interview-prep/story-bank.md';
  const cvPath = 'cv.md';
  if (!fs.existsSync(storyPath)) throw new Error(`${storyPath} not found`);
  if (!fs.existsSync(cvPath)) throw new Error(`${cvPath} not found`);
  const r = analyze(fs.readFileSync(storyPath, 'utf8'), fs.readFileSync(cvPath, 'utf8'), { wage: wageArg, frequency: freqArg, occurrencesPerYear: occArg });
  if (has('--summary')) {
    console.log('NEGOTIATION ROI — verified achievement talking points\n');
    console.log(`Stories scanned: ${r.storiesScanned}`);
    console.log(`Claims found: ${r.claimsFound}`);
    console.log(`Verified: ${r.verified}`);
    console.log(`Excluded unverified: ${r.excludedUnverified}\n`);
    for (const c of r.calculable) console.log(`${c.story}\n${c.draftParagraph}\n`);
    for (const u of r.uncalculable) console.log(`Not calculable: ${u.story} — ${u.reason}`);
  } else console.log(JSON.stringify(r, null, 2));
}

try { main(); } catch (e) { console.error(`Error: ${e.message}`); process.exit(1); }
