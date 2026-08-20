#!/usr/bin/env node

import fs from 'node:fs';

const argv = process.argv.slice(2);
const get = (name, fallback = null) => {
  const i = argv.indexOf(name);
  if (i === -1 || argv[i + 1] == null) return fallback;
  return argv[i + 1];
};
const has = name => argv.includes(name);
const num = (name, fallback = 0) => {
  const raw = get(name, null);
  if (raw == null) return fallback;
  const n = Number(String(raw).replace(/[$,% ,]/g, ''));
  if (!Number.isFinite(n)) throw new Error(`Invalid number for ${name}: ${raw}`);
  return n;
};

function annualValue(o) {
  return o.base + o.bonus + o.equity + o.other - o.recurringCost;
}

function evaluate(input) {
  const years = Math.max(1, input.years || 1);
  const currentAnnual = annualValue(input.current);
  const offerAnnual = annualValue(input.offer);
  const annualDelta = offerAnnual - currentAnnual;
  const oneTimeNet = (input.offer.signOn || 0) + (input.offer.relocation || 0) - (input.offer.oneTimeCost || 0);
  const nominalDelta = annualDelta * years + oneTimeNet;
  const probability = Math.max(0, Math.min(1, input.probability ?? 1));
  const expectedDelta = nominalDelta * probability;
  const targetGap = input.target ? annualValue(input.target) - offerAnnual : null;
  const breakevenMonths = annualDelta > 0 && (input.offer.oneTimeCost || 0) > 0
    ? ((input.offer.oneTimeCost || 0) / annualDelta) * 12
    : null;

  return {
    years,
    currentAnnual,
    offerAnnual,
    annualDelta,
    annualDeltaPct: currentAnnual ? annualDelta / currentAnnual * 100 : null,
    oneTimeNet,
    nominalDelta,
    probability,
    expectedDelta,
    targetGap,
    breakevenMonths,
  };
}

function offerFrom(prefix) {
  return {
    base: num(`--${prefix}-base`),
    bonus: num(`--${prefix}-bonus`),
    equity: num(`--${prefix}-equity`),
    other: num(`--${prefix}-other`),
    recurringCost: num(`--${prefix}-cost`),
    signOn: num(`--${prefix}-signon`),
    relocation: num(`--${prefix}-relocation`),
    oneTimeCost: num(`--${prefix}-onetime-cost`),
  };
}

function money(n) {
  const sign = n < 0 ? '-' : '';
  return `${sign}$${Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function selfTest() {
  const r = evaluate({
    current: { base: 120000, bonus: 10000, equity: 10000, other: 0, recurringCost: 0 },
    offer: { base: 150000, bonus: 15000, equity: 20000, other: 0, recurringCost: 5000, signOn: 10000, relocation: 5000, oneTimeCost: 3000 },
    years: 2,
    probability: 0.8,
  });
  const ok = r.offerAnnual === 180000 && r.currentAnnual === 140000 && r.nominalDelta === 92000 && r.expectedDelta === 73600;
  console.log(ok ? 'negotiation-roi self-test: PASS' : 'negotiation-roi self-test: FAIL');
  process.exitCode = ok ? 0 : 1;
}

if (has('--self-test')) {
  selfTest();
} else {
  let input;
  const file = get('--file');
  if (file) {
    if (!fs.existsSync(file)) throw new Error(`Input file not found: ${file}`);
    input = JSON.parse(fs.readFileSync(file, 'utf8'));
  } else {
    input = {
      current: offerFrom('current'),
      offer: offerFrom('offer'),
      target: argv.some(x => x.startsWith('--target-')) ? offerFrom('target') : null,
      years: num('--years', 1),
      probability: num('--probability', 100) / 100,
    };
  }

  const r = evaluate(input);
  if (has('--json')) {
    console.log(JSON.stringify(r, null, 2));
  } else {
    console.log('Negotiation ROI\n');
    console.log(`Current annual value: ${money(r.currentAnnual)}`);
    console.log(`Offer annual value:   ${money(r.offerAnnual)}`);
    console.log(`Annual improvement:   ${money(r.annualDelta)}${r.annualDeltaPct == null ? '' : ` (${r.annualDeltaPct.toFixed(1)}%)`}`);
    console.log(`One-time net value:   ${money(r.oneTimeNet)}`);
    console.log(`${r.years}-year nominal delta: ${money(r.nominalDelta)}`);
    console.log(`Expected delta @ ${(r.probability * 100).toFixed(0)}%: ${money(r.expectedDelta)}`);
    if (r.targetGap != null) console.log(`Gap to target annual value: ${money(r.targetGap)}`);
    if (r.breakevenMonths != null) console.log(`Break-even on one-time cost: ${r.breakevenMonths.toFixed(1)} months`);
    console.log('\nUse this as a decision aid, not as a substitute for taxes, vesting schedules, benefit valuation, immigration constraints, or legal advice.');
  }
}
